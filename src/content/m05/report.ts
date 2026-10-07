import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import { ROXANNE_FULL_NAME, VIVIEN_ORCHID_FULL_NAME } from "../global/characters.js";
import { M05_COLD_CHART_CODENAME } from "./network.js";
import { M05_GAP_TEXT, M05_GAP_TOTAL_MINUTES } from "./quest.js";

export const M05_REPORT_SUBJECT = (): string => Localization.t(M05_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M05_REPORT_TEMPLATE_ID = "flatline.m05.report";
export const M05_REPORT_TEMPLATE_LABEL = "Mission 5 Findings";

export const M05_REPORT_DOOR = ROXANNE_FULL_NAME;
export const M05_REPORT_CAUSE = "unauthorised USB media, employee negligence";
export const M05_REPORT_DECIDER = VIVIEN_ORCHID_FULL_NAME;
export const M05_REPORT_GAP = M05_GAP_TEXT;
export const M05_REPORT_MOTIVE = "insurance claim classification";
export const M05_REPORT_ARCHIVE = M05_COLD_CHART_CODENAME;

export const M05_REPORT_DOOR_TERMS: readonly string[] = ["roxanne", "natnaree"];
export const M05_REPORT_DOOR_REJECTED_TERMS: readonly string[] = ["gideon"];
export const M05_REPORT_CAUSE_MEDIA_TERMS: readonly string[] = ["usb", "u盘", "优盘", "移动介质", "可移动"];
export const M05_REPORT_CAUSE_FAULT_TERMS: readonly string[] = [
    "negligen",
    "careless",
    "unauthori",
    "policy",
    "疏忽",
    "过失",
    "失职",
    "违规",
    "未经授权",
];
export const M05_REPORT_CAUSE_REJECTED_TERMS: readonly string[] = [
    "vendor",
    "remote support",
    "third party",
    "supplier",
    "第三方",
    "远程支持",
    "供应商",
];
export const M05_REPORT_GAP_FIGURES: readonly string[] = ["6", "21"];
export const M05_REPORT_GAP_TOTAL: string = M05_GAP_TOTAL_MINUTES;
export const M05_REPORT_DECIDER_TERMS: readonly string[] = ["orchid", "vivien"];
export const M05_REPORT_MOTIVE_TERMS: readonly string[] = ["insur", "claim", "cover", "保险", "理赔", "承保"];

const reportFacts = (): Record<string, string> => ({
    door: M05_REPORT_DOOR,
    cause: M05_REPORT_CAUSE,
    decider: M05_REPORT_DECIDER,
    gap: M05_REPORT_GAP,
    motive: M05_REPORT_MOTIVE,
    archive: M05_REPORT_ARCHIVE,
});

export const M05_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT);

export const buildM05ReportBody = (): string =>
    Localization.t(M05_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
