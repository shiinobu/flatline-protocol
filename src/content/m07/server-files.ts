import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import {
    FINANCE_ANALYST_HANDLE,
    GRETA_SHORT_NAME,
    VIVIEN_ORCHID_SHORT_NAME,
} from "../global/characters.js";
import { BLACKLEDGER_LEGACY_CLAIMS } from "../global/blackledger.js";
import { M01_HOSPITAL_NAME, M07_INSURER_SHORT_NAME } from "../global/entities.js";
import { RANSOM_BATCHES, RANSOM_BATCH_HOSPITAL, formatUsd, type RansomBatch } from "../global/finance.js";
import {
    M07_C2_LAN_IP,
    M07_FIREWALL_IP,
    M07_FIREWALL_LABEL,
    M07_FIREWALL_PASSWORD,
    M07_FIREWALL_USERNAME,
} from "./network.js";

export const M07_MANIFEST_FILE_NAME = "manifest";
export const M07_MANIFEST_FILE_EXTENSION = "txt";

export const M07_LEDGER_FILE_NAME = "master_ledger_backup";
export const M07_LEDGER_FILE_EXTENSION = "enc";
export const M07_LEDGER_FILE_CONTENT = "AES256-CBC::[REDACTED-BINARY-BLOB]";
export const M07_LEDGER_WIPED_CONTENT = (): string => Localization.t(M07_I18N_KEY.DEVICE_LEDGER_WIPED);

export const M07_ASH_GATE_BACKUP_FILE_NAME = "ash-gate_backup";
export const M07_ASH_GATE_BACKUP_FILE_EXTENSION = "txt";

export const M07_DECOY_FILE_NAME = "backup_old";
export const M07_DECOY_FILE_EXTENSION = "bak";

export const M07_NORDHAVEN_APPROVAL_DATE = "2026-08-17";
export const M07_EVIDENCE_CLASSIFICATION = `employee negligence (${GRETA_SHORT_NAME})`;

const legacyAccountLine = (claim: { readonly name: string; readonly year: string; readonly region: string }): string =>
    Localization.t(M07_I18N_KEY.DEVICE_MANIFEST_LEGACY_ACCOUNT, {
        name: claim.name,
        year: claim.year,
        region: claim.region,
    });

const batchAccountLine = (batch: RansomBatch): string =>
    Localization.t(M07_I18N_KEY.DEVICE_MANIFEST_ACCOUNT, {
        caseRef: batch.caseRef,
        amount: formatUsd(batch.gross),
        settledAt: batch.settledAt,
    });

export const M07_MANIFEST_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.DEVICE_MANIFEST, {
        accounts: [
            ...BLACKLEDGER_LEGACY_CLAIMS.map(legacyAccountLine),
            ...RANSOM_BATCHES.map(batchAccountLine),
        ].join("\n"),
        hospitalCaseRef: RANSOM_BATCH_HOSPITAL.caseRef,
        hospitalName: M01_HOSPITAL_NAME,
        ledgerFile: `${M07_LEDGER_FILE_NAME}.${M07_LEDGER_FILE_EXTENSION}`,
        scapegoat: GRETA_SHORT_NAME,
        riskOfficer: VIVIEN_ORCHID_SHORT_NAME,
        insurer: M07_INSURER_SHORT_NAME,
        approvalDate: M07_NORDHAVEN_APPROVAL_DATE,
        accomplice: FINANCE_ANALYST_HANDLE,
    });

export const M07_ASH_GATE_BACKUP_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.DEVICE_ASH_GATE_BACKUP, {
        firewallName: M07_FIREWALL_LABEL,
        firewallIp: M07_FIREWALL_IP,
        username: M07_FIREWALL_USERNAME,
        password: M07_FIREWALL_PASSWORD,
        targetLanIp: M07_C2_LAN_IP,
    });

export const M07_DECOY_CONTENT = (): string => Localization.t(M07_I18N_KEY.DEVICE_DECOY_README);
