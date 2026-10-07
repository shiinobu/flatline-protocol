import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M02_I18N_KEY } from "../../i18n/m02/core.js";
import { M01_CASE_ID } from "../global/case.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import { M02_SHELL_COMPANY_NAME } from "../global/entities.js";
import { RANSOM_BATCH_HOSPITAL, RANSOM_BATCH_NA, RANSOM_SPLIT_PERCENT, formatUsd } from "../global/finance.js";
import { M02_CLOSER_RIG_IP, M02_WORKSTATION_ROUTER_IP } from "./network.js";

export const M02_DEPLOY_PAYLOAD_NAME = "payload_v9";

export const M02_DEPLOY_LOG_FILE_NAME = "deploy";
export const M02_DEPLOY_LOG_FILE_EXTENSION = "log";
export const M02_DEPLOY_LOG_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_DEPLOY_LOG, {
        date: RANSOM_BATCH_HOSPITAL.settledAt,
        payload: M02_DEPLOY_PAYLOAD_NAME,
        caseId: M01_CASE_ID,
        amount: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
        batch: RANSOM_BATCH_HOSPITAL.ref,
    });

export const M02_SYNC_SCRIPT_FILE_NAME = "sync-home";
export const M02_SYNC_SCRIPT_FILE_EXTENSION = "txt";
export const M02_SYNC_SCRIPT_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_SYNC_SCRIPT, { homeIp: M02_WORKSTATION_ROUTER_IP });

export const M02_FINANCIAL_DOC_FILE_NAME = "wire_authorization";
export const M02_FINANCIAL_DOC_FILE_EXTENSION = "pdf";
export const M02_FINANCIAL_DOC_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_WIRE_AUTHORIZATION, {
        batch: RANSOM_BATCH_HOSPITAL.ref,
        caseRef: RANSOM_BATCH_HOSPITAL.caseRef,
        shellCompany: M02_SHELL_COMPANY_NAME,
        amount: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
        date: RANSOM_BATCH_HOSPITAL.settledAt,
    });

export const M02_WORKSTATION_ERRANDS_FILE_NAME = "errands";
export const M02_WORKSTATION_ERRANDS_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_ERRANDS_CONTENT = (): string => Localization.t(M02_I18N_KEY.DEVICE_ERRANDS);

export const M02_WORKSTATION_UNSENT_FILE_NAME = "unsent";
export const M02_WORKSTATION_UNSENT_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_UNSENT_CONTENT = (): string => Localization.t(M02_I18N_KEY.DEVICE_UNSENT);

export const M02_AFFILIATE_ENDPOINTS_FILE_NAME = "affiliate_endpoints";
export const M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION = "txt";
export const M02_AFFILIATE_ENDPOINTS_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_AFFILIATE_ENDPOINTS, { closerIp: M02_CLOSER_RIG_IP });

export const M02_QUOTA_REPORT_FILE_NAME = "quota_report";
export const M02_QUOTA_REPORT_FILE_EXTENSION = "txt";
export const M02_QUOTA_REPORT_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_QUOTA_REPORT, {
        caseRef: RANSOM_BATCH_NA.caseRef,
        amount: formatUsd(RANSOM_BATCH_NA.gross),
        panelPercent: RANSOM_SPLIT_PERCENT.panel,
    });

export const M02_ROUTING_NOTES_FILE_NAME = "routing_notes";
export const M02_ROUTING_NOTES_FILE_EXTENSION = "txt";
export const M02_ROUTING_NOTES_CONTENT = (): string =>
    Localization.t(M02_I18N_KEY.DEVICE_ROUTING_NOTES, { architectIp: M04_ARCHITECT_VPN_IP });

export const M02_DECOY_README_CONTENT = (): string => Localization.t(M02_I18N_KEY.DEVICE_DECOY_README);
export const M02_DECOY_NOTES_CONTENT = (): string => Localization.t(M02_I18N_KEY.DEVICE_DECOY_NOTES);
