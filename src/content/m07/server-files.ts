import { Localization } from "@hotbunny/hackhub-content-sdk";

import { sealText } from "../../components/text-seal.js";
import { M07_FILES_KEY } from "../../i18n/m07/files.js";
import { BLACKLEDGER_LEGACY_CLAIMS } from "../global/blackledger.js";
import {
    FINANCE_ANALYST_HANDLE,
    GRETA_SHORT_NAME,
    VIVIEN_ORCHID_SHORT_NAME,
} from "../global/characters.js";
import { M01_HOSPITAL_NAME, M07_INSURER_SHORT_NAME } from "../global/entities.js";
import {
    RANSOM_BATCHES,
    RANSOM_BATCH_EU,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_BATCH_NA,
    formatUsd,
    type RansomBatch,
} from "../global/finance.js";
import {
    M07_HOSPITAL_APPROVED_AT,
    M07_RESERVE_EU_DATE,
    M07_RESERVE_EU_REF,
    M07_RESERVE_MED_DATE,
    M07_RESERVE_MED_REF,
} from "./claims.js";
import {
    M07_BROKER_INFRA_DOMAIN,
    M07_BROKER_INFRA_IP,
    M07_C2_LAN_IP,
    M07_CHAIR_LAN_IP,
    M07_CLAIMS_LAN_IP,
    M07_FIREWALL_IP,
    M07_FIREWALL_LABEL,
    M07_FIREWALL_PASSWORD,
    M07_FIREWALL_USERNAME,
    M07_RDP_PORT,
} from "./network.js";
import { M07_RELEASE_ORDER_EU, M07_RELEASE_ORDER_NA, M07_RELEASE_ORDER_RUN } from "./rdc.js";
import { M07_SEAL_KEY, M07_SEAL_PLAINTEXT } from "./sealed.js";

export const M07_MANIFEST_FILE_NAME = "manifest";
export const M07_MANIFEST_FILE_EXTENSION = "txt";

export const M07_ORDERS_FILE_NAME = "release_orders";
export const M07_ORDERS_FILE_EXTENSION = "log";

export const M07_SURVEY_FILE_NAME = "survey_visits";
export const M07_SURVEY_FILE_EXTENSION = "txt";

export const M07_LEDGER_FILE_NAME = "master_ledger_backup";
export const M07_LEDGER_FILE_EXTENSION = "enc";
export const M07_LEDGER_WIPED_CONTENT = (): string => Localization.t(M07_FILES_KEY.LEDGER_WIPED);
export const M07_LEDGER_FOLDER_PATH: readonly string[] = ["var", "ledger"];

export const M07_ASH_GATE_BACKUP_FILE_NAME = "ash-gate_backup";
export const M07_ASH_GATE_BACKUP_FILE_EXTENSION = "txt";

export const M07_DECOY_FILE_NAME = "backup_old";
export const M07_DECOY_FILE_EXTENSION = "bak";

export const M07_NORDHAVEN_APPROVAL_DATE = M07_HOSPITAL_APPROVED_AT;
export const M07_EVIDENCE_CLASSIFICATION = `employee negligence (${GRETA_SHORT_NAME})`;

export const M07_SURVEY_CODE = "LC-07";
export const M07_SURVEY_VISIT_DATE = "2026-08-03";
export const M07_SENTRY_ACCOUNT = "sentry";
export const M07_FOOTHOLD_ACCOUNT = "rnatnaree";
export const M07_ORDER_GO_TIME = "02:11";

const HEX_LINE_WIDTH = 48;
const LEDGER_HEADER = "AES256-CBC";

const hexLines = (hex: string): string => (hex.match(new RegExp(`.{1,${HEX_LINE_WIDTH}}`, "g")) ?? []).join("\n");

export const M07_LEDGER_FILE_CONTENT = [LEDGER_HEADER, hexLines(sealText(M07_SEAL_PLAINTEXT, M07_SEAL_KEY))].join("\n");

const legacyAccountLine = (claim: { readonly name: string; readonly year: string; readonly region: string }): string =>
    Localization.t(M07_FILES_KEY.MANIFEST_LEGACY_ACCOUNT, {
        name: claim.name,
        year: claim.year,
        region: claim.region,
    });

const batchAccountLine = (batch: RansomBatch): string =>
    Localization.t(M07_FILES_KEY.MANIFEST_ACCOUNT, {
        caseRef: batch.caseRef,
        amount: formatUsd(batch.gross),
        settledAt: batch.settledAt,
    });

const reserveLine = (ref: string, date: string): string =>
    Localization.t(M07_FILES_KEY.MANIFEST_RESERVE, { ref, date });

export const M07_MANIFEST_CONTENT = (): string =>
    Localization.t(M07_FILES_KEY.MANIFEST, {
        accounts: [...BLACKLEDGER_LEGACY_CLAIMS.map(legacyAccountLine), ...RANSOM_BATCHES.map(batchAccountLine)].join(
            "\n",
        ),
        reserves: [
            reserveLine(M07_RESERVE_EU_REF, M07_RESERVE_EU_DATE),
            reserveLine(M07_RESERVE_MED_REF, M07_RESERVE_MED_DATE),
        ].join("\n"),
        hospitalCaseRef: RANSOM_BATCH_HOSPITAL.caseRef,
        hospitalName: M01_HOSPITAL_NAME,
        ledgerFile: `${M07_LEDGER_FILE_NAME}.${M07_LEDGER_FILE_EXTENSION}`,
        scapegoat: GRETA_SHORT_NAME,
        riskOfficer: VIVIEN_ORCHID_SHORT_NAME,
        insurer: M07_INSURER_SHORT_NAME,
        approvalDate: M07_NORDHAVEN_APPROVAL_DATE,
        indexAddress: M07_C2_LAN_IP,
        chairAddress: M07_CHAIR_LAN_IP,
        claimsAddress: M07_CLAIMS_LAN_IP,
        accomplice: FINANCE_ANALYST_HANDLE,
    });

