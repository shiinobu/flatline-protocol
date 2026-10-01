import { M02_SHELL_COMPANY_NAME } from "../../content/global/entities.js";
import { M02_DEV_SUBDOMAIN } from "../../content/m02/network.js";
import {
    M02_REPORT_SUBJECT,
    M02_REPORT_TEMPLATE_CONTENT,
    M02_REPORT_TEMPLATE_ID,
    M02_REPORT_TEMPLATE_LABEL,
    buildM02ReportBody,
} from "../../content/m02/report.js";
import type { ReportSpec } from "../../core/types.js";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { developer_url: developerUrl, shellCompany } = fields;

    return developerUrl === M02_DEV_SUBDOMAIN && shellCompany === M02_SHELL_COMPANY_NAME;
};

export const M02_REPORT_SPEC: ReportSpec = {
    templateId: M02_REPORT_TEMPLATE_ID,
    templateLabel: M02_REPORT_TEMPLATE_LABEL,
    fields: ["developer_url", "shellCompany"],
    subject: M02_REPORT_SUBJECT,
    templateContent: M02_REPORT_TEMPLATE_CONTENT,
    body: buildM02ReportBody,
    matchesFields,
};
