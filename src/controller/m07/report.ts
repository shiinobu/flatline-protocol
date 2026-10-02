import { answerHasAny, normalizeAnswer } from "../../components/report-match.js";
import { isM07Choice } from "../../content/m07/choice.js";
import {
    M07_REPORT_ARCHITECT_TERMS,
    M07_REPORT_EVIDENCE_FAULT_TERMS,
    M07_REPORT_EVIDENCE_PERSON_TERMS,
    M07_REPORT_SUBJECT,
    M07_REPORT_TEMPLATE_CONTENT,
    M07_REPORT_TEMPLATE_ID,
    M07_REPORT_TEMPLATE_LABEL,
} from "../../content/m07/report.js";
import type { ReportSpec } from "../../core/types.js";

export const readM07Choice = (fields: Record<string, unknown>): string | null => {
    const { choice } = fields;
    return isM07Choice(choice) ? normalizeAnswer(choice) : null;
};

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { architect, evidence } = fields;

    return (
        answerHasAny(architect, M07_REPORT_ARCHITECT_TERMS) &&
        answerHasAny(evidence, M07_REPORT_EVIDENCE_FAULT_TERMS) &&
        answerHasAny(evidence, M07_REPORT_EVIDENCE_PERSON_TERMS) &&
        readM07Choice(fields) !== null
    );
};

export const M07_REPORT_SPEC: ReportSpec = {
    templateId: M07_REPORT_TEMPLATE_ID,
    templateLabel: M07_REPORT_TEMPLATE_LABEL,
    fields: ["architect", "evidence", "choice"],
    subject: M07_REPORT_SUBJECT,
    templateContent: M07_REPORT_TEMPLATE_CONTENT,
    matchesFields,
};
