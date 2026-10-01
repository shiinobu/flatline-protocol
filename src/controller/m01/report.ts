import { M01_CASE_ID } from "../../content/global/case.js";
import { getM01WinningCode } from "../../context/m01/listing.js";
import { M01_BROKER_ALIAS, M01_LEDGERVAULT_DOMAIN } from "../../content/m01/network.js";
import {
    M01_LEDGERVAULT_PROJECT,
    M01_REPORT_SUBJECT,
    M01_REPORT_TEMPLATE_CONTENT,
    M01_REPORT_TEMPLATE_ID,
    M01_REPORT_TEMPLATE_LABEL,
    buildM01ReportBody,
} from "../../content/m01/report.js";
import { M01_BUYER_ALIAS } from "../../content/m01/server-files.js";
import type { ReportSpec } from "../../core/types.js";

const normalizeUrlReference = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { listingCode, broker, buyer, caseId, project, vaultUrl } = fields;

    return (
        listingCode === getM01WinningCode() &&
        broker === M01_BROKER_ALIAS &&
        buyer === M01_BUYER_ALIAS &&
        caseId === M01_CASE_ID &&
        project === M01_LEDGERVAULT_PROJECT &&
        normalizeUrlReference(vaultUrl) === M01_LEDGERVAULT_DOMAIN
    );
};

export const M01_REPORT_SPEC: ReportSpec = {
    templateId: M01_REPORT_TEMPLATE_ID,
    templateLabel: M01_REPORT_TEMPLATE_LABEL,
    fields: ["listingCode", "broker", "buyer", "caseId", "project", "vaultUrl"],
    subject: M01_REPORT_SUBJECT,
    templateContent: M01_REPORT_TEMPLATE_CONTENT,
    body: () => buildM01ReportBody(getM01WinningCode()),
    matchesFields,
};
