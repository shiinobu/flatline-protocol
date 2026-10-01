import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M02_I18N_KEY } from "../../i18n/m02/core.js";
import { M01_CASE_ID } from "../global/case.js";
import { M02_SHELL_COMPANY_NAME } from "../global/entities.js";
import {
    RANSOM_BATCH_EU,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_BATCH_NA,
    formatUsd,
    splitRansom,
} from "../global/finance.js";
import { M02_DEV_SUBDOMAIN } from "./network.js";
import { M02_FINANCIAL_DOC_FILE_EXTENSION, M02_FINANCIAL_DOC_FILE_NAME } from "./server-files.js";

export const M02_CASE_MATCH_RANSOM_AMOUNT = RANSOM_BATCH_HOSPITAL.gross;
export const M02_CASE_MATCH_SETTLED_AT = RANSOM_BATCH_HOSPITAL.settledAt;
export const M02_CASE_BATCH_REF = RANSOM_BATCH_HOSPITAL.ref;
export const M02_CASE_PANEL_SHARE = splitRansom(RANSOM_BATCH_HOSPITAL.gross).panel;
export const M02_VICTIM_CASE_ID_EU = RANSOM_BATCH_EU.caseRef;
export const M02_VICTIM_CASE_ID_NA = RANSOM_BATCH_NA.caseRef;

export const M02_REPORT_SUBJECT = (): string => Localization.t(M02_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M02_REPORT_TEMPLATE_ID = "flatline.m02.report";
export const M02_REPORT_TEMPLATE_LABEL = "Mission 2 Findings";

const reportFacts = (): Record<string, string> => ({
    caseId: M01_CASE_ID,
    ransom: formatUsd(M02_CASE_MATCH_RANSOM_AMOUNT),
    settledAt: M02_CASE_MATCH_SETTLED_AT,
    caseNa: M02_VICTIM_CASE_ID_NA,
    caseEu: M02_VICTIM_CASE_ID_EU,
    attachment: `${M02_FINANCIAL_DOC_FILE_NAME}.${M02_FINANCIAL_DOC_FILE_EXTENSION}`,
});

export const M02_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM02ReportBody = (): string =>
    Localization.t(M02_I18N_KEY.MAIL_REPORT_BODY, {
        ...reportFacts(),
        developer: M02_DEV_SUBDOMAIN,
        company: M02_SHELL_COMPANY_NAME,
    });
