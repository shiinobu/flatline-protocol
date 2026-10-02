import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { M04_HUNTER_TAG } from "./network.js";

export const M04_REPORT_SUBJECT = (): string => Localization.t(M04_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M04_REPORT_TEMPLATE_ID = "flatline.m04.report";
export const M04_REPORT_TEMPLATE_LABEL = "Mission 4 Findings";

export const M04_REPORT_HUNTER = M04_HUNTER_TAG;
export const M04_REPORT_CONTAINED = "yes";

const reportFacts = (): Record<string, string> => ({
    hunter: M04_REPORT_HUNTER,
    contained: M04_REPORT_CONTAINED,
});

export const M04_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM04ReportBody = (): string =>
    Localization.t(M04_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
