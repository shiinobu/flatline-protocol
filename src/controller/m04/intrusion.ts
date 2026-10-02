import { Files, Localization, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { INTRUSION_REPELLED_EVENT, type IntrusionRepelledPayload } from "../../commands/repel.js";
import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { beginStrike, registerIntrusionHandlers } from "../../components/intrusion.js";
import { penalty } from "../../components/reward.js";
import { M04_GATES } from "../../content/m04/gates.js";
import { M04_LOG_PROBE } from "../../content/m04/quest-logs.js";
import { M04_STRIKE1_MAIL } from "../../content/m04/mail.js";
import { M04_INTRUDER_IP } from "../../content/m04/network.js";
import {
    M04_SAVE_PREFIX,
    M04_SCOPE,
    M04_STRIKE_DEADLINE_REAL_MS,
    M04_STRIKE_DELAY_REAL_MS,
    M04_STRIKE_PENALTY,
    M04_STRIKE_PROBE_ID,
} from "../../content/m04/quest.js";
import {
    M04_FIREWALL_LOG_CONTENT,
    M04_FIREWALL_LOG_FILE_EXTENSION,
    M04_FIREWALL_LOG_FILE_NAME,
    M04_FIREWALL_LOG_FOLDER,
} from "../../content/m04/server-files.js";
import { trace } from "../../helpers/logger.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { scheduleM04Breach } from "./breach.js";
import type { M04Quest } from "./types.js";

const STRIKE_JOB = "flatline.m04.strike";

let pendingQuest: M04Quest | null = null;

const bannerText = () => ({
    label: Localization.t(M04_I18N_KEY.BANNER_LABEL),
    criticalLabel: Localization.t(M04_I18N_KEY.BANNER_CRITICAL),
    detail: Localization.t(M04_I18N_KEY.BANNER_DETAIL),
    severedLabel: Localization.t(M04_I18N_KEY.BANNER_SEVERED),
    severedDetail: Localization.t(M04_I18N_KEY.BANNER_SEVERED_DETAIL),
    breachedLabel: Localization.t(M04_I18N_KEY.BANNER_BREACHED),
    breachedDetail: Localization.t(M04_I18N_KEY.BANNER_BREACHED_DETAIL),
});

const seedFirewallLog = async (): Promise<void> => {
    const home = Files.getHomePath();
    const existing = await Files.getByPath(`~/${M04_FIREWALL_LOG_FOLDER}`);
    const tree = [
        {
            name: M04_FIREWALL_LOG_FILE_NAME,
            extension: M04_FIREWALL_LOG_FILE_EXTENSION,
            data: M04_FIREWALL_LOG_CONTENT(),
        },
    ];

    if (existing === null) {
        await Files.createTree(home, [{ name: M04_FIREWALL_LOG_FOLDER, isFolder: true, children: tree }]);
        return;
    }

    await Files.createTree(`${home}/${M04_FIREWALL_LOG_FOLDER}`, tree);
};

const runStrike = async (): Promise<void> => {
    const quest = pendingQuest;
    if (quest === null) {
        trace(M04_SCOPE, "strike job fired with no live quest");
        return;
    }

    await seedFirewallLog();

    beginStrike({
        scope: M04_SCOPE,
        prefix: M04_SAVE_PREFIX,
        strikeId: M04_STRIKE_PROBE_ID,
        ip: M04_INTRUDER_IP,
        alias: M04_STRIKE_PROBE_ID,
        deadlineRealMs: M04_STRIKE_DEADLINE_REAL_MS,
        banner: bannerText(),
        mail: M04_STRIKE1_MAIL(),
        toast: Localization.t(M04_I18N_KEY.TOAST_STRIKE),
    });

    advanceStep(quest, M04_GATES, "probeStarted");
    trace(M04_SCOPE, `probe:strike-started ip=${M04_INTRUDER_IP}`);
};

Scheduler.register(STRIKE_JOB, () => runStrike());

export const scheduleM04Strike = (quest: M04Quest): void => {
    if (quest.Data.strikeScheduled) return;

    quest.SetData("strikeScheduled", true);
    Scheduler.cancelKind(STRIKE_JOB);
    Scheduler.schedule(STRIKE_JOB, {}, { realMs: M04_STRIKE_DELAY_REAL_MS });
    trace(M04_SCOPE, `probe:strike-scheduled delayMs=${M04_STRIKE_DELAY_REAL_MS}`);
};

export const bindM04Intrusion = (quest: M04Quest): void => {
    pendingQuest = quest;

    registerIntrusionHandlers(M04_SAVE_PREFIX, {
        onExpired: async () => {
            if (quest.Data.intruderRepelled) return;

            const charged = penalty(M04_SCOPE, M04_STRIKE_PENALTY, "Unauthorized transfer — hunter");
            trace(M04_SCOPE, `probe:strike-expired penalty=${charged}`);
            await seedFirewallLog();
            quest.SetData("strikeScheduled", false);
            scheduleM04Strike(quest);
            trace(M04_SCOPE, "probe:strike-rearmed");
        },
    });

    quest.Events.on(INTRUSION_REPELLED_EVENT, (data: IntrusionRepelledPayload) => {
        if (data.prefix !== M04_SAVE_PREFIX) return;
        if (data.strikeId !== M04_STRIKE_PROBE_ID || data.ip !== M04_INTRUDER_IP) return;

        trace(M04_SCOPE, `probe:intruder-repelled ip=${data.ip}`);
        advanceStep(quest, M04_GATES, "intruderRepelled", () => {
            traceBacktraceFinding("m4", "probe");
            appendBacktraceLogs("m4", M04_LOG_PROBE());
            scheduleM04Breach(quest);
        });
    });

    if (quest.Data.warningRead && !quest.Data.probeStarted) scheduleM04Strike(quest);
};
