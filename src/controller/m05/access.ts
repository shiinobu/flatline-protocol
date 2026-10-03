import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { M05_GATES } from "../../content/m05/gates.js";
import {
    M05_BEDSIDE_IP,
    M05_COLD_CHART_IP,
    M05_FIREWALL_IP,
} from "../../content/m05/network.js";
import {
    M05_LOG_ARCHIVE,
    M05_LOG_BEDSIDE,
    M05_LOG_NOTES,
    M05_LOG_STATEMENT,
    M05_LOG_MEMO,
    M05_LOG_TICKET,
} from "../../content/m05/quest-logs.js";
import {
    M05_ACKNOWLEDGEMENT_FILE_NAME,
    M05_DECISION_MEMO_FILE_NAME,
    M05_FOUND_NOTE_FILE_NAME,
    M05_GRETA_NOTES_FILE_NAME,
    M05_TXT,
    M05_USB_TICKET_FILE_NAME,
} from "../../content/m05/server-files.js";
import { unlock } from "../../core/index.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M05Quest } from "./types.js";
import { M05_WORLD } from "./world.js";

const isTxt = (file: ReadFile, name: string): boolean => isNamedFile(file, name, M05_TXT);

const bindFirewall = (quest: M05Quest): void => {
    quest.Events.on("PFSense.Login", (data) => {
        if (data.ip !== M05_FIREWALL_IP) return;

        trace("M05", "probe:firewall-login");
        advanceStep(quest, M05_GATES, "firewallLoggedIn");
    });

    quest.Events.on("PFSense.Changes", () => {
        advanceStep(quest, M05_GATES, "firewallBreached", () => unlock(M05_WORLD, "hospitalShells"));
    });
};

const bindSessions = (quest: M05Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t === "SSH" && data.targetIp === M05_COLD_CHART_IP) {
            trace("M05", "probe:archive-accessed");
            advanceStep(quest, M05_GATES, "archiveAccessed", () =>
                traceBacktraceFinding("m5", "archive", M05_LOG_ARCHIVE()),
            );
            return;
        }

        if (data.t === "METASPLOIT" && data.targetIp === M05_BEDSIDE_IP && !quest.Data.bedsideVisited) {
            quest.SetData("bedsideVisited", true);
            trace("M05", "probe:bedside-bonus");
        }
    });
};

const readDocument = (quest: M05Quest, file: ReadFile): void => {
    if (isTxt(file, M05_ACKNOWLEDGEMENT_FILE_NAME)) {
        advanceStep(quest, M05_GATES, "statementRead", () =>
            traceBacktraceFinding("m5", "statement", M05_LOG_STATEMENT()),
        );
        return;
    }

    if (isTxt(file, M05_DECISION_MEMO_FILE_NAME)) {
        advanceStep(quest, M05_GATES, "memoRead", () =>
            traceBacktraceFinding("m5", "decisionMemo", M05_LOG_MEMO()),
        );
        return;
    }

    if (isTxt(file, M05_USB_TICKET_FILE_NAME)) {
        advanceStep(quest, M05_GATES, "ticketRead", () =>
            traceBacktraceFinding("m5", "usbTicket", M05_LOG_TICKET()),
        );
        return;
    }

    if (isTxt(file, M05_GRETA_NOTES_FILE_NAME) && quest.Data.archiveAccessed) {
        appendBacktraceLogs("m5", M05_LOG_NOTES());
        return;
    }

    if (isTxt(file, M05_FOUND_NOTE_FILE_NAME) && quest.Data.bedsideVisited) {
        appendBacktraceLogs("m5", M05_LOG_BEDSIDE());
    }
};

const bindDocuments = (quest: M05Quest): void => {
    onFileRead(quest.Events, (file) => readDocument(quest, file));
};

export const bindM05Access = (quest: M05Quest): void => {
    bindFirewall(quest);
    bindSessions(quest);
    bindDocuments(quest);
};
