import { M02_SHELL_COMPANY_NAME, M03_PARENT_ENTITY_NAME } from "../../content/global/entities.js";
import { M04_ARCHITECT_VPN_IP } from "../../content/global/characters.js";
import {
    M03_REPORT_SUBJECT,
    M03_REPORT_TEMPLATE_CONTENT,
    M03_REPORT_TEMPLATE_ID,
    M03_REPORT_TEMPLATE_LABEL,
    buildM03ReportBody,
} from "../../content/m03/report.js";
import type { ReportSpec } from "../../core/types.js";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { shellCompany, parentEntity, vpnLead } = fields;

    return (
        shellCompany === M02_SHELL_COMPANY_NAME &&
        parentEntity === M03_PARENT_ENTITY_NAME &&
        vpnLead === M04_ARCHITECT_VPN_IP
    );
};

export const M03_REPORT_SPEC: ReportSpec = {
    templateId: M03_REPORT_TEMPLATE_ID,
    templateLabel: M03_REPORT_TEMPLATE_LABEL,
    fields: ["shellCompany", "parentEntity", "vpnLead"],
    subject: M03_REPORT_SUBJECT,
    templateContent: M03_REPORT_TEMPLATE_CONTENT,
    body: buildM03ReportBody,
    matchesFields,
};
