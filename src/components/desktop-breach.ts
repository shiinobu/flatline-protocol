import { Events, Files, SaveStorage, Scheduler, UI, type CommandTools } from "@hotbunny/hackhub-content-sdk";

import { engageDesktopLock, releaseDesktopLock, sweepLegacyLock } from "./desktop-lock.js";
import { burstDesktop, setGlitchLevel } from "./desktop-glitch.js";
import { dismissIncidentBanner } from "./incident-banner.js";
import {
    emptyFolder,
    ensureFolder,
    readKernelFile,
    removeFolderIfEmpty,
    removeKernelFile,
    removeTree,
    writeKernelFile,
    writeKernelLog,
} from "./kernel-files.js";
import {
    BACKUP_FILE,
    CONFIG_FILE,
    CORRUPT_CONFIG,
    FLCOMP_ABI,
    FLCOMP_STALE_ABI,
    FLCOMP_VERMAGIC,
    INCIDENT_FILE,
    INITRAMFS_FILE,
    KERNEL_LAYOUT,
    MODULE_FILE,
    RECOVERY_FOLDER,
    buildConfig,
    buildInitramfs,
    buildModuleImage,
    imageFile,
    parseFields,
    rollImages,
    type ImageRoll,
    type KernelLayout,
} from "./kernel-layout.js";
import { parseLog, type LogDay } from "./log-file.js";
import {
    RECOVERY_FINISHED_EVENT,
    RECOVERY_READY_EVENT,
    closeRecoveryConsole,
    openRecoveryConsole,
    setRecoveryFailureHandler,
    setRecoveryStage,
} from "./recovery-widget.js";
import { trace } from "../helpers/logger.js";

export type ComponentState = "ok" | "missing" | "corrupt" | "wrong" | "stale";

export interface BreachText {
    readonly toastRestored: string;
    readonly toastConsoleFailed: string;
    readonly diagHealthy: string;
    readonly diagOffline: string;
    readonly diagVerified: string;
    readonly diagRunRepair: string;
    readonly repairHealthy: string;
    readonly repairUsage: string;
    readonly repairRefused: string;
    readonly repairDone: string;
    readonly remoteOnly: string;
    readonly labelModule: string;
    readonly labelConfig: string;
    readonly labelInitramfs: string;
    readonly labelIncident: string;
    readonly labelRecovery: string;
    readonly stateLabels: Readonly<Record<ComponentState, string>>;
}

export interface BreachSpec {
    readonly scope: string;
    readonly mission: string;
    readonly ip: string;
    readonly alias: string;
    readonly buildIncidentLog: (expectedSrcversion: string, ip: string) => string;
    readonly logDay?: LogDay;
}

interface BreachState {
    readonly version: number;
    readonly scope: string;
    readonly mission: string;
    readonly ip: string;
    readonly alias: string;
    readonly expectedBuild: string;
    readonly expectedSrcversion: string;
    readonly layout: KernelLayout;
    readonly incidentLog?: string;
    readonly created?: readonly string[];
}

interface PurgePayload {
    readonly created: readonly string[];
}

export interface RecoveryInspection {
    readonly moduleState: ComponentState;
    readonly configState: ComponentState;
    readonly initramfsState: ComponentState;
}

export const DESKTOP_RESTORED_EVENT = "flatline.desktop.restored";

const BREACH_KEY = "flatline.desktopBreach";
const BREACH_STATE_VERSION = 2;
const CUT_JOB = "flatline.desktopBreach.cut";
const CLEANUP_JOB = "flatline.desktopBreach.cleanup";
const PURGE_JOB = "flatline.desktopBreach.purge";
const PURGE_REAL_MS = 300;
const LEAD_IN_REAL_MS = 1100;
const LEAD_IN_POWER = 3;
const RESTORE_POWER = 2.4;
const LEGACY_FOLDER = "~/compositor";
const INITRAMFS_EMPTY = "none";

let textProvider: (() => BreachText) | null = null;

export const registerBreachText = (provider: () => BreachText): void => {
    textProvider = provider;
};

const rawState = (): BreachState | null => SaveStorage.get<BreachState | null>(BREACH_KEY) ?? null;

const storedBreach = (): BreachState | null => {
    const raw = rawState();
    return raw !== null && raw.version === BREACH_STATE_VERSION ? raw : null;
};

export const isBreachActive = (): boolean => storedBreach() !== null;

const writeIncidentLog = (text: string, logDay: LogDay | undefined): Promise<readonly string[]> =>
    logDay === undefined ? writeKernelFile(INCIDENT_FILE, text) : writeKernelLog(INCIDENT_FILE, parseLog(text, logDay));

