import { injectCss, removeCss } from "./css-inject.js";
import { isDesktopMounted, onSessionLeft } from "./session-guard.js";
import { trace } from "../helpers/logger.js";

const LOCK_CSS_MARKER = "--flatline-session-lock";
const LEGACY_LOCK_MARKER = "--flatline-lock";
const LEGACY_BLINK_MARKER = "flatline-breach-blink";

const LOCK_CSS = `
html, body { background: #000 !important; ${LOCK_CSS_MARKER}: 1; }
img[class*="_background_"] { visibility: hidden !important; }
.desktopBounds { background: #000 !important; }
.desktopIconHandler, .__file_inDesktop { visibility: hidden !important; }
.taskbar, [class*="_taskbar_"], [class*="_startMenu_"], .control-bar, .system-tray, .task-manager-panel {
    visibility: hidden !important;
    pointer-events: none !important;
}
.program { visibility: hidden !important; pointer-events: none !important; }
`;

let lockCssId: string | null = null;

export const isDesktopLocked = (): boolean => lockCssId !== null;

export const engageDesktopLock = (): void => {
    if (lockCssId !== null || !isDesktopMounted()) return;

    lockCssId = injectCss(LOCK_CSS, LOCK_CSS_MARKER);
    trace("LOCK", "desktop lock engaged");
};

export const sweepLegacyLock = (): void => {
    const swept = removeCss(null, LEGACY_LOCK_MARKER) + removeCss(null, LEGACY_BLINK_MARKER);
    if (swept > 0) trace("LOCK", `removed ${swept} stylesheet(s) left by an older build`);
};

export const releaseDesktopLock = (): void => {
    const swept = removeCss(lockCssId, LOCK_CSS_MARKER);
    const wasLocked = lockCssId !== null;
    lockCssId = null;
    if (wasLocked || swept > 0) trace("LOCK", `desktop lock released swept=${swept}`);
};

onSessionLeft(releaseDesktopLock);
