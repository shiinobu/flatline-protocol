import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { M04_BEACON_INTERVAL_SECONDS, M04_INTRUDER_IP } from "./network.js";

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
