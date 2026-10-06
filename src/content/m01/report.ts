import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M01_I18N_KEY } from "../../i18n/m01/core.js";
import { M01_CASE_ID } from "../global/case.js";
import { M01_BROKER_ALIAS, M01_LEDGERVAULT_DOMAIN } from "./network.js";
import { M01_BUYER_ALIAS } from "./server-files.js";

export const M01_LEDGERVAULT_PROJECT = "Q3-2026-SEA";
export const M01_LEDGERVAULT_PROJECT_FOLDER = "q3";

export const M01_REPORT_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M01_REPORT_TEMPLATE_ID = "flatline.m01.report";
export const M01_REPORT_TEMPLATE_LABEL = "Mission 1 Findings";
export const M01_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT);
export const buildM01ReportBody = (listingCode: string): string =>
    Localization.t(M01_I18N_KEY.MAIL_REPORT_BODY, {
        listingCode,
        broker: M01_BROKER_ALIAS,
        buyer: M01_BUYER_ALIAS,
        caseId: M01_CASE_ID,
        project: M01_LEDGERVAULT_PROJECT,
        vaultUrl: M01_LEDGERVAULT_DOMAIN,
    });
