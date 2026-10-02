import { Localization, Mail, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { DESKTOP_RESTORED_EVENT, startBreach } from "../../components/desktop-breach.js";
import { OPEN_FILE_READ_EVENT } from "../../commands/open.js";
import { M04_GATES } from "../../content/m04/gates.js";
import { M04_HUNTER_EMAIL, M04_INTRUDER_IP } from "../../content/m04/network.js";
import { M04_LOG_BREACH } from "../../content/m04/quest-logs.js";
import {
    M04_BREACH_DELAY_REAL_MS,
    M04_SAVE_PREFIX,
    M04_SCOPE,
    M04_STRIKE_BREACH_ID,
} from "../../content/m04/quest.js";
import { INCIDENT_FILE_EXTENSION, INCIDENT_FILE_NAME } from "../../components/desktop-breach.js";
import { trace } from "../../helpers/logger.js";
import { kitBreachText } from "../../i18n/global/kit.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { buildM04IncidentLog } from "./incident.js";
import type { M04Quest } from "./types.js";

const BREACH_JOB = "flatline.m04.breach";

interface ReadFile {
    readonly name: string;
    readonly extension?: string;
}

let pendingQuest: M04Quest | null = null;

const isIncidentLog = (file: ReadFile): boolean =>
    file.name === INCIDENT_FILE_NAME && file.extension === INCIDENT_FILE_EXTENSION;

const runBreach = async (): Promise<void> => {
    const quest = pendingQuest;
    if (quest === null || quest.Data.breachBegan) return;

    const started = await startBreach(
        {
            scope: M04_SCOPE,
            mission: "m04",
            ip: M04_INTRUDER_IP,
            alias: M04_STRIKE_BREACH_ID,
            buildIncidentLog: buildM04IncidentLog,
        },
        kitBreachText(),
    );
    if (!started) {
        trace(M04_SCOPE, "breach refused: one is already active");
        return;
    }

    Mail.send({
        from: M04_HUNTER_EMAIL,
        subject: Localization.t(M04_I18N_KEY.MAIL_STRIKE2_SUBJECT),
        content: Localization.t(M04_I18N_KEY.MAIL_STRIKE2_CONTENT),
    });

    advanceStep(quest, M04_GATES, "breachBegan", () => {
        traceBacktraceFinding("m4", "breach");
        appendBacktraceLogs("m4", M04_LOG_BREACH());
    });
    trace(M04_SCOPE, "probe:breach-began");
};

Scheduler.register(BREACH_JOB, () => runBreach());

export const scheduleM04Breach = (quest: M04Quest): void => {
    if (quest.Data.breachScheduled) return;

    quest.SetData("breachScheduled", true);
    Scheduler.cancelKind(BREACH_JOB);
    Scheduler.schedule(BREACH_JOB, {}, { realMs: M04_BREACH_DELAY_REAL_MS });
    trace(M04_SCOPE, `probe:breach-scheduled delayMs=${M04_BREACH_DELAY_REAL_MS}`);
};

export const bindM04Breach = (quest: M04Quest): void => {
    pendingQuest = quest;

    quest.Events.on("Terminal.Cat", (data) => {
        if (!isIncidentLog(data)) return;

        advanceStep(quest, M04_GATES, "incidentLogRead");
    });

    quest.Events.on(OPEN_FILE_READ_EVENT, (data: ReadFile) => {
        if (!isIncidentLog(data)) return;

        advanceStep(quest, M04_GATES, "incidentLogRead");
    });

    quest.Events.on(DESKTOP_RESTORED_EVENT, (data: { readonly mission: string }) => {
        if (data.mission !== "m04") return;

        trace(M04_SCOPE, "probe:desktop-restored");
        advanceStep(quest, M04_GATES, "desktopRestored");
    });

    if (quest.Data.intruderRepelled && !quest.Data.breachBegan) scheduleM04Breach(quest);
};
