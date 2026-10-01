import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { OPEN_FILE_READ_EVENT } from "../../commands/open.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { M03_GATES, M03_STEP_ORDER } from "../../content/m03/gates.js";
import { M03_DEAD_DROP_EMAIL, M03_PREMATURE_MAIL_SLOT, buildM03PrematureReply } from "../../content/m03/mail.js";
import { M03_ACCOMPLICE_IP, M03_ACCOMPLICE_LAN_IP, M03_VAULTLINE_IP } from "../../content/m03/network.js";
import {
    M03_LOG_AFTERMATH,
    M03_LOG_REYES,
    M03_LOG_TUNNEL,
    M03_OBJECTIVE_IDS,
} from "../../content/m03/quest.js";
import {
    M03_REYES_NOTE_FILE_EXTENSION,
    M03_REYES_NOTE_FILE_NAME,
    M03_VPN_CONFIG_FILE_EXTENSION,
    M03_VPN_CONFIG_FILE_NAME,
} from "../../content/m03/server-files.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { M03_REPORT_SPEC } from "./report.js";
import type { M03Quest } from "./types.js";

interface OpenedFile {
    readonly id: string;
    readonly name: string;
    readonly extension?: string;
}

const markShell = (quest: M03Quest): void => {
    advanceStep(quest, M03_GATES, "gatewayShellObtained", () => traceBacktraceFinding("m3", "gateway"));
};

const markAccomplice = (quest: M03Quest): void => {
    advanceStep(quest, M03_GATES, "accompliceReached", () => traceBacktraceFinding("m3", "accomplice"));
};

const readConfig = (quest: M03Quest): void => {
    advanceStep(quest, M03_GATES, "vpnConfigRead", () => {
        traceBacktraceFinding("m3", "vpnPeer");
        appendBacktraceLogs("m3", M03_LOG_TUNNEL());
    });
};

const logReyes = (quest: M03Quest): void => {
    if (quest.Data.accompliceReached) appendBacktraceLogs("m3", M03_LOG_REYES());
};

const isConfig = (file: { readonly name: string; readonly extension?: string }): boolean =>
    file.name === M03_VPN_CONFIG_FILE_NAME && file.extension === M03_VPN_CONFIG_FILE_EXTENSION;

const isReyesNote = (file: { readonly name: string; readonly extension?: string }): boolean =>
    file.name === M03_REYES_NOTE_FILE_NAME && file.extension === M03_REYES_NOTE_FILE_EXTENSION;

const bindShell = (quest: M03Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t === "SSH" && data.targetIp === M03_ACCOMPLICE_IP) {
            markAccomplice(quest);
            return;
        }

        if (data.t !== "METASPLOIT" || data.targetIp !== M03_VAULTLINE_IP) return;

        markShell(quest);
    });

    quest.Events.on("Metasploit.Meterpreter.Connected", (data) => {
        if (data.ip !== M03_VAULTLINE_IP) return;

        markShell(quest);
    });
};

const bindFiles = (quest: M03Quest): void => {
    quest.Events.on("Terminal.Cat", (data) => {
        if (isConfig(data)) readConfig(quest);
        if (isReyesNote(data)) logReyes(quest);
    });

    quest.Events.on(OPEN_FILE_READ_EVENT, (data: OpenedFile) => {
        if (isConfig(data)) readConfig(quest);
        if (isReyesNote(data)) logReyes(quest);
    });

    quest.Events.on("Terminal.Explorer", (data) => {
        if (data.ip !== M03_ACCOMPLICE_IP && data.ip !== M03_ACCOMPLICE_LAN_IP) return;

        markAccomplice(quest);
        logReyes(quest);
    });
};

const bindReport = (quest: M03Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M03_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M03_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M03_GATES, "reportSent", () => {
            appendBacktraceLogs("m3", M03_LOG_AFTERMATH());
            quest.completeObjective(M03_OBJECTIVE_IDS.reportFindings);
        });
        if (accepted) return;

        sendReplacingMail(M03_PREMATURE_MAIL_SLOT, buildM03PrematureReply(firstUnmetStep(M03_STEP_ORDER, quest.Data)));
    });
};

export const bindM03Gateway = (quest: M03Quest): void => {
    bindShell(quest);
    bindFiles(quest);
    bindReport(quest);
};
