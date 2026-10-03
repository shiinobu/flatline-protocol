import { M02_SHELL_COMPANY_NAME } from "../../content/global/entities.js";
import { M02_DEV_SUBDOMAIN } from "../../content/m02/network.js";
import {
    M02_REPORT_SUBJECT,
    M02_REPORT_TEMPLATE_CONTENT,
    M02_REPORT_TEMPLATE_ID,
    M02_REPORT_TEMPLATE_LABEL,
    buildM02ReportBody,
    M02_REPORT_HOME_PATH,
    M02_REPORT_RANSOM_DIGITS,
} from "../../content/m02/report.js";
import type { ReportSpec } from "../../core/types.js";
import { answerHasAll, answerIncludes, answerNumbers } from "../../components/report-match.js";
import { M02_DEPLOY_PAYLOAD_NAME } from "../../content/m02/server-files.js";

const matchesRansom = (value: unknown): boolean => answerNumbers(value).join("").includes(M02_REPORT_RANSOM_DIGITS);

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { developer_url: developerUrl, shellCompany, ransom, payload, homePath } = fields;

    return (
        developerUrl === M02_DEV_SUBDOMAIN &&
        shellCompany === M02_SHELL_COMPANY_NAME &&
        matchesRansom(ransom) &&
        answerIncludes(payload, M02_DEPLOY_PAYLOAD_NAME) &&
        answerHasAll(homePath, M02_REPORT_HOME_PATH)
    );
};

export const M02_REPORT_SPEC: ReportSpec = {
    templateId: M02_REPORT_TEMPLATE_ID,
    templateLabel: M02_REPORT_TEMPLATE_LABEL,
    fields: ["developer_url", "shellCompany", "ransom", "payload", "homePath"],
    subject: M02_REPORT_SUBJECT,
    templateContent: M02_REPORT_TEMPLATE_CONTENT,
    body: buildM02ReportBody,
    matchesFields,
};
