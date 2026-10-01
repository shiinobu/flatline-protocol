import {
    Command,
    Events,
    Files,
    SaveStorage,
    Scheduler,
    Time,
    UI,
    type CommandAutoComplete,
    type CommandTools,
    type FileDefinition,
    type FileInfo,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";
import { injectCss, removeCss } from "./css-inject.js";
import { registerDebugCommand } from "./debug-gate.js";

type ComponentState = "ok" | "missing" | "corrupt" | "wrong";

interface BreachIntruder {
    ip: string;
    alias: string;
}

interface BreachState extends BreachIntruder {
    expectedBuild: string;
}

interface RecoveryInspection {
    moduleState: ComponentState;
    configState: ComponentState;
}

const BREACH_KEY = "rivalBreach";
const BREACH_WATCH_JOB = "flatline.rivalBreachWatch";
const BREACH_WATCH_REAL_MS = 1_500;
const MAX_TERMINAL_REQUESTS = 3;
const TERMINAL_APP = "Terminal";

const ROOT_NAME = "compositor";
const RECOVERY_ROOT = `~/${ROOT_NAME}`;
const MODULE_PATH = `${RECOVERY_ROOT}/modules/compositor.mod`;
const CONFIG_PATH = `${RECOVERY_ROOT}/config/display.cfg`;
const INCIDENT_LOG_PATH = `${RECOVERY_ROOT}/logs/incident.txt`;
const RECOVERY_DIR_PATH = `${RECOVERY_ROOT}/recovery`;

const BREACH_CSS_MARKER = "flatline-breach-blink";
const COMPOSITOR_VERSION = "4.12";
const COMPOSITOR_BUILDS: readonly string[] = ["r3187", "r3310", "r3402"];
const CONFIG_PROFILE_LINE = "profile=flatline";
const CONFIG_VERSION_LINE = `compositor=${COMPOSITOR_VERSION}`;
const VALID_CONFIG = ["# display profile", CONFIG_PROFILE_LINE, "refresh=60", CONFIG_VERSION_LINE].join("\n");
const CORRUPT_CONFIG = "@@ profile table overwritten by remote session @@\n0x00 0x00 0x00 unreadable";

const STATE_LABELS: Record<ComponentState, string> = {
    ok: "OK",
    missing: "MISSING",
    corrupt: "CORRUPT",
    wrong: "BUILD MISMATCH",
};

const BREACH_CSS = `
html, body { background: #000 !important; }
img[class*="_background_"] { visibility: hidden !important; }
.desktopBounds { background: #000 !important; }
.desktopIconHandler, .__file_inDesktop, [class*="modWidget"] { visibility: hidden !important; }
body::before {
    content: "RECOVERY MODE // RUN SYSDIAG";
    position: fixed;
    top: 8px;
    left: 12px;
    z-index: 2147483647;
    pointer-events: none;
    font: 11px Consolas, "Courier New", monospace;
    letter-spacing: 0.22em;
    color: #ff3b4e;
    text-shadow: 0 0 8px rgba(255, 59, 78, 0.7);
    animation: flatline-breach-blink 1.2s steps(1) infinite;
}
body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    pointer-events: none;
    background-color: rgba(255, 40, 70, 0);
    background-image: repeating-linear-gradient(0deg, rgba(255, 40, 70, 0.05) 0, rgba(255, 40, 70, 0.05) 1px, transparent 1px, transparent 3px);
    animation: flatline-breach-flash 0.9s ease-out 1;
}
@keyframes flatline-breach-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes flatline-breach-flash { 0% { background-color: rgba(255, 40, 70, 0.55); } 100% { background-color: rgba(255, 40, 70, 0); } }
`;

const LOCK_CSS_MARKER = "--flatline-lock";
const LOCK_CSS = `
.taskbar, .control-bar, .system-tray, .task-manager-panel { visibility: hidden !important; --flatline-lock: 1; }
.desktopBounds { pointer-events: none !important; }
.program:not([data-app="${TERMINAL_APP}"]) { visibility: hidden !important; pointer-events: none !important; }
.program[data-app="${TERMINAL_APP}"] { pointer-events: auto !important; }
.program[data-app="${TERMINAL_APP}"] [class*="_minimize_"], .program[data-app="${TERMINAL_APP}"] [class*="_close_"] { display: none !important; }
`;

type WatchPhase = "seeking" | "locked" | "failsafe";

let breachCssId: string | null = null;
let lockCssId: string | null = null;
let watchPhase: WatchPhase = "seeking";
let terminalRequests = 0;
let missingTicks = 0;
let terminalMissingLogged = false;

const getBreach = (): BreachState | null => SaveStorage.get<BreachState | null>(BREACH_KEY) ?? null;

export const isBreachActive = (): boolean => getBreach() !== null;

const applyBreachCss = (): void => {
    if (breachCssId !== null) return;

    breachCssId = injectCss(BREACH_CSS, BREACH_CSS_MARKER);
    trace("RIVALLAB", "breach css injected");
};

const clearBreachCss = (): void => {
    const hadId = breachCssId !== null;
    const swept = removeCss(breachCssId, BREACH_CSS_MARKER);
    breachCssId = null;
    if (hadId || swept > 0) trace("RIVALLAB", `breach css removed swept=${swept}`);
};

const setLocked = (locked: boolean): void => {
    if (locked === (lockCssId !== null)) return;

    if (locked) {
        lockCssId = injectCss(LOCK_CSS, LOCK_CSS_MARKER);
    } else {
        removeCss(lockCssId, LOCK_CSS_MARKER);
        lockCssId = null;
    }
    trace("RIVALLAB", `breach lock ${locked ? "engaged" : "released"}`);
};

const isElementVisible = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== "hidden";
};

