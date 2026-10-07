import { injectCss, removeCss } from "./css-inject.js";
import { isDesktopMounted, onSessionLeft } from "./session-guard.js";

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
};

export const sweepLegacyLock = (): void => {
    removeCss(null, LEGACY_LOCK_MARKER);
    removeCss(null, LEGACY_BLINK_MARKER);
};

export const releaseDesktopLock = (): void => {
    removeCss(lockCssId, LOCK_CSS_MARKER);
    lockCssId = null;
};

onSessionLeft(releaseDesktopLock);