type OrderKind = "kit" | "session" | "go" | "push" | "lock" | "pay" | "audit";

interface OrderRow {
    readonly at: string;
    readonly kind: OrderKind;
    readonly ro?: string;
    readonly target?: string;
    readonly foothold?: boolean;
    readonly sameDay?: boolean;
    readonly flag?: number;
}

const ORDER_ROWS: readonly OrderRow[] = [
    { at: "2026-04-27 23:58", kind: "kit", ro: M07_RELEASE_ORDER_EU, target: RANSOM_BATCH_EU.caseRef },
    { at: "2026-04-28 00:21", kind: "session", ro: M07_RELEASE_ORDER_EU },
    { at: "2026-05-02 08:44", kind: "go", ro: M07_RELEASE_ORDER_EU },
    { at: "2026-05-02 09:04", kind: "pay", ro: M07_RELEASE_ORDER_EU, sameDay: false },
    { at: "2026-07-17 23:40", kind: "kit", ro: M07_RELEASE_ORDER_NA, target: RANSOM_BATCH_NA.caseRef },
    { at: "2026-07-18 00:05", kind: "session", ro: M07_RELEASE_ORDER_NA },
    { at: "2026-07-22 08:31", kind: "go", ro: M07_RELEASE_ORDER_NA },
    { at: "2026-07-22 09:04", kind: "pay", ro: M07_RELEASE_ORDER_NA, sameDay: true },
    { at: "2026-07-22 09:30", kind: "audit", flag: 1 },
    { at: "2026-08-11 00:12", kind: "kit", ro: M07_RELEASE_ORDER_RUN, target: "PC-IT-017, PacificCare Health" },
    { at: "2026-08-11 00:41", kind: "session", ro: M07_RELEASE_ORDER_RUN, foothold: true },
    { at: "2026-08-11 01:03", kind: "session", ro: M07_RELEASE_ORDER_RUN, foothold: true },
    { at: "2026-08-12 02:17", kind: "session", ro: M07_RELEASE_ORDER_RUN, foothold: true },
    { at: "2026-08-13 01:58", kind: "session", ro: M07_RELEASE_ORDER_RUN, foothold: true },
    { at: "2026-08-14 02:09", kind: "session", ro: M07_RELEASE_ORDER_RUN, foothold: true },
    { at: `2026-08-14 ${M07_ORDER_GO_TIME}`, kind: "go", ro: M07_RELEASE_ORDER_RUN },
    { at: "2026-08-14 02:14", kind: "push", ro: M07_RELEASE_ORDER_RUN },
    { at: "2026-08-14 02:41", kind: "lock", ro: M07_RELEASE_ORDER_RUN },
    { at: "2026-08-14 09:02", kind: "pay", ro: M07_RELEASE_ORDER_RUN, sameDay: true },
    { at: "2026-08-14 09:20", kind: "audit", flag: 2 },
];

const orderText = (row: OrderRow): string => {
    const params = {
        ro: row.ro ?? "",
        target: row.target ?? "",
        host: `${M07_BROKER_INFRA_DOMAIN} (${M07_BROKER_INFRA_IP})`,
        account:
            row.foothold === true
                ? M07_FOOTHOLD_ACCOUNT
                : Localization.t(M07_FILES_KEY.ORDER_ACCOUNT_NONE),
        by: M07_SENTRY_ACCOUNT,
        when: Localization.t(row.sameDay === true ? M07_FILES_KEY.ORDER_WHEN_SAME : M07_FILES_KEY.ORDER_WHEN_NEXT),
        flag: String(row.flag ?? 0),
    };
    const keys: Readonly<Record<OrderKind, string>> = {
        kit: M07_FILES_KEY.ORDER_KIT,
        session: M07_FILES_KEY.ORDER_SESSION,
        go: M07_FILES_KEY.ORDER_GO,
        push: M07_FILES_KEY.ORDER_PUSH,
        lock: M07_FILES_KEY.ORDER_LOCK,
        pay: M07_FILES_KEY.ORDER_PAY,
        audit: M07_FILES_KEY.ORDER_AUDIT,
    };

    return Localization.t(keys[row.kind], params);
};

export const M07_ORDERS_CONTENT = (): string =>
    ORDER_ROWS.map((row) => `${row.at} UTC  ${orderText(row)}`).join("\n");

export const M07_SURVEY_CONTENT = (): string =>
    Localization.t(M07_FILES_KEY.SURVEY, {
        code: M07_SURVEY_CODE,
        insurer: M07_INSURER_SHORT_NAME,
        hospital: M01_HOSPITAL_NAME,
        north: BLACKLEDGER_LEGACY_CLAIMS[0].name,
        northDate: "2020-03-19",
        rhein: BLACKLEDGER_LEGACY_CLAIMS[1].name,
        rheinDate: "2023-06-28",
    });

export const M07_ASH_GATE_BACKUP_CONTENT = (): string =>
    Localization.t(M07_FILES_KEY.ASH_GATE_BACKUP, {
        firewallName: M07_FIREWALL_LABEL,
        firewallIp: M07_FIREWALL_IP,
        username: M07_FIREWALL_USERNAME,
        password: M07_FIREWALL_PASSWORD,
        targetLanIp: M07_C2_LAN_IP,
        rdpPort: M07_RDP_PORT,
    });

export const M07_DECOY_CONTENT = (): string => Localization.t(M07_FILES_KEY.DECOY_README);
