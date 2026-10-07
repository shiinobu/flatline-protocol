import { BLACKLEDGER_LEGACY_CLAIM_EU, BLACKLEDGER_LEGACY_CLAIM_NA } from "../global/blackledger.js";
import { M01_CASE_ID, M01_LEDGERVAULT_PROJECT_LABEL } from "../global/case.js";
import { ARCHITECT_REAL_NAME, ROXANNE_SHORT_NAME, VIVIEN_ORCHID_SHORT_NAME } from "../global/characters.js";
import { M01_HOSPITAL_NAME, M02_SHELL_COMPANY_NAME, M07_INSURER_NAME } from "../global/entities.js";
import {
    RANSOM_BATCH_EU,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_BATCH_NA,
    RANSOM_BATCHES,
    RANSOM_POSTING_TIMES,
    RANSOM_SPLIT_PERCENT,
    formatUsd,
    splitRansom,
    totalRansom,
} from "../global/finance.js";
import { M01_BROKER_ALIAS } from "../m01/network.js";
import { M01_BUYER_ALIAS } from "../m01/server-files.js";
import { M02_CLOSER_RIG_CODENAME } from "../m02/network.js";
import { M05_NEGOTIATOR } from "../m05/server-files.js";
import { M06_ARCHITECT_LEFT_BOARD, M06_HALVARD_DISSOLVED, M06_HOLDINGS_INCORPORATED } from "../m06/network.js";
import {
    M06_HALVARD_NAME,
    M06_HARTLEY_NAME,
    M06_HOLDINGS_NAME,
    M06_SKN_FULL_NAME,
    M06_SKN_NUMBER,
    M06_VOSS_NAME,
} from "../m06/records.js";
import {
    M07_RESERVE_EU_DATE,
    M07_RESERVE_EU_REF,
    M07_RESERVE_MED_DATE,
    M07_RESERVE_MED_REF,
} from "./claims.js";
import { M07_INSTRUCTION_DATE, M07_RELEASE_ORDER_EU, M07_RELEASE_ORDER_NA, M07_RELEASE_ORDER_RUN } from "./rdc.js";
import { M07_SURVEY_CODE } from "./server-files.js";

export const M07_LEDGER_ROOM_PATH = {
    home: "/",
    organisation: "/organisation",
    notice: "/notice",
    payments: "/payments",
    proof: "/proof",
    support: "/support",
} as const;

export const M07_LEDGER_ROOM_ASSET = {
    logo: "./assets/global/blackledger-logo.png",
    prototype: "./assets/m07/tr4c3404-desktop.png",
    delivered: "./assets/m05/pacificcare-lockscreen.jpg",
    notice: "./assets/m07/settlement-notice.png",
    receipt: "./assets/m01/q3-receipt.jpg",
} as const;

export const M07_LEDGER_ROOM_UPDATED = "2026-10-03";
export const M07_LEDGER_ROOM_VIEWER = "clindqvist";
export const M07_LEDGER_ROOM_TAGLINE = "every account, settled.";
export const M07_LEDGER_ROOM_FOOTER = "this page is not for you. close it.";
export const M07_PROTOTYPE_DATE = "2019-11-18";
export const M07_LOCK_TIME = "02:41 UTC";
export const M07_PAYMENT_TIME = "09:02 UTC";
export const M07_SETTLEMENT_WINDOW = "12:00:00";
export const M07_SUPPORT_CLOSE_TIME = "14:41 UTC";

export type LedgerAccountStatus = "SETTLED" | "RESERVED";

export interface LedgerAccount {
    readonly account: string;
    readonly project: string;
    readonly region: string;
    readonly opened: string;
    readonly batch: string;
    readonly gross: string;
    readonly status: LedgerAccountStatus;
}

const settledOutside = (claim: { readonly name: string; readonly year: string; readonly region: string }, project: string): LedgerAccount => ({
    account: claim.name,
    project,
    region: claim.region,
    opened: claim.year,
    batch: "outside policy terms",
    gross: "not posted",
    status: "SETTLED",
});

