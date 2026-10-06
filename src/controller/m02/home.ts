import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { M02_GATES, M02_STEP_ORDER } from "../../content/m02/gates.js";
import { M02_DEAD_DROP_EMAIL, M02_PREMATURE_MAIL_SLOT, buildM02PrematureReply } from "../../content/m02/mail.js";
import { M02_FIREWALL_IP, M02_WORKSTATION_IP } from "../../content/m02/network.js";
import {
    M02_LOG_AFTERMATH,
    M02_OBJECTIVE_IDS,
    M02_LOG_FIREWALL,
    M02_LOG_WORKSTATION,
    M02_LOG_SHELL,
} from "../../content/m02/quest.js";
import {
    M02_FINANCIAL_DOC_FILE_EXTENSION,
    M02_FINANCIAL_DOC_FILE_NAME,
    M02_WORKSTATION_ERRANDS_FILE_EXTENSION,
    M02_WORKSTATION_ERRANDS_FILE_NAME,
    M02_WORKSTATION_UNSENT_FILE_EXTENSION,
    M02_WORKSTATION_UNSENT_FILE_NAME,
} from "../../content/m02/server-files.js";
import { M02_WORLD } from "./world.js";
import { unlock } from "../../core/index.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { M02_REPORT_SPEC } from "./report.js";
import type { M02Quest } from "./types.js";

const WORKSTATION_FILES: readonly { readonly name: string; readonly extension: string }[] = [
    { name: M02_FINANCIAL_DOC_FILE_NAME, extension: M02_FINANCIAL_DOC_FILE_EXTENSION },
    { name: M02_WORKSTATION_ERRANDS_FILE_NAME, extension: M02_WORKSTATION_ERRANDS_FILE_EXTENSION },
    { name: M02_WORKSTATION_UNSENT_FILE_NAME, extension: M02_WORKSTATION_UNSENT_FILE_EXTENSION },
];

const isWorkstationFile = (file: ReadFile): boolean =>
    WORKSTATION_FILES.some(({ name, extension }) => isNamedFile(file, name, extension));

const bindFirewall = (quest: M02Quest): void => {
    quest.Events.on("PFSense.Login", (data) => {
        if (data.ip !== M02_FIREWALL_IP) return;

        advanceStep(quest, M02_GATES, "firewallLoggedIn", () =>
            traceBacktraceFinding("m2", "firewall", M02_LOG_FIREWALL()),
        );
    });

    quest.Events.on("PFSense.Changes", () => {
        advanceStep(quest, M02_GATES, "firewallBreached", () => unlock(M02_WORLD, "workstationRdp"));
    });
};

const bindWorkstation = (quest: M02Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "METASPLOIT" || data.targetIp !== M02_WORKSTATION_IP) return;

        advanceStep(quest, M02_GATES, "workstationRooted", () =>
            traceBacktraceFinding("m2", "workstation", M02_LOG_WORKSTATION()),
        );
    });

    onFileRead(quest.Events, (file) => {
        if (isNamedFile(file, M02_FINANCIAL_DOC_FILE_NAME, M02_FINANCIAL_DOC_FILE_EXTENSION)) {
            advanceStep(quest, M02_GATES, "shellCompanyFound", () =>
                traceBacktraceFinding("m2", "shellCompany", M02_LOG_SHELL()),
            );
        }

        if (isWorkstationFile(file)) {
            advanceStep(quest, M02_GATES, "aftermathShown", () => appendBacktraceLogs("m2", M02_LOG_AFTERMATH()));
        }
    });
};

const bindReport = (quest: M02Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M02_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M02_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M02_GATES, "reportSent", () =>
            quest.completeObjective(M02_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M02_PREMATURE_MAIL_SLOT, buildM02PrematureReply(firstUnmetStep(M02_STEP_ORDER, quest.Data)));
    });
};

export const bindM02Home = (quest: M02Quest): void => {
    bindFirewall(quest);
    bindWorkstation(quest);
    bindReport(quest);
};
