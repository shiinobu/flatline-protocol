import { Localization, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { beginStrike, registerIntrusionHandlers } from "../../components/intrusion.js";
import { INCIDENT_START_STAMP } from "../../components/kernel-layout.js";
import { M04_GATES } from "../../content/m04/gates.js";
import { M04_LOG_PROBE } from "../../content/m04/quest-logs.js";
import { M04_STRIKE1_MAIL, M04_STRIKE1_MAIL_SLOT } from "../../content/m04/mail.js";
import { M04_INTRUDER_IP } from "../../content/m04/network.js";
import {
    M04_BREACH_HANDOFF_REAL_MS,
    M04_SAVE_PREFIX,
    M04_SCOPE,
    M04_STRIKE_DEADLINE_REAL_MS,
    M04_STRIKE_DELAY_REAL_MS,
    M04_STRIKE_PROBE_ID,
} from "../../content/m04/quest.js";
import { M04_FIREWALL_LOG_FILE_EXTENSION, M04_FIREWALL_LOG_FILE_NAME } from "../../content/m04/server-files.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { scheduleM04Breach } from "./breach.js";
import type { M04Quest } from "./types.js";

const STRIKE_JOB = "flatline.m04.strike";

let pendingQuest: M04Quest | null = null;

const bannerText = () => ({
    label: Localization.t(M04_I18N_KEY.BANNER_LABEL),
    criticalLabel: Localization.t(M04_I18N_KEY.BANNER_CRITICAL),
    detail: Localization.t(M04_I18N_KEY.BANNER_DETAIL, { stamp: INCIDENT_START_STAMP }),
});

const runStrike = (): void => {
    const quest = pendingQuest;
    if (quest === null) return;

    beginStrike({
        scope: M04_SCOPE,
        prefix: M04_SAVE_PREFIX,
        strikeId: M04_STRIKE_PROBE_ID,
        ip: M04_INTRUDER_IP,
        alias: M04_STRIKE_PROBE_ID,
        deadlineRealMs: M04_STRIKE_DEADLINE_REAL_MS,
        repellable: false,
        handoff: true,
        noticeKey: M04_I18N_KEY.REPEL_REFUSED,
        banner: bannerText(),
        bannerVariant: "broadcast",
        bannerClockEnd: INCIDENT_START_STAMP,
        mail: M04_STRIKE1_MAIL(INCIDENT_START_STAMP),
        mailSlot: M04_STRIKE1_MAIL_SLOT,
        toast: Localization.t(M04_I18N_KEY.TOAST_STRIKE),
    });

    advanceStep(quest, M04_GATES, "probeStarted");
};

Scheduler.register(STRIKE_JOB, runStrike);

export const scheduleM04Strike = (quest: M04Quest): void => {
    if (quest.Data.strikeScheduled) return;

    quest.SetData("strikeScheduled", true);
    Scheduler.cancelKind(STRIKE_JOB);
    Scheduler.schedule(STRIKE_JOB, {}, { realMs: M04_STRIKE_DELAY_REAL_MS });
};

export const cancelM04Strike = (): void => {
    Scheduler.cancelKind(STRIKE_JOB);
};

const isFirewallLog = (file: ReadFile): boolean =>
    isNamedFile(file, M04_FIREWALL_LOG_FILE_NAME, M04_FIREWALL_LOG_FILE_EXTENSION);

const traceProbe = (quest: M04Quest, file: ReadFile): void => {
    if (!quest.Data.probeStarted || !isFirewallLog(file)) return;
    if (!traceBacktraceFinding("m4", "probe")) return;

    appendBacktraceLogs("m4", M04_LOG_PROBE());
};

export const bindM04Intrusion = (quest: M04Quest): void => {
    pendingQuest = quest;

    registerIntrusionHandlers(M04_SAVE_PREFIX, {
        onExpired: () => scheduleM04Breach(quest, M04_BREACH_HANDOFF_REAL_MS),
    });

    onFileRead(quest.Events, (file) => traceProbe(quest, file));

    if (quest.Data.warningRead && !quest.Data.probeStarted) scheduleM04Strike(quest);
};
