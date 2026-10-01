import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { M01_GATES, M01_STEP_ORDER } from "../../content/m01/gates.js";
import { M01_DEAD_DROP_EMAIL, M01_PREMATURE_MAIL_SLOT, buildM01PrematureReply } from "../../content/m01/mail.js";
import { M01_LEDGERVAULT_DOMAIN } from "../../content/m01/network.js";
import {
    M01_LOG_AFTERMATH,
    M01_OBJECTIVE_IDS,
    M01_PROJECT_OPENED_EVENT,
} from "../../content/m01/quest.js";
import { M01_LEDGERVAULT_PROJECT_FOLDER } from "../../content/m01/report.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { M01_REPORT_SPEC } from "./report.js";
import type { M01Quest } from "./types.js";

const bindVault = (quest: M01Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.hostname !== M01_LEDGERVAULT_DOMAIN) return;

        advanceStep(quest, M01_GATES, "vaultVisited", () => {
            traceBacktraceFinding("m1", "vault");
            appendBacktraceLogs("m1", M01_LOG_AFTERMATH());
        });
    });

    quest.Events.on(M01_PROJECT_OPENED_EVENT, (data: { folder: string }) => {
        if (data.folder !== M01_LEDGERVAULT_PROJECT_FOLDER) return;

        advanceStep(quest, M01_GATES, "caseFileOpened", () => traceBacktraceFinding("m1", "caseId"));
    });
};

const bindReport = (quest: M01Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M01_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M01_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M01_GATES, "reportSent", () =>
            quest.completeObjective(M01_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M01_PREMATURE_MAIL_SLOT, buildM01PrematureReply(firstUnmetStep(M01_STEP_ORDER, quest.Data)));
    });
};

export const bindM01Vault = (quest: M01Quest): void => {
    bindVault(quest);
    bindReport(quest);
};
