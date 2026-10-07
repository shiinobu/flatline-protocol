import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { sendReplacingMail } from "../../components/mail.js";
import { M05_GATES, M05_SETTLE_ORDER, type M05Step } from "../../content/m05/gates.js";
import { M05_PORTAL_MAIL_SLOT, buildM05PortalLoginMail } from "../../content/m05/mail.js";
import {
    M05_LOGIN_EVENT,
    M05_PORTAL_CONTRACTOR_USER,
    M05_PORTAL_LOGIN_USER,
    M05_PORTAL_MIN_STEPS,
    M05_PORTAL_SEEN_EVENT,
    matchesM05PortalObservation,
    type M05LoginPayload,
    type M05PortalKind,
    type M05PortalSeenPayload,
} from "../../content/m05/portal.js";
import {
    M05_LOG_CONTROLS,
    M05_LOG_FOOTHOLD,
    M05_LOG_HOLD,
    M05_LOG_SEPARATION,
    M05_LOG_USB,
} from "../../content/m05/quest-logs.js";
import type { M05QuestData } from "../../content/m05/state.js";
import { getM05PortalUser, setM05PortalMin, setM05PortalUser } from "../../context/m05/progress.js";
import { advanceStep } from "../../middleware/gate.js";
import { settleEvidence } from "./evidence.js";
import type { M05Quest } from "./types.js";

const MIN_FLAGS: Readonly<Record<M05PortalKind, keyof M05QuestData>> = {
    foothold: "footholdFlagged",
    usb: "usbFound",
    separation: "separationFound",
    controls: "controlsFound",
    hold: "holdFound",
    systems: "systemsOpened",
};

const SEEN_FLAG: Readonly<Record<M05PortalKind, keyof M05QuestData>> = {
    foothold: "footholdSeen",
    usb: "usbSeen",
    separation: "separationSeen",
    controls: "controlsSeen",
    hold: "holdSeen",
    systems: "systemsSeen",
};

export const portalMinOf = (data: M05QuestData): number => {
    const open = M05_PORTAL_MIN_STEPS.findIndex((kind) => !data[MIN_FLAGS[kind]]);
    return open < 0 ? M05_PORTAL_MIN_STEPS.length : open;
};

const recomputeMin = (quest: M05Quest): void => setM05PortalMin(portalMinOf(quest.Data));

const stepEffect = (quest: M05Quest, step: M05Step): void => {
    if (step === "footholdFlagged") appendBacktraceLogs("m5", M05_LOG_FOOTHOLD());
    else if (step === "usbFound") appendBacktraceLogs("m5", M05_LOG_USB());
    else if (step === "separationFound") appendBacktraceLogs("m5", M05_LOG_SEPARATION());
    else if (step === "controlsFound") appendBacktraceLogs("m5", M05_LOG_CONTROLS());
    else if (step === "holdFound") appendBacktraceLogs("m5", M05_LOG_HOLD());
    recomputeMin(quest);
};

const seenReady = (quest: M05Quest, step: M05Step): boolean => {
    if (step === "controlsFound") return quest.Data.controlsSeen && quest.Data.rollbackOpened;
    if (step === "holdFound") return quest.Data.holdSeen;
    if (step === "footholdFlagged") return quest.Data.footholdSeen;
    if (step === "usbFound") return quest.Data.usbSeen;
    if (step === "separationFound") return quest.Data.separationSeen;
    if (step === "systemsOpened") return quest.Data.systemsSeen;
    if (step === "sampleOpened") return quest.Data.sampleDecrypted;
    return false;
};

const onPortalLogin = (quest: M05Quest): void => {
    recomputeMin(quest);
    sendReplacingMail(M05_PORTAL_MAIL_SLOT, buildM05PortalLoginMail());
};

const retryPortalLogin = (quest: M05Quest): void => {
    if (getM05PortalUser() !== M05_PORTAL_LOGIN_USER) return;

    advanceStep(quest, M05_GATES, "portalLoggedIn", () => onPortalLogin(quest));
};

export const settleM05 = (quest: M05Quest): void => {
    settleEvidence(quest);
    retryPortalLogin(quest);

    let advanced = true;
    while (advanced) {
        advanced = false;
        for (const step of M05_SETTLE_ORDER) {
            if (!seenReady(quest, step)) continue;
            if (advanceStep(quest, M05_GATES, step, () => stepEffect(quest, step))) advanced = true;
        }
    }
};

const recordObservation = (quest: M05Quest, kind: M05PortalKind): void => {
    const flag = SEEN_FLAG[kind];
    if (quest.Data[flag]) return;

    quest.SetData(flag, true);
    settleM05(quest);
};

const bindLogin = (quest: M05Quest): void => {
    quest.Events.on(M05_LOGIN_EVENT, (data: M05LoginPayload) => {
        if (data.user === M05_PORTAL_LOGIN_USER) {
            advanceStep(quest, M05_GATES, "portalLoggedIn", () => {
                setM05PortalUser(M05_PORTAL_LOGIN_USER);
                onPortalLogin(quest);
            });
            return;
        }

        if (data.user === M05_PORTAL_CONTRACTOR_USER) {
            setM05PortalUser(M05_PORTAL_CONTRACTOR_USER);
        }
    });
};

const bindObservations = (quest: M05Quest): void => {
    quest.Events.on(M05_PORTAL_SEEN_EVENT, (data: M05PortalSeenPayload) => {
        if (!matchesM05PortalObservation(data.kind, data.ref)) return;
        recordObservation(quest, data.kind as M05PortalKind);
    });
};

export const bindM05Portal = (quest: M05Quest): void => {
    bindLogin(quest);
    bindObservations(quest);
};
