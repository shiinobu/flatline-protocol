import {
    M06_REPORT_AGENT,
    M06_REPORT_NOMINEES,
    M06_REPORT_SUBJECT,
    M06_REPORT_TEMPLATE_CONTENT,
    M06_REPORT_TEMPLATE_ID,
    M06_REPORT_TEMPLATE_LABEL,
    buildM06ReportBody,
} from "../../content/m06/report.js";
import type { ReportSpec } from "../../core/types.js";

const normalize = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { nominees, agent } = fields;

    return (
        normalize(nominees) === normalize(M06_REPORT_NOMINEES) &&
        normalize(agent) === normalize(M06_REPORT_AGENT)
    );
};

export const M06_REPORT_SPEC: ReportSpec = {
    templateId: M06_REPORT_TEMPLATE_ID,
    templateLabel: M06_REPORT_TEMPLATE_LABEL,
    fields: ["nominees", "agent"],
    subject: M06_REPORT_SUBJECT,
    templateContent: M06_REPORT_TEMPLATE_CONTENT,
    body: buildM06ReportBody,
    matchesFields,
};
