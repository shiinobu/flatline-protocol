import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M06_I18N_KEY } from "../../i18n/m06/core.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import { M06_AGENT_NAME } from "./network.js";

export const M06_REPORT_SUBJECT = (): string => Localization.t(M06_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M06_REPORT_TEMPLATE_ID = "flatline.m06.report";
export const M06_REPORT_TEMPLATE_LABEL = "Mission 6 Findings";

export const M06_REPORT_NOMINEES = `${M03_PARENT_ENTITY_NAME} Ltd`;
export const M06_REPORT_AGENT = M06_AGENT_NAME;

const reportFacts = (): Record<string, string> => ({
    nominees: M06_REPORT_NOMINEES,
    agent: M06_REPORT_AGENT,
});

export const M06_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM06ReportBody = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
