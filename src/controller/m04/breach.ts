import { Mail, Scheduler } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { DESKTOP_RESTORED_EVENT, startBreach, type BreachSpec } from "../../components/desktop-breach.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { dismissIncidentBanner } from "../../components/incident-banner.js";
import { activeStrike } from "../../components/intrusion.js";
import { INCIDENT_FILE_EXTENSION, INCIDENT_FILE_NAME } from "../../components/kernel-layout.js";
import { RECOVERY_LOG_READ_EVENT } from "../../components/recovery-widget.js";
import { M04_GATES } from "../../content/m04/gates.js";
import { M04_RESTORED_MAIL } from "../../content/m04/mail.js";
import { M04_STATIC_HOP_IP } from "../../content/m04/network.js";
import { M04_LOG_BREACH } from "../../content/m04/quest-logs.js";
import {
    M04_BREACH_HANDOFF_REAL_MS,
    M04_FIREWALL_LOG_DELAY_REAL_MS,
    M04_RESTORE_MAIL_DELAY_REAL_MS,
    M04_SAVE_PREFIX,
    M04_SCOPE,
    M04_STORY_DAY,
    M04_STRIKE_BREACH_ID,
} from "../../content/m04/quest.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import { seedFirewallLog } from "./firewall-log.js";
import { buildM04IncidentLog } from "./incident.js";
import type { M04Quest } from "./types.js";
import { M04_WORLD } from "./world.js";

const BREACH_JOB = "flatline.m04.breach";
const FIREWALL_LOG_JOB = "flatline.m04.firewallLog";
const RESTORED_MAIL_JOB = "flatline.m04.restoredMail";

const BREACH_SPEC: BreachSpec = {
    scope: M04_SCOPE,
    mission: "m04",
    ip: M04_STATIC_HOP_IP,
    alias: M04_STRIKE_BREACH_ID,
    buildIncidentLog: buildM04IncidentLog,
    logDay: M04_STORY_DAY,
};

let pendingQuest: M04Quest | null = null;

const isIncidentLog = (file: ReadFile): boolean => isNamedFile(file, INCIDENT_FILE_NAME, INCIDENT_FILE_EXTENSION);

const markBreachBegan = (): void => {
    traceBacktraceFinding("m4", "breach", M04_LOG_BREACH(), { moment: true });
};

const markIncidentLogRead = (quest: M04Quest): void => {
    advanceStep(quest, M04_GATES, "incidentLogRead", () => unlock(M04_WORLD, "relayLead"));
};

const markDesktopRestored = (quest: M04Quest): void => {
    advanceStep(quest, M04_GATES, "desktopRestored", () => {
        scheduleFirewallLog();
        scheduleRestoredMail();
    });
};

const runBreach = async (): Promise<void> => {
    const quest = pendingQuest;
    if (quest === null || quest.Data.breachBegan) return;

    const started = await startBreach(BREACH_SPEC);
    if (!started) {
        dismissIncidentBanner();
        quest.SetData("breachScheduled", false);
        return;
    }

    advanceStep(quest, M04_GATES, "breachBegan", markBreachBegan);
};

const runRestoredMail = (): void => {
    Mail.send(M04_RESTORED_MAIL());
};

Scheduler.register(BREACH_JOB, () => runBreach());
Scheduler.register(FIREWALL_LOG_JOB, () => seedFirewallLog());
Scheduler.register(RESTORED_MAIL_JOB, runRestoredMail);

export const scheduleM04Breach = (quest: M04Quest, delayRealMs: number = M04_BREACH_HANDOFF_REAL_MS): void => {
    if (quest.Data.breachScheduled) return;

    quest.SetData("breachScheduled", true);
    Scheduler.cancelKind(BREACH_JOB);
    Scheduler.schedule(BREACH_JOB, {}, { realMs: delayRealMs });
};

const scheduleFirewallLog = (): void => {
    Scheduler.cancelKind(FIREWALL_LOG_JOB);
    Scheduler.schedule(FIREWALL_LOG_JOB, {}, { realMs: M04_FIREWALL_LOG_DELAY_REAL_MS });
};

const scheduleRestoredMail = (): void => {
    Scheduler.cancelKind(RESTORED_MAIL_JOB);
    Scheduler.schedule(RESTORED_MAIL_JOB, {}, { realMs: M04_RESTORE_MAIL_DELAY_REAL_MS });
};

export const cancelM04BreachJobs = (): void => {
    Scheduler.cancelKind(BREACH_JOB);
    Scheduler.cancelKind(FIREWALL_LOG_JOB);
    Scheduler.cancelKind(RESTORED_MAIL_JOB);
};

export const bindM04Breach = (quest: M04Quest): void => {
    pendingQuest = quest;

    onFileRead(quest.Events, (file) => {
        if (isIncidentLog(file)) markIncidentLogRead(quest);
    });

    quest.Events.on(RECOVERY_LOG_READ_EVENT, () => markIncidentLogRead(quest));

    quest.Events.on(DESKTOP_RESTORED_EVENT, (data: { readonly mission: string }) => {
        if (data.mission !== "m04") return;

        markDesktopRestored(quest);
    });

    if (quest.Data.probeStarted && !quest.Data.breachBegan && activeStrike(M04_SAVE_PREFIX) === null) {
        scheduleM04Breach(quest);
    }
};
