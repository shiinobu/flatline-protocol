import { Desktop, Events, SaveStorage, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { injectCss, removeCss } from "./css-inject.js";
import { isDesktopMounted, onSessionLeft } from "./session-guard.js";
import { trace } from "../helpers/logger.js";

declare module "@hotbunny/hackhub-content-sdk" {
    interface ModEventMap {
        "flatline.recovery.ready": null;
        "flatline.recovery.logRead": { readonly path: string };
        "flatline.recovery.finished": null;
    }
}

export type RecoveryStage = "falling" | "recovery" | "rising";

export const RECOVERY_READY_EVENT = "flatline.recovery.ready";
export const RECOVERY_LOG_READ_EVENT = "flatline.recovery.logRead";
export const RECOVERY_FINISHED_EVENT = "flatline.recovery.finished";
export const RECOVERY_STAGE_KEY = "flatline.recovery.stage";

const WIDGET_ID = "flatline.recoveryConsole";
const WIDGET_SRC = "components/recovery-console.html";
const FRAME_MARKER = "FLATLINE_RECOVERY_CONSOLE";
const BOUNDS_SELECTOR = ".desktopBounds";
const HOST_CLASS = "flatline-recovery-host";
const HOST_CSS_MARKER = "--flatline-recovery-host";
const READY_JOB = "flatline.recovery.readyCheck";
const READY_TIMEOUT_REAL_MS = 8000;

const hostCss = (top: number): string => `
.${HOST_CLASS} {
    position: fixed !important;
    left: 0 !important;
    top: ${top}px !important;
    width: 100vw !important;
    height: calc(100vh - ${top}px) !important;
    z-index: 2147483000 !important;
    ${HOST_CSS_MARKER}: 1;
}
`;

let hostCssId: string | null = null;
let consoleReady = false;
let failureHandler: (() => void) | null = null;

export const setRecoveryFailureHandler = (handler: () => void): void => {
    failureHandler = handler;
};

export const setRecoveryStage = (stage: RecoveryStage | null): void => {
    SaveStorage.set(RECOVERY_STAGE_KEY, stage);
};

const widgetExists = (): boolean => Desktop.getWidgets().some((widget) => widget.id === WIDGET_ID);

const findFrame = (): HTMLIFrameElement | undefined =>
    Array.from(document.querySelectorAll("iframe")).find((frame) => frame.srcdoc.includes(FRAME_MARKER));

const tagHost = (): void => {
    const host = findFrame()?.parentElement;
    if (host === null || host === undefined) {
        trace("RECOVERY", "console frame not found, keeping the fixed size");
        return;
    }

    host.classList.add(HOST_CLASS);
    const rect = host.getBoundingClientRect();
    trace(
        "RECOVERY",
        `host at ${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)} in viewport ${window.innerWidth}x${window.innerHeight}`,
    );
};

const scheduleReadyCheck = (): void => {
    Scheduler.cancelKind(READY_JOB);
    Scheduler.schedule(READY_JOB, {}, { realMs: READY_TIMEOUT_REAL_MS });
};

const desktopTop = (): number => {
    const bounds = document.querySelector<HTMLElement>(BOUNDS_SELECTOR);
    return bounds === null ? 0 : Math.max(0, Math.round(bounds.getBoundingClientRect().top));
};

export const openRecoveryConsole = (): void => {
    if (!isDesktopMounted()) return;

    if (widgetExists()) {
        if (!consoleReady && Scheduler.list(READY_JOB).length === 0) scheduleReadyCheck();
        return;
    }

    consoleReady = false;
    const top = desktopTop();
    const width = window.innerWidth;
    const height = Math.max(0, window.innerHeight - top);
    hostCssId = injectCss(hostCss(top), HOST_CSS_MARKER);
    Desktop.addWidget({
        id: WIDGET_ID,
        src: WIDGET_SRC,
        width,
        height,
        position: { x: 0, y: 0 },
        transparent: false,
    });
    scheduleReadyCheck();
    trace("RECOVERY", `console requested at ${width}x${height} below ${top}px`);
};

export const closeRecoveryConsole = (): void => {
    Scheduler.cancelKind(READY_JOB);
    consoleReady = false;
    if (widgetExists()) Desktop.removeWidget(WIDGET_ID);
    removeCss(hostCssId, HOST_CSS_MARKER);
    hostCssId = null;
};

Scheduler.register(READY_JOB, () => {
    if (consoleReady || !isDesktopMounted()) return;

    trace("RECOVERY", "console did not report ready, falling back");
    closeRecoveryConsole();
    failureHandler?.();
});

onSessionLeft(() => {
    consoleReady = false;
    if (widgetExists()) Desktop.removeWidget(WIDGET_ID);
    removeCss(hostCssId, HOST_CSS_MARKER);
    hostCssId = null;
});

Events.on(RECOVERY_READY_EVENT, () => {
    consoleReady = true;
    Scheduler.cancelKind(READY_JOB);
    tagHost();
    trace("RECOVERY", "console ready");
});
