import { Events } from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";

type LeaveHandler = () => void;

const DESKTOP_SELECTOR = ".desktopBounds";

const leaveHandlers: LeaveHandler[] = [];
let observer: MutationObserver | null = null;
let checkQueued = false;

export const isDesktopMounted = (): boolean => document.querySelector(DESKTOP_SELECTOR) !== null;

export const onSessionLeft = (handler: LeaveHandler): void => {
    leaveHandlers.push(handler);
};

const stopWatching = (): void => {
    observer?.disconnect();
    observer = null;
};

const runLeaveHandlers = (): void => {
    stopWatching();
    trace("SESSION", "desktop unmounted, taking the injected styles and widgets back");
    for (const handler of leaveHandlers) {
        try {
            handler();
        } catch (error: unknown) {
            trace("SESSION", `leave handler failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};

const queueCheck = (): void => {
    if (checkQueued) return;

    checkQueued = true;
    window.requestAnimationFrame(() => {
        checkQueued = false;
        if (observer !== null && !isDesktopMounted()) runLeaveHandlers();
    });
};

const startWatching = (): void => {
    stopWatching();
    observer = new MutationObserver(queueCheck);
    observer.observe(document.body, { childList: true, subtree: true });
};

Events.on("Game.SessionStarted", startWatching);

if (isDesktopMounted()) startWatching();
