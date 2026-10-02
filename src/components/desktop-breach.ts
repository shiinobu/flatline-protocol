import {
    Events,
    Files,
    Random,
    SaveStorage,
    UI,
    type CommandTools,
    type FileDefinition,
    type FileInfo,
} from "@hotbunny/hackhub-content-sdk";

import { engageDesktopLock, releaseDesktopLock } from "./desktop-lock.js";
import { trace } from "../helpers/logger.js";

export type ComponentState = "ok" | "missing" | "corrupt" | "wrong";

export interface BreachText {
    readonly toastCompromised: string;
    readonly toastRestored: string;
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
    readonly labelIncident: string;
    readonly labelRecovery: string;
    readonly stateLabels: Readonly<Record<ComponentState, string>>;
}

export interface BreachSpec {
    readonly scope: string;
    readonly mission: string;
    readonly ip: string;
    readonly alias: string;
    readonly buildIncidentLog: (expectedBuild: string, ip: string) => string;
}

interface BreachState {
    readonly scope: string;
    readonly mission: string;
    readonly ip: string;
    readonly alias: string;
    readonly expectedBuild: string;
}

const BREACH_KEY = "flatline.desktopBreach";
const ROOT_NAME = "compositor";
const RECOVERY_ROOT = `~/${ROOT_NAME}`;
const MODULE_PATH = `${RECOVERY_ROOT}/modules/compositor.mod`;
const CONFIG_PATH = `${RECOVERY_ROOT}/config/display.cfg`;
const INCIDENT_LOG_PATH = `${RECOVERY_ROOT}/logs/incident.txt`;
const RECOVERY_DIR_PATH = `${RECOVERY_ROOT}/recovery`;

export const COMPOSITOR_VERSION = "4.12";
export const COMPOSITOR_BUILDS: readonly string[] = ["r3187", "r3310", "r3402"];
export const INCIDENT_FILE_NAME = "incident";
export const INCIDENT_FILE_EXTENSION = "txt";

const CONFIG_PROFILE_LINE = "profile=flatline";
const CONFIG_VERSION_LINE = `compositor=${COMPOSITOR_VERSION}`;
const VALID_CONFIG = ["# display profile", CONFIG_PROFILE_LINE, "refresh=60", CONFIG_VERSION_LINE].join("\n");
const CORRUPT_CONFIG = "@@ profile table overwritten by remote session @@\n0x00 0x00 0x00 unreadable";

const storedBreach = (): BreachState | null => SaveStorage.get<BreachState | null>(BREACH_KEY) ?? null;

export const isBreachActive = (): boolean => storedBreach() !== null;
export const breachMission = (): string | null => storedBreach()?.mission ?? null;
export const breachExpectedBuild = (): string | null => storedBreach()?.expectedBuild ?? null;

const pickBuild = (): string => COMPOSITOR_BUILDS[Random.number(0, COMPOSITOR_BUILDS.length - 1)];

const buildRecoveryChildren = (breach: BreachState, spec: BreachSpec): FileDefinition[] => [
    {
        name: "logs",
        isFolder: true,
        children: [
            {
                name: INCIDENT_FILE_NAME,
                extension: INCIDENT_FILE_EXTENSION,
                data: spec.buildIncidentLog(breach.expectedBuild, breach.ip),
            },
        ],
    },
    { name: "modules", isFolder: true, children: [] },
    {
        name: "config",
        isFolder: true,
        children: [{ name: "display", extension: "cfg", data: CORRUPT_CONFIG }],
    },
    {
        name: "recovery",
        isFolder: true,
        children: [
            ...COMPOSITOR_BUILDS.map((build) => ({
                name: `compositor-${build}`,
                extension: "mod",
                data: `COMPOSITOR ${COMPOSITOR_VERSION} build ${build}`,
            })),
            { name: "display-backup", extension: "cfg", data: VALID_CONFIG },
        ],
    },
];

const removeTree = async (file: FileInfo): Promise<void> => {
    if (file.isFolder) {
        for (const child of await Files.getChildren(file.id)) await removeTree(child);
    }
    Files.remove(file.id);
};

const removeChildren = async (folder: FileInfo): Promise<void> => {
    for (const child of await Files.getChildren(folder.id)) await removeTree(child);
};

