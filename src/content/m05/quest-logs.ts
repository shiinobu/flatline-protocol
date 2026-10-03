import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";

export const M05_LOG_DISMISSED = (): readonly string[] => [Localization.t(M05_I18N_KEY.LOG_DISMISSED_1)];
export const M05_LOG_ARCHIVE = (): readonly string[] => [Localization.t(M05_I18N_KEY.LOG_ARCHIVE_1)];
export const M05_LOG_STATEMENT = (): readonly string[] => [
    Localization.t(M05_I18N_KEY.LOG_STATEMENT_1),
    Localization.t(M05_I18N_KEY.LOG_STATEMENT_2),
];
export const M05_LOG_NOTES = (): readonly string[] => [
    Localization.t(M05_I18N_KEY.LOG_NOTES_1),
    Localization.t(M05_I18N_KEY.LOG_NOTES_2),
];
export const M05_LOG_BEDSIDE = (): readonly string[] => [Localization.t(M05_I18N_KEY.LOG_BEDSIDE_1)];
export const M05_LOG_GRETA = (): readonly string[] => [
    Localization.t(M05_I18N_KEY.LOG_GRETA_1),
    Localization.t(M05_I18N_KEY.LOG_GRETA_2),
];
export const M05_LOG_MEMO = (): readonly string[] => [
    Localization.t(M05_I18N_KEY.LOG_MEMO_1),
    Localization.t(M05_I18N_KEY.LOG_MEMO_2),
];
export const M05_LOG_TICKET = (): readonly string[] => [
    Localization.t(M05_I18N_KEY.LOG_TICKET_1),
    Localization.t(M05_I18N_KEY.LOG_TICKET_2),
];
