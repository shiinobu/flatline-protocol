import {
    M05_REPORT_CAUSE,
    M05_REPORT_DECIDER,
    M05_REPORT_DOOR,
    M05_REPORT_GAP,
    M05_REPORT_MOTIVE,
    M05_REPORT_SUBJECT,
    M05_REPORT_TEMPLATE_CONTENT,
    M05_REPORT_TEMPLATE_ID,
    M05_REPORT_TEMPLATE_LABEL,
    buildM05ReportBody,
} from "../../content/m05/report.js";
import type { ReportSpec } from "../../core/types.js";

const normalize = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { door, cause, decider, gap, motive } = fields;

    return (
        normalize(door) === normalize(M05_REPORT_DOOR) &&
        normalize(cause) === normalize(M05_REPORT_CAUSE) &&
        normalize(decider) === normalize(M05_REPORT_DECIDER) &&
        normalize(gap) === normalize(M05_REPORT_GAP) &&
        normalize(motive) === normalize(M05_REPORT_MOTIVE)
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
