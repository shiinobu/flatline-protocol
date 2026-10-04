import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import { M01_LEDGERVAULT_PROJECT_LABEL } from "../global/case.js";
import { M05_BEDSIDE_ASSET_TAG } from "./network.js";

export const M05_FOUND_NOTE_FILE_NAME = "found_note";
export const M05_USB_HISTORY_FILE_NAME = "usb_history";
export const M05_TXT = "txt";
export const M05_LOG = "log";

export const M05_USB_DATE = "2026-08-11";
export const M05_USB_TIME = "00:12";
export const M05_ACK_DATE = "2026-08-18";
export const M05_NEGOTIATOR = "Brightwater Resolutions";

const bonusVars = (): Record<string, string> => ({
    usbDate: M05_USB_DATE,
    usbTime: M05_USB_TIME,
    assetTag: M05_BEDSIDE_ASSET_TAG,
    label: M01_LEDGERVAULT_PROJECT_LABEL,
});

export const M05_FOUND_NOTE_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_FOUND_NOTE, bonusVars());
export const M05_USB_HISTORY_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_USB_HISTORY, bonusVars());
export const M05_DECOY_PACS_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_DECOY_PACS);
export const M05_DECOY_BILLING_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_DECOY_BILLING);
