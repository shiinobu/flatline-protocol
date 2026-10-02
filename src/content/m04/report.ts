import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import {
    M04_HUNTER_TAG,
    M04_NIGHT_SHIFT_IP,
    M04_PAPER_MOTH_CODENAME,
    M04_QUIET_MIRROR_CODENAME,
    M04_STATIC_HOP_CODENAME,
} from "./network.js";

export const M04_REPORT_SUBJECT = (): string => Localization.t(M04_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M04_REPORT_TEMPLATE_ID = "flatline.m04.report";
export const M04_REPORT_TEMPLATE_LABEL = "Mission 4 Findings";

export const M04_REPORT_HUNTER = M04_HUNTER_TAG;
export const M04_REPORT_RELAYS = `${M04_STATIC_HOP_CODENAME}, ${M04_QUIET_MIRROR_CODENAME}`;
export const M04_REPORT_CONTROL = M04_NIGHT_SHIFT_IP;
export const M04_REPORT_ORIGIN = (): string => Localization.t(M04_I18N_KEY.OSINT_WHOIS_CONTROL_CONTACT);
export const M04_REPORT_CONTAINED = "yes";

export const M04_REPORT_ORIGIN_TERMS: readonly string[] = ["bulletproof", "防弹"];
export const M04_REPORT_CONTAINED_TERMS: readonly string[] = [M04_REPORT_CONTAINED, "true", "contained", "是", "已控制"];
export const M04_REPORT_REJECTED_RELAY = M04_PAPER_MOTH_CODENAME;

const reportFacts = (): Record<string, string> => ({
    hunter: M04_REPORT_HUNTER,
    relays: M04_REPORT_RELAYS,
    control: M04_REPORT_CONTROL,
    origin: M04_REPORT_ORIGIN(),
    contained: M04_REPORT_CONTAINED,
});

export const M04_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT);

export const buildM04ReportBody = (): string =>
    Localization.t(M04_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