const seedRecoveryFolder = async (breach: BreachState, spec: BreachSpec): Promise<void> => {
    const root = await Files.getByPath(RECOVERY_ROOT);
    if (root === null) {
        await Files.createTree(Files.getHomePath(), [
            { name: ROOT_NAME, isFolder: true, children: buildRecoveryChildren(breach, spec) },
        ]);
        return;
    }

    await removeChildren(root);
    await Files.createTree(`${Files.getHomePath()}/${ROOT_NAME}`, buildRecoveryChildren(breach, spec));
};

const beginBreach = async (spec: BreachSpec, text: BreachText): Promise<boolean> => {
    if (isBreachActive()) return false;

    const breach: BreachState = {
        scope: spec.scope,
        mission: spec.mission,
        ip: spec.ip,
        alias: spec.alias,
        expectedBuild: pickBuild(),
    };
    SaveStorage.set(BREACH_KEY, breach);
    engageDesktopLock();
    UI.toast(text.toastCompromised, "error");

    try {
        await seedRecoveryFolder(breach, spec);
    } catch (error: unknown) {
        dismissBreach();
        throw error;
    }

    trace(spec.scope, `breach begun ip=${breach.ip} expectedBuild=${breach.expectedBuild}`);
    return true;
};

export const startBreach = async (spec: BreachSpec, text: BreachText): Promise<boolean> => {
    try {
        return await beginBreach(spec, text);
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        trace(spec.scope, `breach failed: ${reason}`);
        return false;
    }
};

export const dismissBreach = (): void => {
    SaveStorage.set(BREACH_KEY, null);
    releaseDesktopLock();
};

const readText = async (path: string): Promise<string | null> => {
    const file = await Files.getByPath(path);
    return file === null ? null : Files.read(file.id) ?? "";
};

const inspectModule = async (expectedBuild: string): Promise<ComponentState> => {
    const text = await readText(MODULE_PATH);
    if (text === null) return "missing";
    return text.includes(`build ${expectedBuild}`) ? "ok" : "wrong";
};

const inspectConfig = async (): Promise<ComponentState> => {
    const text = await readText(CONFIG_PATH);
    if (text === null) return "missing";
    return text.includes(CONFIG_PROFILE_LINE) && text.includes(CONFIG_VERSION_LINE) ? "ok" : "corrupt";
};

export interface RecoveryInspection {
    readonly moduleState: ComponentState;
    readonly configState: ComponentState;
}

export const inspectRecovery = async (): Promise<RecoveryInspection | null> => {
    const breach = storedBreach();
    if (breach === null) return null;

    const inspection: RecoveryInspection = {
        moduleState: await inspectModule(breach.expectedBuild),
        configState: await inspectConfig(),
    };
    trace(breach.scope, `inspect module=${inspection.moduleState} config=${inspection.configState}`);
    return inspection;
};

export const isRepairable = (inspection: RecoveryInspection): boolean =>
    inspection.moduleState === "ok" && inspection.configState === "ok";

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

export const printDiagnosis = (
    tools: CommandTools,
    text: BreachText,
    inspection: RecoveryInspection,
): void => {
    if (isRepairable(inspection)) tools.printWarning(text.diagVerified);
    else tools.printError(text.diagOffline);

    printComponent(tools, text, text.labelModule, inspection.moduleState, MODULE_PATH);
    printComponent(tools, text, text.labelConfig, inspection.configState, CONFIG_PATH);
    tools.println(`${text.labelIncident.padEnd(34)}${INCIDENT_LOG_PATH}`);
    tools.println(`${text.labelRecovery.padEnd(34)}${RECOVERY_DIR_PATH}`);
    if (isRepairable(inspection)) tools.println(text.diagRunRepair);
};

export const DESKTOP_RESTORED_EVENT = "flatline.desktop.restored";

export const restoreDesktop = (text: BreachText): void => {
    const breach = storedBreach();
    dismissBreach();
    UI.toast(text.toastRestored, "success");
    if (breach === null) return;

    trace(breach.scope, "breach repaired");
    Events.emit(DESKTOP_RESTORED_EVENT, { mission: breach.mission, ip: breach.ip });
};

Events.on("Game.SessionStarted", () => {
    if (isBreachActive()) engageDesktopLock();
    else releaseDesktopLock();
});
