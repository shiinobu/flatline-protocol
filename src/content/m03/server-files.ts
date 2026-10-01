import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M03_I18N_KEY } from "../../i18n/m03/core.js";
import { M01_CASE_ID } from "../global/case.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import {
    RANSOM_BATCHES_Q3,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_SPLIT_PERCENT,
    formatUsd,
    splitRansom,
    totalRansom,
    type RansomBatch,
} from "../global/finance.js";
import {
    M03_LEDGER_BROKER_PARTY,
    M03_LEDGER_ESCROW_PARTY,
    M03_LEDGER_PANEL_PARTY,
} from "./ledger.js";
import {
    M03_ACCOMPLICE_NAME,
    M03_COINDRIFT_LAN_IP,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
    M03_VAULTLINE_CODENAME,
    M03_VPN_PEER_LABEL,
} from "./network.js";

export const M03_SPREADSHEET_FILE_NAME = "q3_reconciliation";
export const M03_SPREADSHEET_FILE_EXTENSION = "xlsx";

const buildSpreadsheetBlock = (batch: RansomBatch): string => {
    const split = splitRansom(batch.gross);

    return Localization.t(M03_I18N_KEY.DEVICE_SPREADSHEET_BLOCK, {
        ref: batch.ref,
        caseRef: batch.caseRef,
        settledAt: batch.settledAt,
        deposit: formatUsd(batch.gross),
        escrowParty: M03_LEDGER_ESCROW_PARTY,
        parentPercent: RANSOM_SPLIT_PERCENT.parent,
        parentEntity: M03_PARENT_ENTITY_NAME,
        parentAmount: formatUsd(split.parent),
        panelPercent: RANSOM_SPLIT_PERCENT.panel,
        panelParty: M03_LEDGER_PANEL_PARTY,
        panelAmount: formatUsd(split.panel),
        brokerPercent: RANSOM_SPLIT_PERCENT.broker,
        brokerParty: M03_LEDGER_BROKER_PARTY,
        brokerAmount: formatUsd(split.broker),
        retainedPercent: RANSOM_SPLIT_PERCENT.retained,
        retainedAmount: formatUsd(split.retained),
    });
};

export const M03_SPREADSHEET_CONTENT = (): string => {
    const totals = totalRansom(RANSOM_BATCHES_Q3);

    return Localization.t(M03_I18N_KEY.DEVICE_SPREADSHEET, {
        preparer: M03_ACCOMPLICE_NAME,
        parentEntity: M03_PARENT_ENTITY_NAME,
        blocks: RANSOM_BATCHES_Q3.map(buildSpreadsheetBlock).join("\n\n"),
        totalGross: formatUsd(totals.gross),
        totalParent: formatUsd(totals.parent),
        totalPanel: formatUsd(totals.panel),
        totalBroker: formatUsd(totals.broker),
        totalRetained: formatUsd(totals.retained),
        hospitalRef: RANSOM_BATCH_HOSPITAL.ref,
        caseId: M01_CASE_ID,
    });
};

export const M03_REYES_NOTE_FILE_NAME = "do_not_open_at_work";
export const M03_REYES_NOTE_FILE_EXTENSION = "txt";
export const M03_REYES_NOTE_CONTENT = (): string => Localization.t(M03_I18N_KEY.DEVICE_REYES_NOTE);

export const M03_DECOY_README_CONTENT = (): string => Localization.t(M03_I18N_KEY.DEVICE_DECOY_README);

export const M03_VPN_CONFIG_FILE_NAME = "site_to_site_backup";
export const M03_VPN_CONFIG_FILE_EXTENSION = "txt";
export const M03_VPN_CONFIG_CONTENT = (): string =>
    Localization.t(M03_I18N_KEY.DEVICE_VPN_CONFIG, {
        host: M03_VAULTLINE_CODENAME,
        peerLabel: M03_VPN_PEER_LABEL,
        architectIp: M04_ARCHITECT_VPN_IP,
        parentEntity: M03_PARENT_ENTITY_NAME,
        dbHost: M03_COINDRIFT_LAN_IP,
        dbUser: M03_FINANCE_USERNAME,
        dbPass: M03_FINANCE_PASSWORD,
    });