const isTerminalVisible = (): boolean =>
    Array.from(document.querySelectorAll(`[data-app="${TERMINAL_APP}"]`)).some(isElementVisible);

const requestTerminal = (): void => {
    const icon = document.querySelector(`.desktopIcon_${TERMINAL_APP}`);
    if (icon === null) {
        if (!terminalMissingLogged) trace("RIVALLAB", "terminal shortcut not found on the desktop");
        terminalMissingLogged = true;
        return;
    }

    icon.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
    trace("RIVALLAB", "terminal open requested");
};

const advanceWatch = (): void => {
    if (isTerminalVisible()) {
        terminalRequests = 0;
        missingTicks = 0;
        watchPhase = "locked";
        setLocked(true);
        return;
    }

    missingTicks += 1;
    if (watchPhase === "locked" && missingTicks < 2) return;

    if (terminalRequests < MAX_TERMINAL_REQUESTS) {
        terminalRequests += 1;
        requestTerminal();
        return;
    }

    watchPhase = "failsafe";
    setLocked(false);
    trace("RIVALLAB", "no terminal available - lock released");
};

const runBreachWatch = (): void => {
    if (!isBreachActive() || watchPhase === "failsafe") return;

    advanceWatch();
    Scheduler.schedule(BREACH_WATCH_JOB, {}, { realMs: BREACH_WATCH_REAL_MS });
};

const startBreachWatch = (): void => {
    watchPhase = "seeking";
    terminalRequests = 0;
    missingTicks = 0;
    terminalMissingLogged = false;
    Scheduler.cancelKind(BREACH_WATCH_JOB);
    runBreachWatch();
};

const engageBreachVisuals = (): void => {
    applyBreachCss();
    setLocked(true);
    startBreachWatch();
};

const releaseBreachVisuals = (): void => {
    Scheduler.cancelKind(BREACH_WATCH_JOB);
    watchPhase = "seeking";
    setLocked(false);
    clearBreachCss();
};

const pickBuild = (): string => COMPOSITOR_BUILDS[Math.floor(Math.random() * COMPOSITOR_BUILDS.length)];

const clockAt = (offsetSeconds: number): string =>
    new Date(Time.now() + offsetSeconds * 1000).toISOString().slice(11, 19);

const buildIncidentLog = (breach: BreachState): string =>
    [
        `${clockAt(0)} compositord[812]: inbound session from ${breach.ip}:443 accepted`,
        `${clockAt(1)} compositord[812]: session ${breach.ip} holds uid 0`,
        `${clockAt(1)} compositor[1140]: loaded module compositor v${COMPOSITOR_VERSION} build ${breach.expectedBuild}`,
        `${clockAt(2)} compositor[1140]: remote session requested module unload`,
        `${clockAt(2)} compositor[1140]: ${MODULE_PATH} removed`,
        `${clockAt(3)} compositor[1140]: ${CONFIG_PATH} rewritten by remote session`,
        `${clockAt(3)} compositor[1140]: display.cfg: profile table unreadable`,
        `${clockAt(4)} compositord[812]: desktop session terminated`,
        `${clockAt(4)} compositord[812]: recovery tools available: sysdiag, sysrepair`,
        `${clockAt(5)} compositord[812]: session ${breach.ip} dropped by peer (${breach.alias})`,
    ].join("\n");