const settledBatch = (
    account: string,
    project: string,
    region: string,
    batch: { readonly ref: string; readonly settledAt: string; readonly gross: number },
): LedgerAccount => ({
    account,
    project,
    region,
    opened: batch.settledAt,
    batch: batch.ref,
    gross: formatUsd(batch.gross),
    status: "SETTLED",
});

const reserved = (account: string, project: string, region: string, date: string): LedgerAccount => ({
    account,
    project,
    region,
    opened: date,
    batch: "reserve open",
    gross: "not posted",
    status: "RESERVED",
});

export const M07_LEDGER_ACCOUNTS: readonly LedgerAccount[] = [
    settledOutside(BLACKLEDGER_LEGACY_CLAIM_NA, BLACKLEDGER_LEGACY_CLAIM_NA.project),
    settledOutside(BLACKLEDGER_LEGACY_CLAIM_EU, BLACKLEDGER_LEGACY_CLAIM_EU.project),
    settledBatch(RANSOM_BATCH_EU.caseRef, "Q2-2026-EU", "EU", RANSOM_BATCH_EU),
    settledBatch(RANSOM_BATCH_NA.caseRef, "Q3-2026-NA", "NA", RANSOM_BATCH_NA),
    settledBatch(`${M01_CASE_ID} (${M01_HOSPITAL_NAME})`, M01_LEDGERVAULT_PROJECT_LABEL, "SEA", RANSOM_BATCH_HOSPITAL),
    reserved(M07_RESERVE_EU_REF, "Q3-2026-EU", "EU", M07_RESERVE_EU_DATE),
    reserved(M07_RESERVE_MED_REF, "Q3-2026-APAC", "APAC", M07_RESERVE_MED_DATE),
];

export const M07_LEDGER_Q3_COUNT = M07_LEDGER_ACCOUNTS.filter((entry) => entry.project.startsWith("Q3-")).length;

export interface LedgerNode {
    readonly name: string;
    readonly role: string;
    readonly share?: string;
    readonly tone?: "chair" | "dim";
}

export interface LedgerTier {
    readonly caption: string;
    readonly nodes: readonly LedgerNode[];
}

export const M07_LEDGER_ORGANISATION: readonly LedgerTier[] = [
    {
        caption: "Chair",
        nodes: [
            {
                name: ARCHITECT_REAL_NAME,
                role: "The Architect. Operator SENTRY. Chair of the Risk Committee, Nordhaven Mutual (2018-2024).",
                tone: "chair",
            },
        ],
    },
    {
        caption: "Control",
        nodes: [
            {
                name: M07_INSURER_NAME,
                role: "The insurer. Pays the ransom, books the reserve, sends the surveyor. Holds the settlement account through SKN.",
            },
            {
                name: M06_SKN_FULL_NAME,
                role: `Parent entity. "Management fee." Settlement account ${M06_SKN_NUMBER}.`,
                share: `${RANSOM_SPLIT_PERCENT.parent}%`,
            },
            {
                name: "Nominee directors",
                role: `${M06_VOSS_NAME} and ${M06_HARTLEY_NAME}. Faces on the filing. Not decision makers.`,
                tone: "dim",
            },
        ],
    },
    {
        caption: "Supply line",
        nodes: [
            {
                name: M02_SHELL_COMPANY_NAME,
                role: "Shell company. Keeps its cut and routes the rest.",
                share: `${RANSOM_SPLIT_PERCENT.retained}%`,
            },
            {
                name: M01_BUYER_ALIAS,
                role: 'Toolkit and affiliate panel. "Consulting fees." Wrote the locker.',
                share: `${RANSOM_SPLIT_PERCENT.panel}%`,
            },
            {
                name: M01_BROKER_ALIAS,
                role: 'Initial access broker. "Customs brokerage."',
                share: `${RANSOM_SPLIT_PERCENT.broker}%`,
            },
            {
                name: M02_CLOSER_RIG_CODENAME,
                role: "FIN-NA operator, handle Qu0taCl0ser. Works through the panel. Four closes a quarter.",
                tone: "dim",
            },
        ],
    },
    {
        caption: "Field",
        nodes: [
            {
                name: `Loss-control survey ${M07_SURVEY_CODE}`,
                role: "Unnamed surveyor. Northstar 2020, Rheinland 2023, PacificCare 2026. The badge is recovered every time.",
            },
            {
                name: VIVIEN_ORCHID_SHORT_NAME,
                role: `CRO, ${M01_HOSPITAL_NAME}. Instruction of ${M07_INSTRUCTION_DATE}: pause the sync, loosen the media, do not minute it.`,
            },
            { name: M05_NEGOTIATOR, role: "Negotiator appointed by the insurer. Engaged 04:35." },
        ],
    },
];

