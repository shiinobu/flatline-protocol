import {
    M04_REPORT_CONTAINED,
    M04_REPORT_HUNTER,
    M04_REPORT_SUBJECT,
    M04_REPORT_TEMPLATE_CONTENT,
    M04_REPORT_TEMPLATE_ID,
    M04_REPORT_TEMPLATE_LABEL,
    buildM04ReportBody,
} from "../../content/m04/report.js";
import type { ReportSpec } from "../../core/types.js";

const normalize = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { hunter, contained } = fields;

    return (
        normalize(hunter) === normalize(M04_REPORT_HUNTER) &&
        normalize(contained) === normalize(M04_REPORT_CONTAINED)
    );
};

export const M04_REPORT_SPEC: ReportSpec = {
    templateId: M04_REPORT_TEMPLATE_ID,
    templateLabel: M04_REPORT_TEMPLATE_LABEL,
    fields: ["hunter", "contained"],
    subject: M04_REPORT_SUBJECT,
    templateContent: M04_REPORT_TEMPLATE_CONTENT,
    body: buildM04ReportBody,
    matchesFields,
};
