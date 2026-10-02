import {
    M07_ARCHITECT_REAL_NAME,
    M07_REPORT_EVIDENCE,
    M07_REPORT_SUBJECT,
    M07_REPORT_TEMPLATE_CONTENT,
    M07_REPORT_TEMPLATE_ID,
    M07_REPORT_TEMPLATE_LABEL,
    buildM07ReportBody,
} from "../../content/m07/report.js";
import type { ReportSpec } from "../../core/types.js";

const normalize = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { architect, evidence } = fields;

    return (
        normalize(architect) === normalize(M07_ARCHITECT_REAL_NAME) &&
        normalize(evidence) === normalize(M07_REPORT_EVIDENCE())
    );
};

export const M07_REPORT_SPEC: ReportSpec = {
    templateId: M07_REPORT_TEMPLATE_ID,
    templateLabel: M07_REPORT_TEMPLATE_LABEL,
    fields: ["architect", "evidence"],
    subject: M07_REPORT_SUBJECT,
    templateContent: M07_REPORT_TEMPLATE_CONTENT,
    body: buildM07ReportBody,
    matchesFields,
};
