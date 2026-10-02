import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import { GRETA_FULL_NAME, VIVIEN_ORCHID_FULL_NAME } from "../global/characters.js";
import { M05_GAP_TEXT } from "./quest.js";

export const M05_REPORT_SUBJECT = (): string => Localization.t(M05_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M05_REPORT_TEMPLATE_ID = "flatline.m05.report";
export const M05_REPORT_TEMPLATE_LABEL = "Mission 5 Findings";

export const M05_REPORT_DOOR = GRETA_FULL_NAME;
export const M05_REPORT_CAUSE = "unauthorised USB media, employee negligence";
export const M05_REPORT_DECIDER = VIVIEN_ORCHID_FULL_NAME;
export const M05_REPORT_GAP = M05_GAP_TEXT;
export const M05_REPORT_MOTIVE = "insurance claim classification";

export const M05_REPORT_REJECTED_DOOR = "Gareth Lim";
export const M05_REPORT_REJECTED_CAUSE = "third-party remote support tool";

const reportFacts = (): Record<string, string> => ({
    door: M05_REPORT_DOOR,
    cause: M05_REPORT_CAUSE,
    decider: M05_REPORT_DECIDER,
    gap: M05_REPORT_GAP,
    motive: M05_REPORT_MOTIVE,
});

export const M05_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM05ReportBody = (): string =>
    Localization.t(M05_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
