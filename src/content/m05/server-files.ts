import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import { GRETA_SHORT_NAME, VIVIEN_ORCHID_FULL_NAME } from "../global/characters.js";
import { M01_LEDGERVAULT_PROJECT_LABEL } from "../global/case.js";
import { RANSOM_BATCH_HOSPITAL, formatUsd } from "../global/finance.js";
import { M05_BEDSIDE_ASSET_TAG, M05_GRETA_USERNAME } from "./network.js";

export const M05_VAR_FOLDER = "var";
export const M05_IR_FOLDER = "ir";
export const M05_IR_DATE_FOLDER = "2026-08-14";
export const M05_IR_TICKETS_FOLDER = "tickets";

export const M05_DECISION_MEMO_FILE_NAME = "decision_memo";
export const M05_FINDING_DRAFT_FILE_NAME = "finding_draft_v1";
export const M05_FINDING_FINAL_FILE_NAME = "finding_final";
export const M05_ACKNOWLEDGEMENT_FILE_NAME = "acknowledgement_gdesouza";
export const M05_USB_TICKET_FILE_NAME = `usb_ticket_${M05_BEDSIDE_ASSET_TAG}`;
export const M05_ASSET_REGISTER_FILE_NAME = "asset_register";
export const M05_GRETA_NOTES_FILE_NAME = "notes";
export const M05_FOUND_NOTE_FILE_NAME = "found_note";
export const M05_USB_HISTORY_FILE_NAME = "usb_history";
export const M05_TXT = "txt";
export const M05_LOG = "log";

export const M05_INCIDENT_DATE = "2026-08-14";
export const M05_DRAFT_DATE = "2026-08-15";
export const M05_ACK_DATE = "2026-08-18";
export const M05_FINAL_DATE = "2026-08-19";
export const M05_CLOSED_DATE = "2026-08-24";
export const M05_USB_DATE = "2026-08-11";
export const M05_USB_TIME = "00:12";
export const M05_CONTRACT_END = "2026-07-31";
export const M05_NEGOTIATOR = "Brightwater Resolutions";

const docVars = (): Record<string, string> => ({
    caseRef: RANSOM_BATCH_HOSPITAL.caseRef,
    amount: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
    incidentDate: M05_INCIDENT_DATE,
    draftDate: M05_DRAFT_DATE,
    ackDate: M05_ACK_DATE,
    finalDate: M05_FINAL_DATE,
    closedDate: M05_CLOSED_DATE,
    usbDate: M05_USB_DATE,
    usbTime: M05_USB_TIME,
    contractEnd: M05_CONTRACT_END,
    decider: VIVIEN_ORCHID_FULL_NAME,
    negotiator: M05_NEGOTIATOR,
    scapegoat: GRETA_SHORT_NAME,
    assetTag: M05_BEDSIDE_ASSET_TAG,
    account: M05_GRETA_USERNAME,
    label: M01_LEDGERVAULT_PROJECT_LABEL,
});

export const M05_DECISION_MEMO_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_DECISION_MEMO, docVars());
export const M05_FINDING_DRAFT_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_FINDING_DRAFT, docVars());
export const M05_FINDING_FINAL_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_FINDING_FINAL, docVars());
export const M05_ACKNOWLEDGEMENT_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_ACKNOWLEDGEMENT, docVars());
export const M05_USB_TICKET_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_USB_TICKET, docVars());
export const M05_ASSET_REGISTER_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_ASSET_REGISTER, docVars());
export const M05_GRETA_NOTES_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_GRETA_NOTES, docVars());
export const M05_FOUND_NOTE_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_FOUND_NOTE, docVars());
export const M05_USB_HISTORY_CONTENT = (): string =>
    Localization.t(M05_I18N_KEY.DOC_USB_HISTORY, docVars());
export const M05_DECOY_PACS_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_DECOY_PACS);
export const M05_DECOY_BILLING_CONTENT = (): string => Localization.t(M05_I18N_KEY.DOC_DECOY_BILLING);
