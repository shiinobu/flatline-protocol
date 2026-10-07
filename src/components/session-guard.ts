import { Events } from "@hotbunny/hackhub-content-sdk";

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
    for (const handler of leaveHandlers) {
        try {
            handler();
        } catch {
            continue;
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
