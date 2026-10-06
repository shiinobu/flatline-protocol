import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { ARCHITECT_REAL_NAME } from "../global/characters.js";
import { M07_CHOICES } from "./choice.js";
import { M07_RESERVE_EU_REF, M07_RESERVE_MED_REF, M07_SETTLEMENT_ACCOUNT_NUMBER } from "./claims.js";
import {
    M07_ASHVECTOR_CODENAME,
    M07_BROKER_INFRA_DOMAIN,
    M07_BROKER_INFRA_IP,
    M07_C2_IP,
    M07_FIREWALL_LABEL,
    M07_INDEX_TAG,
} from "./network.js";
import { M07_ORDER_GO_TIME, M07_SENTRY_ACCOUNT, M07_SURVEY_CODE } from "./server-files.js";

export const M07_ARCHITECT_REAL_NAME = ARCHITECT_REAL_NAME;

export const M07_REPORT_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M07_REPORT_TEMPLATE_ID = "flatline.m07.report";
export const M07_REPORT_TEMPLATE_LABEL = "Mission 7 Findings";

export const M07_REPORT_CHOICE_HINT = M07_CHOICES.join(" / ");

export const M07_REPORT_ARCHITECT_TERMS: readonly string[] = ["lindqvist", M07_SENTRY_ACCOUNT];
export const M07_REPORT_ARCHITECT_REJECTED_TERMS: readonly string[] = ["voss", "hartley"];
export const M07_REPORT_PATH_TERMS: readonly string[] = [
    M07_ASHVECTOR_CODENAME,
    M07_FIREWALL_LABEL,
    M07_C2_IP,
    M07_INDEX_TAG,
];
export const M07_REPORT_PATH_REJECTED_TERMS: readonly string[] = ["null crown"];
export const M07_REPORT_CLAIMS_TERMS: readonly string[] = ["paid"];
export const M07_REPORT_CLAIMS_PAYER_TERMS: readonly string[] = ["nordhaven", "insurer", "insurance", "保险"];
export const M07_REPORT_RESERVE_TERMS: readonly string[] = [M07_RESERVE_EU_REF, M07_RESERVE_MED_REF];
export const M07_REPORT_ORDER_TIME_TERMS: readonly string[] = [M07_ORDER_GO_TIME];
export const M07_REPORT_ORDER_WHO_TERMS: readonly string[] = [M07_SENTRY_ACCOUNT];
export const M07_REPORT_ORDER_SOURCE_TERMS: readonly string[] = [M07_BROKER_INFRA_IP, M07_BROKER_INFRA_DOMAIN];
export const M07_REPORT_SURVEY_TERMS: readonly string[] = ["survey", "loss control", "loss-control", "调查"];
export const M07_REPORT_SURVEY_DATE_TERMS: readonly string[] = ["2026-08-03", "3 aug", "aug 3", "8月3日", "8 3"];
export const M07_REPORT_ACCOUNT_TERMS: readonly string[] = [M07_SETTLEMENT_ACCOUNT_NUMBER, "skn"];
export const M07_REPORT_INSTRUCTION_TERMS: readonly string[] = ["orchid"];
export const M07_REPORT_INSTRUCTION_DATE_TERMS: readonly string[] = ["2026-06-24", "24 jun", "jun 24", "6月24日", "6 24"];
export const M07_SURVEY_CODE_TERM = M07_SURVEY_CODE;

export const M07_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, { choices: M07_REPORT_CHOICE_HINT });
