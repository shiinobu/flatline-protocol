import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";

export const M04_LOG_PROBE = (): readonly string[] => [Localization.t(M04_I18N_KEY.LOG_PROBE_1)];
export const M04_LOG_BREACH = (): readonly string[] => [Localization.t(M04_I18N_KEY.LOG_BREACH_1)];
export const M04_LOG_ORIGIN = (): readonly string[] => [Localization.t(M04_I18N_KEY.LOG_ORIGIN_1)];
export const M04_LOG_RELAY1 = (): readonly string[] => [
    Localization.t(M04_I18N_KEY.LOG_RELAY1_1),
    Localization.t(M04_I18N_KEY.LOG_RELAY1_2),
];
export const M04_LOG_RELAY2 = (): readonly string[] => [
    Localization.t(M04_I18N_KEY.LOG_RELAY2_1),
    Localization.t(M04_I18N_KEY.LOG_RELAY2_2),
];
export const M04_LOG_CONTROL = (): readonly string[] => [
    Localization.t(M04_I18N_KEY.LOG_CONTROL_1),
    Localization.t(M04_I18N_KEY.LOG_CONTROL_2),
];
