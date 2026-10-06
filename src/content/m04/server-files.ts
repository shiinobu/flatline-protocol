import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { FINANCE_ANALYST_HANDLE } from "../global/characters.js";
import {
    M04_BEACON_INTERVAL_SECONDS,
    M04_HUNTER_TAG,
    M04_INTRUDER_IP,
    M04_NIGHT_SHIFT_IP,
    M04_PAPER_MOTH_IP,
    M04_QUIET_MIRROR_IP,
    M04_QUIET_MIRROR_PASSWORD,
    M04_QUIET_MIRROR_USERNAME,
} from "./network.js";

export const M04_FIREWALL_LOG_FOLDER = "logs";
export const M04_FIREWALL_LOG_FILE_NAME = "firewall";
export const M04_FIREWALL_LOG_FILE_EXTENSION = "log";

export const M04_SCANNER_A_IP = "45.138.157.22";
export const M04_SCANNER_B_IP = "109.205.213.78";

export const M04_FIREWALL_LOG_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.DEVICE_FIREWALL_LOG, {
        scannerA: M04_SCANNER_A_IP,
        scannerB: M04_SCANNER_B_IP,
        intruder: M04_INTRUDER_IP,
        interval: M04_BEACON_INTERVAL_SECONDS,
    });

export const M04_AUTH_LOG_FILE_NAME = "auth";
export const M04_AUTH_LOG_FILE_EXTENSION = "log";

export const M04_WATCHDOG_CONF_FILE_NAME = "watchdog";
export const M04_WATCHDOG_CONF_FILE_EXTENSION = "conf";

export const M04_OLD_TARGETS_FILE_NAME = "old_targets";
export const M04_OLD_TARGETS_FILE_EXTENSION = "txt";

export const M04_OPERATOR_NOTES_FILE_NAME = "notes";
export const M04_OPERATOR_NOTES_FILE_EXTENSION = "txt";

export const M04_MOTH_README_FILE_NAME = "README";
export const M04_MOTH_README_FILE_EXTENSION = "txt";

export const M04_AUTH_LOG_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.DEVICE_AUTH_LOG, {
        quietMirror: M04_QUIET_MIRROR_IP,
        paperMoth: M04_PAPER_MOTH_IP,
        tag: M04_HUNTER_TAG,
    });

export const M04_WATCHDOG_CONF_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.DEVICE_WATCHDOG_CONF, {
        controlHost: M04_NIGHT_SHIFT_IP,
        tag: M04_HUNTER_TAG,
        interval: M04_BEACON_INTERVAL_SECONDS,
    });

export const M04_OLD_TARGETS_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.DEVICE_OLD_TARGETS, { accomplice: FINANCE_ANALYST_HANDLE });

export const M04_OPERATOR_NOTES_CONTENT = (): string =>
    Localization.t(M04_I18N_KEY.DEVICE_OPERATOR_NOTES, {
        user: M04_QUIET_MIRROR_USERNAME,
        password: M04_QUIET_MIRROR_PASSWORD,
    });

export const M04_MOTH_README_CONTENT = (): string => Localization.t(M04_I18N_KEY.DEVICE_MOTH_README);
