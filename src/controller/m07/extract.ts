import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { M07_GATES, M07_STEP_ORDER } from "../../content/m07/gates.js";
import {
    M07_DEAD_DROP_EMAIL,
    M07_PREMATURE_MAIL_SLOT,
    buildM07PrematureReply,
} from "../../content/m07/mail.js";
import { M07_OBJECTIVE_IDS } from "../../content/m07/quest.js";
import { M07_LEDGER_FILE_NAME } from "../../content/m07/server-files.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { M07_REPORT_SPEC } from "./report.js";
import type { M07Quest } from "./types.js";

const bindTransfer = (quest: M07Quest): void => {
    quest.Events.on("Files.Transfer", (data) => {
        if (data.type !== "DOWNLOAD" || data.file.name !== M07_LEDGER_FILE_NAME) return;

        advanceStep(quest, M07_GATES, "fileExtracted");
    });
};

const bindReport = (quest: M07Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M07_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M07_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M07_GATES, "reportSent", () =>
            quest.completeObjective(M07_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M07_PREMATURE_MAIL_SLOT, buildM07PrematureReply(firstUnmetStep(M07_STEP_ORDER, quest.Data)));
    });
};

export const bindM07Extract = (quest: M07Quest): void => {
    bindTransfer(quest);
    bindReport(quest);
};