const buildRecoveryChildren = (breach: BreachState): FileDefinition[] => [
    {
        name: "logs",
        isFolder: true,
        children: [{ name: "incident", extension: "txt", data: buildIncidentLog(breach) }],
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

const seedRecoveryFolder = async (breach: BreachState): Promise<void> => {
    const root = await Files.getByPath(RECOVERY_ROOT);
    if (root === null) {
        await Files.createTree(Files.getHomePath(), [
            { name: ROOT_NAME, isFolder: true, children: buildRecoveryChildren(breach) },
        ]);
        return;
    }

    await removeChildren(root);
    await Files.createTree(`${Files.getHomePath()}/${ROOT_NAME}`, buildRecoveryChildren(breach));
};

const countDescendants = async (folder: FileInfo): Promise<number> => {
    let total = 0;
    for (const child of await Files.getChildren(folder.id)) {
        total += 1;
        if (child.isFolder) total += await countDescendants(child);
    }
    return total;
};

const countSeededNodes = async (): Promise<number> => {
    const root = await Files.getByPath(RECOVERY_ROOT);
    return root === null ? 0 : countDescendants(root);
};

const beginBreach = async (intruder: BreachIntruder): Promise<boolean> => {
    if (isBreachActive()) return false;

    const breach: BreachState = { ...intruder, expectedBuild: pickBuild() };
    SaveStorage.set(BREACH_KEY, breach);
    engageBreachVisuals();
    UI.toast("Desktop session compromised. Run: sysdiag", "error");

    try {
        await seedRecoveryFolder(breach);
    } catch (error: unknown) {
        dismissBreach();
        throw error;
    }

    const seededNodes = await countSeededNodes();
    trace(
        "RIVALLAB",
        `breach begun ip=${breach.ip} expectedBuild=${breach.expectedBuild} seededNodes=${seededNodes}`,
    );
    return true;
};

export const startBreach = async (intruder: BreachIntruder): Promise<boolean> => {
    try {
        return await beginBreach(intruder);
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        trace("RIVALLAB", `breach failed: ${reason}`);
        return false;
    }
};

export const dismissBreach = (): void => {
    SaveStorage.set(BREACH_KEY, null);
    releaseBreachVisuals();
};

const restoreDesktop = (): void => {
    dismissBreach();
    UI.toast("Desktop session restored.", "success");
    trace("RIVALLAB", "breach repaired");
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

const inspectRecovery = async (breach: BreachState): Promise<RecoveryInspection> => {
    const inspection: RecoveryInspection = {
        moduleState: await inspectModule(breach.expectedBuild),
        configState: await inspectConfig(),
    };
    trace("RIVALLAB", `inspect module=${inspection.moduleState} config=${inspection.configState}`);
    return inspection;
};

const isRepairable = (inspection: RecoveryInspection): boolean =>
    inspection.moduleState === "ok" && inspection.configState === "ok";

const printComponent = (tools: CommandTools, label: string, state: ComponentState, path: string): void => {
    const line = `${label.padEnd(18)}${STATE_LABELS[state].padEnd(16)}${path}`;
    if (state === "ok") tools.printSuccess(line);
    else tools.printError(line);
};

if (isDebug) {
    Scheduler.register(BREACH_WATCH_JOB, runBreachWatch);

    Events.on("Game.SessionStarted", () => {
        if (isBreachActive()) engageBreachVisuals();
        else releaseBreachVisuals();
    });

    if (isBreachActive()) engageBreachVisuals();
}

@registerDebugCommand({ default: true, scope: "local" })
export class SysDiagCommand extends Command {
    CommandName = "sysdiag";
    Description = "Check the desktop session after a compromise";
    Autocomplete: CommandAutoComplete[] = [{ label: "sysdiag", type: "STRING" }];

    async Run(tools: CommandTools) {
        if (Files.isRemoteSession()) {
            tools.printError("sysdiag only runs on this machine. Disconnect first.");
            return;
        }

        const breach = getBreach();
        if (breach === null) {
            tools.printSuccess("Desktop session healthy. Nothing to diagnose.");
            return;
        }

        const inspection = await inspectRecovery(breach);
        if (isRepairable(inspection)) tools.printWarning("DESKTOP SESSION OFFLINE - components verified");
        else tools.printError("DESKTOP SESSION OFFLINE");

        printComponent(tools, "display module", inspection.moduleState, MODULE_PATH);
        printComponent(tools, "display config", inspection.configState, CONFIG_PATH);
        tools.println(`${"incident log".padEnd(34)}${INCIDENT_LOG_PATH}`);
        tools.println(`${"recovery images".padEnd(34)}${RECOVERY_DIR_PATH}`);
        if (isRepairable(inspection)) tools.println("Run: sysrepair --rebuild");
    }
}

@registerDebugCommand({ default: true, scope: "local" })
export class SysRepairCommand extends Command {
    CommandName = "sysrepair";
    Description = "Rebuild the desktop session once its components are verified";
    Autocomplete: CommandAutoComplete[] = [
        { label: "sysrepair", type: "STRING" },
        { label: "--rebuild", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        if (Files.isRemoteSession()) {
            tools.printError("sysrepair only runs on this machine. Disconnect first.");
            return;
        }

        const breach = getBreach();
        if (breach === null) {
            tools.printWarning("Desktop session is healthy. Nothing to repair.");
            return;
        }

        if (!tools.getArgs().includes("--rebuild")) {
            tools.printError("Usage: sysrepair --rebuild");
            return;
        }

        if (!isRepairable(await inspectRecovery(breach))) {
            tools.printError("Rebuild refused: display module and config are not verified. Run: sysdiag");
            return;
        }

        restoreDesktop();
        tools.printSuccess("Display configuration verified. Desktop session restored.");
    }
}
