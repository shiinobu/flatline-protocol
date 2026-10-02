import {
    answerHasAll,
    answerHasAny,
    answerNumbers,
} from "../../components/report-match.js";
import {
    M05_REPORT_CAUSE_FAULT_TERMS,
    M05_REPORT_CAUSE_MEDIA_TERMS,
    M05_REPORT_CAUSE_REJECTED_TERMS,
    M05_REPORT_DECIDER_TERMS,
    M05_REPORT_DOOR_REJECTED_TERMS,
    M05_REPORT_DOOR_TERMS,
    M05_REPORT_GAP_FIGURES,
    M05_REPORT_GAP_TOTAL,
    M05_REPORT_MOTIVE_TERMS,
    M05_REPORT_SUBJECT,
    M05_REPORT_TEMPLATE_CONTENT,
    M05_REPORT_TEMPLATE_ID,
    M05_REPORT_TEMPLATE_LABEL,
    buildM05ReportBody,
} from "../../content/m05/report.js";
import type { ReportSpec } from "../../core/types.js";

const matchesDoor = (value: unknown): boolean =>
    answerHasAny(value, M05_REPORT_DOOR_TERMS) && !answerHasAny(value, M05_REPORT_DOOR_REJECTED_TERMS);

const matchesCause = (value: unknown): boolean =>
    answerHasAny(value, M05_REPORT_CAUSE_MEDIA_TERMS) &&
    answerHasAny(value, M05_REPORT_CAUSE_FAULT_TERMS) &&
    !answerHasAny(value, M05_REPORT_CAUSE_REJECTED_TERMS);

const matchesGap = (value: unknown): boolean => {
    const figures = answerNumbers(value);

    return figures.includes(M05_REPORT_GAP_TOTAL) || M05_REPORT_GAP_FIGURES.every((figure) => figures.includes(figure));
};

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { door, cause, decider, gap, motive } = fields;

    return (
        matchesDoor(door) &&
        matchesCause(cause) &&
        answerHasAny(decider, M05_REPORT_DECIDER_TERMS) &&
        matchesGap(gap) &&
        answerHasAny(motive, M05_REPORT_MOTIVE_TERMS)
    );
};

export const M05_REPORT_SPEC: ReportSpec = {
    templateId: M05_REPORT_TEMPLATE_ID,
    templateLabel: M05_REPORT_TEMPLATE_LABEL,
    fields: ["door", "cause", "decider", "gap", "motive"],
    subject: M05_REPORT_SUBJECT,
    templateContent: M05_REPORT_TEMPLATE_CONTENT,
    body: buildM05ReportBody,
    matchesFields,
};
