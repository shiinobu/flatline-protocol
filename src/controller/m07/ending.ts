import { Files, Mail } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission, isReportTemplateAttempt } from "../../components/report.js";
import { M07_CHOICE_DESTROY } from "../../content/m07/choice.js";
import { M07_GATES, M07_STEP_ORDER } from "../../content/m07/gates.js";
import {
    M07_CLOSING_MAIL,
    M07_DEAD_DROP_EMAIL,
    M07_ROXANNE_LETTER,
    M07_PREMATURE_MAIL_SLOT,
    buildM07PrematureReply,
} from "../../content/m07/mail.js";
import { M07_LOG_ENDING } from "../../content/m07/quest-logs.js";
import { M07_OBJECTIVE_IDS } from "../../content/m07/quest.js";
import type { M07Choice } from "../../content/m07/state.js";
import { unregister } from "../../core/index.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { isDuelTwoWon } from "./duel.js";
import { findLedgerOnTarget } from "./ledger-file.js";
import { M07_REPORT_SPEC, readM07Choice } from "./report.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

const removeLedgerFromHost = async (): Promise<void> => {
    const ledger = await findLedgerOnTarget();
    if (ledger === null) return;

    Files.remove(ledger.id);
};

const applyEnding = (quest: M07Quest, choice: M07Choice): void => {
    if (quest.Data.endingApplied) return;

    quest.SetData("endingApplied", true);
    appendBacktraceLogs("m7", M07_LOG_ENDING(choice), { moment: true });

    const letter = M07_ROXANNE_LETTER(choice);
    if (letter !== null) Mail.send(letter);

    const closing = M07_CLOSING_MAIL(choice);
    if (closing !== null) Mail.send(closing);
};

const destroyNetwork = async (): Promise<void> => {
    await removeLedgerFromHost();
    unregister(M07_WORLD);
};

const parseChoice = (content: string): M07Choice | null => {
    let fields: unknown;
    try {
        fields = JSON.parse(content);
    } catch {
        return null;
    }
    if (!fields || typeof fields !== "object") return null;

    return readM07Choice(fields as Record<string, unknown>) as M07Choice | null;
};

const isReportAttempt = (subject: string, content: string): boolean =>
    isReportSubmission(M07_REPORT_SPEC, subject, content) ||
    isReportTemplateAttempt(M07_REPORT_SPEC, subject, content);

export const bindM07Report = (quest: M07Quest): void => {
    quest.Events.on("Mail.Sent", async (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M07_DEAD_DROP_EMAIL) return;

        const unmetStep = firstUnmetStep(M07_STEP_ORDER, quest.Data);
        if (unmetStep !== undefined) {
            if (isReportAttempt(data.subject, data.content)) {
                sendReplacingMail(
                    M07_PREMATURE_MAIL_SLOT,
                    buildM07PrematureReply(unmetStep, isDuelTwoWon(quest.Data)),
                );
            }
            return;
        }

        if (!isReportSubmission(M07_REPORT_SPEC, data.subject, data.content)) return;

        const choice = parseChoice(data.content);
        if (choice === null) return;

        const accepted = advanceStep(quest, M07_GATES, "reportSent", () => {
            quest.SetData("choice", choice);
            applyEnding(quest, choice);
            quest.completeObjective(M07_OBJECTIVE_IDS.reportFindings);
        });
        if (!accepted) return;

        if (choice === M07_CHOICE_DESTROY) await destroyNetwork();
    });
};
