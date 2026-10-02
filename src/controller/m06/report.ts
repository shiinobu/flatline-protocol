import {
    M06_REPORT_ARCHITECT,
    M06_REPORT_CHAIN,
    M06_REPORT_FRONT,
    M06_REPORT_PROOF,
    M06_REPORT_ROLE,
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
    const { architect, role, chain, proof, front } = fields;

    return (
        normalize(architect) === normalize(M06_REPORT_ARCHITECT) &&
        normalize(role) === normalize(M06_REPORT_ROLE) &&
        normalize(chain) === normalize(M06_REPORT_CHAIN) &&
        normalize(proof) === normalize(M06_REPORT_PROOF) &&
        normalize(front) === normalize(M06_REPORT_FRONT)
    );
};

export const M06_REPORT_SPEC: ReportSpec = {
    templateId: M06_REPORT_TEMPLATE_ID,
    templateLabel: M06_REPORT_TEMPLATE_LABEL,
    fields: ["architect", "role", "chain", "proof", "front"],
    subject: M06_REPORT_SUBJECT,
    templateContent: M06_REPORT_TEMPLATE_CONTENT,
    body: buildM06ReportBody,
    matchesFields,
};