export const M07_LEDGER_OWNERSHIP_CHAIN = `${M06_HALVARD_NAME} (dissolved ${M06_HALVARD_DISSOLVED}) → ${M06_HOLDINGS_NAME} (${M06_HOLDINGS_INCORPORATED}; the Chair left its board ${M06_ARCHITECT_LEFT_BOARD}) → ${M06_SKN_FULL_NAME}`;

export interface LedgerPaymentRow {
    readonly account: string;
    readonly batch: string;
    readonly settledAt: string;
    readonly gross: string;
    readonly parent: string;
    readonly panel: string;
    readonly broker: string;
    readonly retained: string;
}

const paymentRow = (batch: { readonly ref: string; readonly caseRef: string; readonly settledAt: string; readonly gross: number }): LedgerPaymentRow => {
    const split = splitRansom(batch.gross);
    return {
        account: batch.caseRef,
        batch: batch.ref,
        settledAt: batch.settledAt,
        gross: formatUsd(batch.gross),
        parent: formatUsd(split.parent),
        panel: formatUsd(split.panel),
        broker: formatUsd(split.broker),
        retained: formatUsd(split.retained),
    };
};

export const M07_LEDGER_PAYMENT_ROWS: readonly LedgerPaymentRow[] = RANSOM_BATCHES.map(paymentRow);

const TOTALS = totalRansom(RANSOM_BATCHES);

export const M07_LEDGER_PAYMENT_TOTAL: LedgerPaymentRow = {
    account: "Total, three batches",
    batch: "",
    settledAt: "",
    gross: formatUsd(TOTALS.gross),
    parent: formatUsd(TOTALS.parent),
    panel: formatUsd(TOTALS.panel),
    broker: formatUsd(TOTALS.broker),
    retained: formatUsd(TOTALS.retained),
};

export interface LedgerPosting {
    readonly time: string;
    readonly line: string;
}

export const M07_LEDGER_POSTINGS: readonly LedgerPosting[] = [
    { time: M07_PAYMENT_TIME, line: `Escrow released, ${RANSOM_BATCH_HOSPITAL.ref}.` },
    { time: RANSOM_POSTING_TIMES.received, line: "Received." },
    { time: RANSOM_POSTING_TIMES.parent, line: `Posted to ${M06_SKN_FULL_NAME}, ${RANSOM_SPLIT_PERCENT.parent}%.` },
    { time: RANSOM_POSTING_TIMES.panel, line: `Posted to the panel, ${RANSOM_SPLIT_PERCENT.panel}%.` },
    { time: RANSOM_POSTING_TIMES.broker, line: `Posted to the broker, ${RANSOM_SPLIT_PERCENT.broker}%.` },
];

export const M07_LEDGER_AUDIT_NOTE =
    "Two audit queries on the settlement account. The Architect's share is advanced to the same day.";

export const M07_LEDGER_RELEASE_ORDERS: readonly string[] = [
    `${M07_RELEASE_ORDER_EU} → ${RANSOM_BATCH_EU.caseRef}`,
    `${M07_RELEASE_ORDER_NA} → ${RANSOM_BATCH_NA.caseRef}`,
    `${M07_RELEASE_ORDER_RUN} → ${RANSOM_BATCH_HOSPITAL.caseRef}`,
];

export interface LedgerProofItem {
    readonly title: string;
    readonly body: string;
}