const seedKernelFiles = async (
    roll: ImageRoll,
    incidentLog: string,
    logDay: LogDay | undefined,
): Promise<readonly string[]> => {
    const created: string[] = [];
    await removeKernelFile(MODULE_FILE);
    created.push(...(await ensureFolder(MODULE_FILE.folder)));
    created.push(...(await writeKernelFile(CONFIG_FILE, CORRUPT_CONFIG)));
    await emptyFolder(RECOVERY_FOLDER);
    created.push(...(await ensureFolder(RECOVERY_FOLDER)));
    for (const image of roll.images) {
        const data = buildModuleImage(image.srcversion, image.vermagic);
        created.push(...(await writeKernelFile(imageFile(image.build), data)));
    }
    created.push(...(await writeKernelFile(BACKUP_FILE, buildConfig(FLCOMP_STALE_ABI))));
    created.push(...(await writeKernelFile(INITRAMFS_FILE, buildInitramfs(INITRAMFS_EMPTY))));
    created.push(...(await writeIncidentLog(incidentLog, logDay)));
    return created;
};

const runPurge = async (payload: PurgePayload): Promise<void> => {
    await removeKernelFile(MODULE_FILE);
    await removeKernelFile(CONFIG_FILE);
    await removeKernelFile(BACKUP_FILE);
    await removeKernelFile(INITRAMFS_FILE);
    await emptyFolder(RECOVERY_FOLDER);
    for (const path of [...payload.created].reverse()) await removeFolderIfEmpty(path);
    trace("BREACH", "removed the recovery files, kept the incident log");
};

Scheduler.register<PurgePayload>(PURGE_JOB, (payload) => runPurge(payload));

const schedulePurge = (created: readonly string[]): void => {
    Scheduler.schedule(PURGE_JOB, { created }, { realMs: PURGE_REAL_MS });
};

const runCut = (): void => {
    if (storedBreach() === null) return;

    dismissIncidentBanner();
    setGlitchLevel(0);
    engageDesktopLock();
    openRecoveryConsole();
    trace("BREACH", "desktop cut, recovery console requested");
};

const runCleanup = async (): Promise<void> => {
    const legacy = await Files.getByPath(LEGACY_FOLDER);
    if (legacy === null) return;

    await removeTree(legacy);
    trace("BREACH", `removed the old ${LEGACY_FOLDER} folder`);
};

Scheduler.register(CUT_JOB, runCut);
Scheduler.register(CLEANUP_JOB, () => runCleanup());

const scheduleLegacyCleanup = (): void => {
    Scheduler.cancelKind(CLEANUP_JOB);
    Scheduler.schedule(CLEANUP_JOB, {}, { realMs: 100 });
};

const beginBreach = async (spec: BreachSpec): Promise<boolean> => {
    if (isBreachActive()) return false;

    const roll = rollImages();
    const incidentLog = spec.buildIncidentLog(roll.expectedSrcversion, spec.ip);
    const breach: BreachState = {
        version: BREACH_STATE_VERSION,
        scope: spec.scope,
        mission: spec.mission,
        ip: spec.ip,
        alias: spec.alias,
        expectedBuild: roll.expectedBuild,
        expectedSrcversion: roll.expectedSrcversion,
        layout: KERNEL_LAYOUT,
        incidentLog,
    };
    SaveStorage.set(BREACH_KEY, breach);
    setRecoveryStage("falling");

    try {
        const created = await seedKernelFiles(roll, incidentLog, spec.logDay);
        SaveStorage.set(BREACH_KEY, { ...breach, created });
    } catch (error: unknown) {
        dismissBreach();
        throw error;
    }

    setGlitchLevel(3);
    burstDesktop(LEAD_IN_POWER);
    Scheduler.cancelKind(CUT_JOB);
    Scheduler.schedule(CUT_JOB, {}, { realMs: LEAD_IN_REAL_MS });
    trace(spec.scope, `breach begun ip=${breach.ip} expectedBuild=${breach.expectedBuild}`);
    return true;
};

export const startBreach = async (spec: BreachSpec): Promise<boolean> => {
    try {
        return await beginBreach(spec);
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        trace(spec.scope, `breach failed: ${reason}`);
        return false;
    }
};

export const dismissBreach = (): void => {
    Scheduler.cancelKind(CUT_JOB);
    SaveStorage.set(BREACH_KEY, null);
    setRecoveryStage(null);
    closeRecoveryConsole();
    releaseDesktopLock();
    setGlitchLevel(0);
};

export const resetBreach = (): void => {
    const breach = storedBreach();
    dismissBreach();
    if (breach !== null) schedulePurge(breach.created ?? []);
    scheduleLegacyCleanup();
};

