import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { M07_CHOICE_DESTROY } from "../../content/m07/choice.js";
import { M07_GATES, M07_STEP_ORDER } from "../../content/m07/gates.js";
import {
    M07_DEAD_DROP_EMAIL,
    M07_PREMATURE_MAIL_SLOT,
    M07_WHATNOW_MAIL,
    buildM07PrematureReply,
} from "../../content/m07/mail.js";
import { M07_OBJECTIVE_IDS } from "../../content/m07/quest.js";
import { M07_LEDGER_FILE_NAME } from "../../content/m07/server-files.js";
import type { M07Choice } from "../../content/m07/state.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { destroyM07Network, recordM07Ending } from "./ending.js";
import { M07_REPORT_SPEC, readM07Choice } from "./report.js";
import { endM07Trace } from "./tracking.js";
import type { M07Quest } from "./types.js";
import { M07_LOG_LEDGER } from "../../content/m07/quest-logs.js";

const bindTransfer = (quest: M07Quest): void => {
    quest.Events.on("Files.Transfer", (data) => {
        if (data.type !== "DOWNLOAD" || data.file.name !== M07_LEDGER_FILE_NAME) return;
        if (quest.Data.ledgerWiped) return;

        advanceStep(quest, M07_GATES, "fileExtracted", () => {
            traceBacktraceFinding("m7", "ledger", M07_LOG_LEDGER());
            endM07Trace();
            if (!quest.Data.whatNowSent) {
                quest.SetData("whatNowSent", true);
                Mail.send(M07_WHATNOW_MAIL());
            }
        });
    });
};

const parseChoice = (subject: string, content: string): M07Choice | null => {
    if (subject !== M07_REPORT_SPEC.templateId) return null;

    let fields: unknown;
    try {
        fields = JSON.parse(content);
    } catch {
        return null;
    }
    if (!fields || typeof fields !== "object") return null;

    return readM07Choice(fields as Record<string, unknown>) as M07Choice | null;
};

const bindReport = (quest: M07Quest): void => {
    quest.Events.on("Mail.Sent", async (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M07_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M07_REPORT_SPEC, data.subject, data.content)) return;

        const choice = parseChoice(data.subject, data.content);
        if (choice === null) return;

        const accepted = advanceStep(quest, M07_GATES, "reportSent", () => {
            quest.SetData("choice", choice);
            recordM07Ending(quest, choice);
            quest.completeObjective(M07_OBJECTIVE_IDS.reportFindings);
        });
        if (!accepted) {
            sendReplacingMail(
                M07_PREMATURE_MAIL_SLOT,
                buildM07PrematureReply(firstUnmetStep(M07_STEP_ORDER, quest.Data)),
            );
            return;
        }

        if (choice === M07_CHOICE_DESTROY) await destroyM07Network();
    });
};

export const bindM07Extract = (quest: M07Quest): void => {
    bindTransfer(quest);
    bindReport(quest);
};