export const M07_LEDGER_PROOF: readonly LedgerProofItem[] = [
    {
        title: "Settlement account",
        body: `${M06_SKN_NUMBER}, held through ${M06_SKN_FULL_NAME}. Every paid account settles here. Both open reserves are held here too.`,
    },
    {
        title: "Classification",
        body: `${M01_CASE_ID}: retained risk, employee negligence (${ROXANNE_SHORT_NAME}). Prepared with ${VIVIEN_ORCHID_SHORT_NAME}. Approved by ${M07_INSURER_NAME}. The label keeps the claim in force.`,
    },
    {
        title: `Loss-control survey ${M07_SURVEY_CODE}`,
        body: "Surveyor on site before each account: 2020-03, 2023-06, then 2026-07-09 (exterior), 2026-08-03 (visit, remote token for fourteen days), 2026-08-07 (media, badge, key).",
    },
    {
        title: "Release orders",
        body: M07_LEDGER_RELEASE_ORDERS.join("; "),
    },
    {
        title: "Ownership of record",
        body: M07_LEDGER_OWNERSHIP_CHAIN,
    },
];

export const M07_LEDGER_RECEIPT_CAPTION = `Access purchase, 2026-08-03 13:20 UTC. ${M01_BROKER_ALIAS} to ${M01_BUYER_ALIAS}, released through client escrow. This is the door into ${M01_HOSPITAL_NAME}.`;

export interface LedgerSupportLine {
    readonly time: string;
    readonly who: "brightwater" | "support";
    readonly line: string;
}

export const M07_LEDGER_SUPPORT: readonly LedgerSupportLine[] = [
    { time: "04:35", who: "brightwater", line: `Appointed negotiator for ${M01_HOSPITAL_NAME}. Confirm scope.` },
    { time: "04:36", who: "support", line: "Scheduling, records, clinical imaging. One negotiator per account." },
    {
        time: "04:52",
        who: "brightwater",
        line: "Clinical operations are affected. Request partial release of theatre scheduling pending settlement.",
    },
    { time: "04:53", who: "support", line: "No partial release. The balance is due in full." },
    {
        time: "06:10",
        who: "brightwater",
        line: `Demand acknowledged: ${formatUsd(RANSOM_BATCH_HOSPITAL.gross)}.`,
    },
    { time: "06:12", who: "support", line: `Acknowledged. The window closes at ${M07_SUPPORT_CLOSE_TIME}.` },
    { time: "07:30", who: "brightwater", line: "The insurer has approved settlement against the policy." },
    { time: "07:31", who: "support", line: "Settlement is through client escrow only." },
    {
        time: "08:40",
        who: "brightwater",
        line: "Authorisation received from the client's risk office. Escrow instruction follows.",
    },
    { time: "09:02", who: "support", line: `Escrow released. Account ${RANSOM_BATCH_HOSPITAL.ref} settled.` },
    { time: "09:04", who: "support", line: "Account closed. This channel is closed." },
];

export const M07_LEDGER_SUPPORT_GAP = "77 minutes without messages";
export const M07_LEDGER_SUPPORT_FACTS: readonly { readonly label: string; readonly value: string }[] = [
    { label: "Lock to release", value: `${M07_LOCK_TIME} to ${M07_PAYMENT_TIME} (6h 21m)` },
    { label: "Window", value: `${M07_SETTLEMENT_WINDOW}` },
    { label: "Appointed by", value: "the insurer" },
    { label: "Authorised by", value: "the client's risk office, 08:40 UTC" },
];

export interface LedgerPrototypeNote {
    readonly time: string;
    readonly who: "sentry" | "t404";
    readonly line: string;
}

export const M07_LEDGER_PROTOTYPE_CHAT: readonly LedgerPrototypeNote[] = [
    { time: "2019-11-04 21:12", who: "sentry", line: "I need a locker. Not a toy. Something that reads like an accounting notice." },
    { time: "2019-11-04 21:17", who: "sentry", line: "Books. Account, balance, settle. No victims, no threats. One project code per account." },
    { time: "2019-11-04 21:20", who: "sentry", line: `Nobody. It is signed BLACKLEDGER. Close every note with: ${M07_LEDGER_ROOM_TAGLINE}` },
    { time: "2019-11-04 21:31", who: "t404", line: `panel share is ${RANSOM_SPLIT_PERCENT.panel}% of every close, paid as consulting. toolkit stays mine.` },
    { time: "2019-11-18 22:36", who: "sentry", line: "Good. Escrow released." },
];
