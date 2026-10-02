import { Scheduler } from "@hotbunny/hackhub-content-sdk";

import { injectCss, removeCss } from "./css-inject.js";
import { trace } from "../helpers/logger.js";

const TERMINAL_APP = "Terminal";
const WATCH_JOB = "flatline.desktopLock.watch";
const WATCH_REAL_MS = 1500;
const MAX_TERMINAL_REQUESTS = 3;
const LOCK_CSS_MARKER = "--flatline-lock";
const BREACH_CSS_MARKER = "flatline-breach-blink";

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
let isLockWanted = false;

const applyBreachCss = (): void => {
    if (breachCssId !== null) return;

    breachCssId = injectCss(BREACH_CSS, BREACH_CSS_MARKER);
    trace("LOCK", "breach css injected");
};

const clearBreachCss = (): void => {
    const hadId = breachCssId !== null;
    const swept = removeCss(breachCssId, BREACH_CSS_MARKER);
    breachCssId = null;
    if (hadId || swept > 0) trace("LOCK", `breach css removed swept=${swept}`);
};

const setLocked = (locked: boolean): void => {
    if (locked === (lockCssId !== null)) return;

    if (locked) {
        lockCssId = injectCss(LOCK_CSS, LOCK_CSS_MARKER);
    } else {
        removeCss(lockCssId, LOCK_CSS_MARKER);
        lockCssId = null;
    }
    trace("LOCK", `desktop lock ${locked ? "engaged" : "released"}`);
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
        if (!terminalMissingLogged) trace("LOCK", "terminal shortcut not found on the desktop");
        terminalMissingLogged = true;
        return;
    }

    icon.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, view: window }));
    trace("LOCK", "terminal open requested");
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
    trace("LOCK", "no terminal available - lock released");
};

const runWatch = (): void => {
    if (!isLockWanted || watchPhase === "failsafe") return;

    advanceWatch();
    Scheduler.schedule(WATCH_JOB, {}, { realMs: WATCH_REAL_MS });
};

Scheduler.register(WATCH_JOB, runWatch);

export const engageDesktopLock = (): void => {
    isLockWanted = true;
    watchPhase = "seeking";
    terminalRequests = 0;
    missingTicks = 0;
    terminalMissingLogged = false;
    applyBreachCss();
    setLocked(true);
    Scheduler.cancelKind(WATCH_JOB);
    runWatch();
};

export const releaseDesktopLock = (): void => {
    isLockWanted = false;
    Scheduler.cancelKind(WATCH_JOB);
    watchPhase = "seeking";
    setLocked(false);
    clearBreachCss();
};
