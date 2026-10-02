import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M06_I18N_KEY } from "../../i18n/m06/core.js";

export const M06_LOG_NOMINEES = (): readonly string[] => [Localization.t(M06_I18N_KEY.LOG_NOMINEES_1)];
export const M06_LOG_OWNERSHIP = (): readonly string[] => [
    Localization.t(M06_I18N_KEY.LOG_OWNERSHIP_1),
    Localization.t(M06_I18N_KEY.LOG_OWNERSHIP_2),
];
export const M06_LOG_INSURER = (): readonly string[] => [Localization.t(M06_I18N_KEY.LOG_INSURER_1)];
export const M06_LOG_IDENTITY = (): readonly string[] => [
    Localization.t(M06_I18N_KEY.LOG_IDENTITY_1),
    Localization.t(M06_I18N_KEY.LOG_IDENTITY_2),
];
export const M06_LOG_CAPTURE = (): readonly string[] => [Localization.t(M06_I18N_KEY.LOG_CAPTURE_1)];
export const M06_LOG_CERTIFICATE = (): readonly string[] => [Localization.t(M06_I18N_KEY.LOG_CERTIFICATE_1)];
