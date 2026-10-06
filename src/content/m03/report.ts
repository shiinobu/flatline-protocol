import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M03_I18N_KEY } from "../../i18n/m03/core.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import { M02_SHELL_COMPANY_NAME, M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import {
    RANSOM_BATCHES,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_SPLIT_PERCENT,
    formatUsd,
    formatUsdShare,
    splitRansom,
} from "../global/finance.js";
import { M03_ALL_TOTALS, M03_LEDGER_BROKER_PARTY, M03_LEDGER_PANEL_PARTY } from "./ledger.js";
import {
    M03_INTERNAL_HOST_COUNT,
    M03_REMOTE_PORTAL_DOMAIN,
    M03_VAULTLINE_CODENAME,
    M03_VPN_PEER_LABEL,
} from "./network.js";

export const M03_REPORT_SUBJECT = (): string => Localization.t(M03_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M03_REPORT_TEMPLATE_ID = "flatline.m03.report";
export const M03_REPORT_TEMPLATE_LABEL = "Mission 3 Findings";

export const M03_REPORT_ENTRY_TERMS: readonly string[] = [M03_REMOTE_PORTAL_DOMAIN, M03_VAULTLINE_CODENAME];
export const M03_REPORT_ENTRY = `${M03_REMOTE_PORTAL_DOMAIN}, ${M03_VAULTLINE_CODENAME}, ${M03_INTERNAL_HOST_COUNT} hosts`;

const fundsFacts = (): Record<string, string | number> => {
    const split = splitRansom(RANSOM_BATCH_HOSPITAL.gross);

    return {
        hospitalGross: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
        hospitalDate: RANSOM_BATCH_HOSPITAL.settledAt,
        hospitalRef: RANSOM_BATCH_HOSPITAL.ref,
        parentShare: formatUsdShare(split.parent, RANSOM_SPLIT_PERCENT.parent),
        panelShare: formatUsdShare(split.panel, RANSOM_SPLIT_PERCENT.panel),
        panelParty: M03_LEDGER_PANEL_PARTY,
        brokerShare: formatUsdShare(split.broker, RANSOM_SPLIT_PERCENT.broker),
        brokerParty: M03_LEDGER_BROKER_PARTY,
        retainedShare: formatUsdShare(split.retained, RANSOM_SPLIT_PERCENT.retained),
        batchCount: RANSOM_BATCHES.length,
        allGross: formatUsd(M03_ALL_TOTALS.gross),
        allParent: formatUsd(M03_ALL_TOTALS.parent),
        peerLabel: M03_VPN_PEER_LABEL,
    };
};

export const M03_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M03_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, fundsFacts());

export const buildM03ReportBody = (): string =>
    Localization.t(M03_I18N_KEY.MAIL_REPORT_BODY, {
        ...fundsFacts(),
        shell: M02_SHELL_COMPANY_NAME,
        parent: M03_PARENT_ENTITY_NAME,
        vpn: M04_ARCHITECT_VPN_IP,
        entry: M03_REPORT_ENTRY,
    });
