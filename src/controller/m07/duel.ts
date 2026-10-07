import { Files, Localization, Scheduler, UI, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { startBreach, type BreachSpec } from "../../components/desktop-breach.js";
import {
    activeStrike,
    beginStrike,
    escapeStrike,
    registerIntrusionHandlers,
    strikeRemainingRealMs,
    type IntrusionBannerText,
} from "../../components/intrusion.js";
import { INCIDENT_START_STAMP, buildIncidentLog } from "../../components/kernel-layout.js";
import { sendReplacingMail } from "../../components/mail.js";
import { penalty } from "../../components/reward.js";
import {
    M07_SENTRY_MAIL,
    M07_SENTRY_MAIL_SLOT,
    M07_TRACED_MAIL,
    M07_TRACED_MAIL_SLOT,
    M07_TRAP_MAIL,
    M07_TRAP_MAIL_SLOT,
} from "../../content/m07/mail.js";
import { M07_C2_IP, M07_CHAIR_LAN_IP, M07_ROUTER_IP } from "../../content/m07/network.js";
import { M07_LOG_DUEL_ONE_LOST, M07_LOG_DUEL_TWO_LOST } from "../../content/m07/quest-logs.js";
import {
    M07_BREACH_DELAY_REAL_MS,
    M07_DUEL_ONE_DEADLINE_REAL_MS,
    M07_DUEL_ONE_HALVED_REAL_MS,
    M07_DUEL_ONE_PREFIX,
    M07_DUEL_ONE_STRIKE_ID,
    M07_DUEL_PENALTY,
    M07_DUEL_TWO_DEADLINE_REAL_MS,
    M07_DUEL_TWO_PREFIX,
    M07_DUEL_TWO_STRIKE_ID,
    M07_SCOPE,
    M07_STORY_DAY,
} from "../../content/m07/quest.js";
import { M07_MISSION } from "../../content/m07/rdc.js";
import { M07_LEDGER_FILE_CONTENT, M07_LEDGER_WIPED_CONTENT } from "../../content/m07/server-files.js";
import type { M07QuestData } from "../../content/m07/state.js";
import { getM07RdcState, setM07RdcState } from "../../context/m07/progress.js";
import { trace } from "../../helpers/logger.js";
import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { findLedgerOnTarget } from "./ledger-file.js";
import type { M07Quest } from "./types.js";

const BREACH_JOB = "flatline.m07.breach";

interface BreachPayload {
    readonly ip: string;
    readonly alias: string;
}

let pendingQuest: M07Quest | null = null;

const duelOneBanner = (): IntrusionBannerText => ({
    label: Localization.t(M07_I18N_KEY.BANNER_ONE_LABEL),
    criticalLabel: Localization.t(M07_I18N_KEY.BANNER_ONE_CRITICAL),
    detail: Localization.t(M07_I18N_KEY.BANNER_ONE_DETAIL),
    severedLabel: Localization.t(M07_I18N_KEY.BANNER_ONE_ESCAPED),
    severedDetail: Localization.t(M07_I18N_KEY.BANNER_ONE_ESCAPED_DETAIL),
    breachedLabel: Localization.t(M07_I18N_KEY.BANNER_ONE_TRACED),
    breachedDetail: Localization.t(M07_I18N_KEY.BANNER_ONE_TRACED_DETAIL),
});

const duelTwoBanner = (): IntrusionBannerText => ({
    label: Localization.t(M07_I18N_KEY.BANNER_TWO_LABEL),
    criticalLabel: Localization.t(M07_I18N_KEY.BANNER_TWO_CRITICAL),
    detail: Localization.t(M07_I18N_KEY.BANNER_TWO_DETAIL),
    severedLabel: Localization.t(M07_I18N_KEY.BANNER_TWO_DONE),
    severedDetail: Localization.t(M07_I18N_KEY.BANNER_TWO_DONE_DETAIL),
    breachedLabel: Localization.t(M07_I18N_KEY.BANNER_TWO_LOST),
    breachedDetail: Localization.t(M07_I18N_KEY.BANNER_TWO_LOST_DETAIL),
});

const breachSpec = (payload: BreachPayload): BreachSpec => ({
    scope: M07_SCOPE,
    mission: M07_MISSION,
    ip: payload.ip,
    alias: payload.alias,
    buildIncidentLog: (expectedSrcversion, source) =>
        buildIncidentLog({ ip: source, expectedSrcversion, gateway: M07_ROUTER_IP }),
    logDay: M07_STORY_DAY,
});

const runBreach = async (payload: BreachPayload): Promise<void> => {
    const started = await startBreach(breachSpec(payload));
    trace(M07_SCOPE, `duel breach started=${started} alias=${payload.alias}`);
};

Scheduler.register<BreachPayload>(BREACH_JOB, (payload) => runBreach(payload));

const scheduleBreach = (payload: BreachPayload): void => {
    Scheduler.cancelKind(BREACH_JOB);
    Scheduler.schedule(BREACH_JOB, payload, { realMs: M07_BREACH_DELAY_REAL_MS });
};

const chargePenalty = (description: string): void => {
    const charged = penalty(M07_SCOPE, M07_DUEL_PENALTY, description);
    if (charged > 0) UI.toast(Localization.t(M07_I18N_KEY.TOAST_PENALTY, { amount: charged }), "error");
};

const wipeLedger = async (quest: M07Quest): Promise<void> => {
    const file = await findLedgerOnTarget();
    if (file === null) {
        trace(M07_SCOPE, "ledger wipe skipped: file not reachable");
        return;
    }

    Files.write(file.id, M07_LEDGER_WIPED_CONTENT());
    quest.SetData("ledgerWiped", true);
    trace(M07_SCOPE, "ledger payload wiped");
};

const restoreLedger = async (quest: M07Quest): Promise<void> => {
    if (!quest.Data.ledgerWiped) return;

    const file = await findLedgerOnTarget();
    if (file === null) {
        trace(M07_SCOPE, "ledger restore skipped: file not reachable");
        return;
    }

    Files.write(file.id, M07_LEDGER_FILE_CONTENT);
    quest.SetData("ledgerWiped", false);
    trace(M07_SCOPE, "ledger payload restored");
};

const armDuelOne = (deadlineRealMs: number, mail?: MailDefinition, toast?: string): void => {
    beginStrike({
        scope: M07_SCOPE,
        prefix: M07_DUEL_ONE_PREFIX,
        strikeId: M07_DUEL_ONE_STRIKE_ID,
        ip: M07_C2_IP,
        alias: M07_DUEL_ONE_STRIKE_ID,
        deadlineRealMs,
        repellable: false,
        noticeKey: M07_I18N_KEY.REPEL_REFUSED,
        banner: duelOneBanner(),
        mail,
        mailSlot: mail === undefined ? undefined : M07_TRAP_MAIL_SLOT,
        toast: toast ?? Localization.t(M07_I18N_KEY.TOAST_TRACE),
    });
};

export const startDuelOne = (quest: M07Quest): void => {
    if (quest.Data.ledgerTaken || activeStrike(M07_DUEL_ONE_PREFIX) !== null) return;

    armDuelOne(M07_DUEL_ONE_DEADLINE_REAL_MS);
};

export const resumeDuelOne = async (quest: M07Quest): Promise<void> => {
    if (quest.Data.ledgerTaken || !quest.Data.shellObtained) return;
    if (activeStrike(M07_DUEL_ONE_PREFIX) !== null) return;

    await restoreLedger(quest);
    armDuelOne(M07_DUEL_ONE_DEADLINE_REAL_MS);
};

export const halveDuelOne = (quest: M07Quest): void => {
    if (quest.Data.ledgerTaken || quest.Data.traceHalved) return;
    if (activeStrike(M07_DUEL_ONE_PREFIX) === null) return;

    const remaining = strikeRemainingRealMs();
    quest.SetData("traceHalved", true);
    armDuelOne(
        remaining === null ? M07_DUEL_ONE_HALVED_REAL_MS : Math.min(remaining, M07_DUEL_ONE_HALVED_REAL_MS),
        M07_TRAP_MAIL(),
        Localization.t(M07_I18N_KEY.TOAST_HALVED),
    );
    trace(M07_SCOPE, "duel one window halved");
};

export const endDuelOne = (): void => {
    escapeStrike(M07_DUEL_ONE_PREFIX);
};

const loseDuelOne = async (quest: M07Quest): Promise<void> => {
    if (quest.Data.ledgerTaken) return;

    chargePenalty("Traced session — loss");
    quest.SetData("duelOneLosses", quest.Data.duelOneLosses + 1);
    quest.SetData("traceHalved", false);
    await wipeLedger(quest);
    sendReplacingMail(M07_TRACED_MAIL_SLOT, M07_TRACED_MAIL());
    appendBacktraceLogs("m7", M07_LOG_DUEL_ONE_LOST(), { moment: true });
    scheduleBreach({ ip: M07_C2_IP, alias: M07_DUEL_ONE_STRIKE_ID });
    trace(M07_SCOPE, `duel one lost losses=${quest.Data.duelOneLosses}`);
};

export const isDuelTwoWon = (data: M07QuestData): boolean =>
    data.instructionRead && data.modelRead && data.dossierRead;

export const startDuelTwo = (quest: M07Quest): void => {
    if (isDuelTwoWon(quest.Data) || activeStrike(M07_DUEL_TWO_PREFIX) !== null) return;

    beginStrike({
        scope: M07_SCOPE,
        prefix: M07_DUEL_TWO_PREFIX,
        strikeId: M07_DUEL_TWO_STRIKE_ID,
        ip: M07_CHAIR_LAN_IP,
        alias: M07_DUEL_TWO_STRIKE_ID,
        deadlineRealMs: M07_DUEL_TWO_DEADLINE_REAL_MS,
        repellable: false,
        noticeKey: M07_I18N_KEY.REPEL_REFUSED,
        banner: duelTwoBanner(),
        bannerVariant: "broadcast",
        bannerClockEnd: INCIDENT_START_STAMP,
        mail: M07_SENTRY_MAIL(),
        mailSlot: M07_SENTRY_MAIL_SLOT,
        toast: Localization.t(M07_I18N_KEY.TOAST_SENTRY),
    });
};

export const settleDuelTwo = (quest: M07Quest): void => {
    if (!isDuelTwoWon(quest.Data) || activeStrike(M07_DUEL_TWO_PREFIX) === null) return;

    escapeStrike(M07_DUEL_TWO_PREFIX);
    trace(M07_SCOPE, "duel two won");
};

const loseDuelTwo = (quest: M07Quest): void => {
    if (isDuelTwoWon(quest.Data)) return;

    chargePenalty("Sentry closed the line — loss");
    quest.SetData("duelTwoLosses", quest.Data.duelTwoLosses + 1);
    setM07RdcState({ ...getM07RdcState(), loggedIn: false, attached: false });
    appendBacktraceLogs("m7", M07_LOG_DUEL_TWO_LOST(), { moment: true });
    scheduleBreach({ ip: M07_CHAIR_LAN_IP, alias: M07_DUEL_TWO_STRIKE_ID });
    trace(M07_SCOPE, `duel two lost losses=${quest.Data.duelTwoLosses}`);
};

export const bindM07Duels = (quest: M07Quest): void => {
    pendingQuest = quest;

    registerIntrusionHandlers(M07_DUEL_ONE_PREFIX, {
        onExpired: () => (pendingQuest === null ? undefined : loseDuelOne(pendingQuest)),
    });
    registerIntrusionHandlers(M07_DUEL_TWO_PREFIX, {
        onExpired: () => (pendingQuest === null ? undefined : loseDuelTwo(pendingQuest)),
    });
};

export const cancelM07DuelJobs = (): void => {
    Scheduler.cancelKind(BREACH_JOB);
};
