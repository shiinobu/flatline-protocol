import { Events, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";
import { injectCss, removeCss } from "./css-inject.js";

interface QuietPayload {
    ticksLeft: number;
}

const QUIET_TICK_JOB = "flatline.quietStartTick";
const QUIET_TICK_REAL_MS = 500;
const QUIET_TICKS = 48;
const SCOUTIFY_APP = "Scoutify";
const ALERT_APP = "Alert";
const ALERT_TEXT = /hackhub|kisscord/i;
const CLOSE_LABEL = "Close";
const QUIET_CSS_MARKER = "--flatline-quiet";
const QUIET_CSS = `
.program[data-app="${SCOUTIFY_APP}"], .program[data-app="${ALERT_APP}"] { display: none !important; ${QUIET_CSS_MARKER}: 1; }
`;

const handledPrograms = new WeakSet<Element>();
let quietCssId: string | null = null;
let quietObserver: MutationObserver | null = null;

const findCloseButton = (program: Element): HTMLElement | null =>
    Array.from(program.querySelectorAll<HTMLElement>("button")).find(
        (button) => (button.textContent ?? "").trim() === CLOSE_LABEL,
    ) ?? program.querySelector<HTMLElement>('[class*="_close_"]');

const closeProgram = (program: Element, label: string): void => {
    const button = findCloseButton(program);
    if (button === null) return;

    handledPrograms.add(program);
    button.click();
    trace("QUIET", `${label} app=${program.getAttribute("data-app")}`);
};

const suppressProgram = (program: Element): void => {
    if (handledPrograms.has(program)) return;

    const app = program.getAttribute("data-app");
    if (app === SCOUTIFY_APP) closeProgram(program, "scoutify window closed");
    else if (app === ALERT_APP && ALERT_TEXT.test(program.textContent ?? "")) closeProgram(program, "alert dismissed");
};

const programsAround = (node: Element): Element[] => {
    const enclosing = node.closest(".program");
    const inner = Array.from(node.querySelectorAll(".program"));
    return enclosing === null ? inner : [enclosing, ...inner];
};

const handleMutations = (records: MutationRecord[]): void => {
    for (const record of records) {
        record.addedNodes.forEach((node) => {
            if (node instanceof Element) programsAround(node).forEach(suppressProgram);
        });
    }
};

const openQuietWindow = (): void => {
    quietCssId = injectCss(QUIET_CSS, QUIET_CSS_MARKER);
    quietObserver?.disconnect();
    quietObserver = new MutationObserver(handleMutations);
    quietObserver.observe(document.body, { childList: true, subtree: true });
    Array.from(document.querySelectorAll(".program")).forEach(suppressProgram);
};

const closeQuietWindow = (): void => {
    quietObserver?.disconnect();
    quietObserver = null;
    removeCss(quietCssId, QUIET_CSS_MARKER);
    quietCssId = null;
    trace("QUIET", "quiet start window closed");
};

const runQuietTick = (payload: QuietPayload): void => {
    Array.from(document.querySelectorAll(".program")).forEach(suppressProgram);
    if (payload.ticksLeft <= 1) {
        closeQuietWindow();
        return;
    }

    Scheduler.schedule(QUIET_TICK_JOB, { ticksLeft: payload.ticksLeft - 1 }, { realMs: QUIET_TICK_REAL_MS });
};

if (isDebug) {
    Scheduler.register<QuietPayload>(QUIET_TICK_JOB, runQuietTick);

    Events.on("Game.SessionStarted", () => {
        Scheduler.cancelKind(QUIET_TICK_JOB);
        openQuietWindow();
        Scheduler.schedule(QUIET_TICK_JOB, { ticksLeft: QUIET_TICKS }, { realMs: QUIET_TICK_REAL_MS });
        trace("QUIET", "quiet start window opened");
    });
}