const inspectModule = async (breach: BreachState): Promise<{ readonly state: ComponentState; readonly srcversion: string | null }> => {
    const text = await readKernelFile(MODULE_FILE);
    if (text === null) return { state: "missing", srcversion: null };

    const fields = parseFields(text);
    const srcversion = fields.srcversion ?? null;
    const matches = srcversion === breach.expectedSrcversion && fields.vermagic === FLCOMP_VERMAGIC;
    return { state: matches ? "ok" : "wrong", srcversion };
};

const inspectConfig = async (): Promise<ComponentState> => {
    const text = await readKernelFile(CONFIG_FILE);
    if (text === null) return "missing";

    const fields = parseFields(text);
    if (fields.profile === "flatline" && fields.abi === FLCOMP_ABI) return "ok";
    return fields.profile === undefined ? "corrupt" : "stale";
};

const inspectInitramfs = async (loaded: string | null): Promise<ComponentState> => {
    const text = await readKernelFile(INITRAMFS_FILE);
    if (text === null) return "missing";

    const recorded = parseFields(text).flcomp;
    return loaded !== null && recorded === loaded ? "ok" : "stale";
};

export const inspectRecovery = async (): Promise<RecoveryInspection | null> => {
    const breach = storedBreach();
    if (breach === null) return null;

    const module = await inspectModule(breach);
    const inspection: RecoveryInspection = {
        moduleState: module.state,
        configState: await inspectConfig(),
        initramfsState: await inspectInitramfs(module.srcversion),
    };
    trace(
        breach.scope,
        `inspect module=${module.state} config=${inspection.configState} initramfs=${inspection.initramfsState}`,
    );
    return inspection;
};

export const isRepairable = (inspection: RecoveryInspection): boolean =>
    inspection.moduleState === "ok" && inspection.configState === "ok" && inspection.initramfsState === "ok";

const printComponent = (
    tools: CommandTools,
    text: BreachText,
    label: string,
    state: ComponentState,
    path: string,
): void => {
    const line = `${label.padEnd(18)}${text.stateLabels[state].padEnd(16)}${path}`;
    if (state === "ok") tools.printSuccess(line);
    else tools.printError(line);
};

export const printDiagnosis = (tools: CommandTools, text: BreachText, inspection: RecoveryInspection): void => {
    if (isRepairable(inspection)) tools.printWarning(text.diagVerified);
    else tools.printError(text.diagOffline);

    printComponent(tools, text, text.labelModule, inspection.moduleState, KERNEL_LAYOUT.modulePath);
    printComponent(tools, text, text.labelConfig, inspection.configState, KERNEL_LAYOUT.configPath);
    printComponent(tools, text, text.labelInitramfs, inspection.initramfsState, KERNEL_LAYOUT.initramfsPath);
    tools.println(`${text.labelIncident.padEnd(34)}${KERNEL_LAYOUT.incidentPath}`);
    tools.println(`${text.labelRecovery.padEnd(34)}${KERNEL_LAYOUT.recoveryDir}`);
    if (isRepairable(inspection)) tools.println(text.diagRunRepair);
};

export const restoreDesktop = (text: BreachText): void => {
    const breach = storedBreach();
    dismissBreach();
    burstDesktop(RESTORE_POWER);
    UI.toast(text.toastRestored, "success");
    if (breach === null) return;

    schedulePurge(breach.created ?? []);
    trace(breach.scope, "breach repaired");
    Events.emit(DESKTOP_RESTORED_EVENT, { mission: breach.mission, ip: breach.ip });
};

const withText = (action: (text: BreachText) => void): void => {
    if (textProvider === null) {
        trace("BREACH", "no text provider registered");
        return;
    }

    action(textProvider());
};

setRecoveryFailureHandler(() => {
    releaseDesktopLock();
    withText((text) => UI.toast(text.toastConsoleFailed, "warning"));
});

Events.on(RECOVERY_READY_EVENT, () => {
    if (isBreachActive()) return;

    trace("BREACH", "console opened with no active breach, closing it");
    closeRecoveryConsole();
    releaseDesktopLock();
});

Events.on(RECOVERY_FINISHED_EVENT, () => {
    if (!isBreachActive()) return;

    withText(restoreDesktop);
});

Events.on("Game.SessionStarted", () => {
    const raw = rawState();
    if (raw !== null && raw.version !== BREACH_STATE_VERSION) {
        SaveStorage.set(BREACH_KEY, null);
        sweepLegacyLock();
        scheduleLegacyCleanup();
        trace("BREACH", "dropped a breach saved by an older build");
    }

    if (isBreachActive()) {
        engageDesktopLock();
        openRecoveryConsole();
        return;
    }

    setRecoveryStage(null);
    closeRecoveryConsole();
    releaseDesktopLock();
});
