import {
    RANSOM_BATCHES,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_SPLIT_PERCENT,
    formatUsd,
    formatUsdShare,
    splitRansom,
    totalRansom,
} from "../content/global/finance.js";
import { M01_CASE_ID } from "../content/global/case.js";
import {
    BLACKLEDGER_DOMAIN,
    BLACKLEDGER_LEGACY_CLAIM_EU,
    BLACKLEDGER_LEGACY_CLAIM_NA,
    BLACKLEDGER_NAME,
} from "../content/global/blackledger.js";
import { ensureM01ListingResolution } from "../context/m01/listing.js";
import { M01_BROKER_ALIAS, M01_LEDGERVAULT_DOMAIN } from "../content/m01/network.js";
import { M01_LEDGERVAULT_PROJECT } from "../content/m01/report.js";
import { M01_BUYER_ALIAS } from "../content/m01/server-files.js";
import { M02_SHELL_COMPANY_NAME, M03_PARENT_ENTITY_NAME } from "../content/global/entities.js";
import { M02_DEV_SUBDOMAIN, M02_FIREWALL_IP, M02_WORKSTATION_IP, M02_WORKSTATION_ROUTER_IP } from "../content/m02/network.js";
import {
    M02_CASE_BATCH_REF,
    M02_CASE_MATCH_RANSOM_AMOUNT,
    M02_CASE_MATCH_SETTLED_AT,
    M02_CASE_PANEL_SHARE,
    M02_VICTIM_CASE_ID_EU,
    M02_VICTIM_CASE_ID_NA,
} from "../content/m02/report.js";
import { M02_DEPLOY_PAYLOAD_NAME } from "../content/m02/server-files.js";
import { M04_ARCHITECT_VPN_IP } from "../content/global/characters.js";
import {
    M03_ACCOMPLICE_USERNAME,
    M03_REMOTE_PORTAL_DOMAIN,
    M03_VAULTLINE_CODENAME,
    M03_VPN_PEER_LABEL,
    M03_INTERNAL_NETWORK_FACT,
} from "../content/m03/network.js";
import { GRETA_FULL_NAME, VIVIEN_ORCHID_FULL_NAME, VIVIEN_ORCHID_SHORT_NAME } from "../content/global/characters.js";
import { M01_HOSPITAL_NAME, M07_INSURER_NAME } from "../content/global/entities.js";
import { M05_BEDSIDE_ASSET_TAG, M05_COLD_CHART_CODENAME } from "../content/m05/network.js";
import { M05_ACK_DATE, M05_NEGOTIATOR, M05_USB_DATE } from "../content/m05/server-files.js";
import { M05_GAP_TEXT, M05_PAID_AT } from "../content/m05/quest.js";
import {
    M06_AGENT_NAME,
    M06_HALVARD_DISSOLVED,
    M06_HOLDINGS_INCORPORATED,
    M06_INSURER_PORTAL_HOST,
    M06_NOMINEES_INCORPORATED,
    M06_REGISTRY_JURISDICTION,
    M06_SKN_VPN_HOST,
} from "../content/m06/network.js";
import {
    M06_ARCHITECT_CHAIR_PERIOD,
    M06_HALVARD_NAME,
    M06_HOLDINGS_NAME,
    M06_ORCHID_PERIOD,
    M06_SKN_FULL_NAME,
    M06_VOSS_APPOINTMENTS,
    M06_VOSS_NAME,
} from "../content/m06/records.js";
import { M06_MINUTES_MEETING_DATE, M06_MINUTES_SIGNED_DATE } from "../content/m06/minutes.js";
import {
    M04_HUNTER_TAG,
    M04_INTRUDER_IP,
    M04_NIGHT_SHIFT_CODENAME,
    M04_NIGHT_SHIFT_IP,
    M04_QUIET_MIRROR_CODENAME,
    M04_STATIC_HOP_CODENAME,
} from "../content/m04/network.js";
import {
    M07_ASHVECTOR_CODENAME,
    M07_BROKER_INFRA_DOMAIN,
    M07_BROKER_INFRA_IP,
    M07_C2_IP,
    M07_FIREWALL_IP,
    M07_FIREWALL_LABEL,
    M07_FIREWALL_USERNAME,
    M07_NULLCROWN_CODENAME,
    M07_RDP_PORT,
    M07_C2_SERVICE_USERNAME,
} from "../content/m07/network.js";
import { M07_LEDGER_ACCOUNTS, M07_LEDGER_PROTOTYPE_CHAT, M07_PROTOTYPE_DATE } from "../content/m07/blackledger.js";
import { M07_PAID_CLAIM_REFS, M07_RESERVE_REFS, M07_SETTLEMENT_ACCOUNT_HOLDER, M07_SETTLEMENT_ACCOUNT_NUMBER } from "../content/m07/claims.js";
import {
    M07_DOSSIER_SUMMARY,
    M07_INSTRUCTION_DATE,
    M07_MODEL_NOTE_QUOTE,
    M07_RELEASE_ORDER_RUN,
} from "../content/m07/rdc.js";
import { M07_ARCHITECT_REAL_NAME } from "../content/m07/report.js";
import {
    M07_EVIDENCE_CLASSIFICATION,
    M07_LEDGER_FILE_NAME,
    M07_ORDER_GO_TIME,
    M07_SENTRY_ACCOUNT,
    M07_SURVEY_CODE,
    M07_SURVEY_VISIT_DATE,
} from "../content/m07/server-files.js";
import { optionalBacktraceLogs } from "./backtrace-logs.js";
import type { BacktraceFacts, BacktraceMissionId, BacktraceSkipped } from "./backtrace-state.js";

const MISSING_FACT = "—";
const M04_WHOIS_REGISTRANT = "Bulletproof VPN Ltd.";

export const BACKTRACE_KEYS = {
    m1: ["broker", "buyer", "vault", "caseId"],
    m2: ["developer", "ransom", "deployLog", "homeLead", "firewall", "workstation", "shellCompany"],
    m3: ["portal", "pivot", "parentEntity", "gateway", "vpnPeer", "accomplice"],
    m4: ["probe", "breach", "relay1", "relay2", "control", "origin"],
    m5: ["dismissed", "greta", "archive", "statement", "decisionMemo", "usbTicket"],
    m6: ["nominees", "registeredAgent", "ownershipChange", "insurer", "infra", "architect"],
    m7: [
        "claims",
        "nodes",
        "credential",
        "firewall",
        "c2",
        "manifest",
        "orders",
        "survey",
        "ledger",
        "seal",
        "instruction",
        "decoy",
        "model",
        "dossier",
        "ledgerRoom",
    ],
} as const satisfies Readonly<Record<BacktraceMissionId, readonly string[]>>;

export type BacktraceKey<M extends BacktraceMissionId> = (typeof BACKTRACE_KEYS)[M][number];

export const isBacktraceKey = (mission: BacktraceMissionId, key: string): boolean =>
    (BACKTRACE_KEYS[mission] as readonly string[]).includes(key);

export const BACKTRACE_OPTIONAL_KEYS: Readonly<Record<BacktraceMissionId, readonly string[]>> = {
    m1: [],
    m2: [],
    m3: ["accomplice"],
    m4: ["probe"],
    m5: [],
    m6: [],
    m7: ["decoy", "model", "dossier"],
};

export const buildBacktraceSkipped = (
    mission: BacktraceMissionId,
    traced: BacktraceFacts,
    logged: readonly string[],
): BacktraceSkipped => ({
    keys: BACKTRACE_OPTIONAL_KEYS[mission].filter((key) => traced[key] === undefined),
    logs: optionalBacktraceLogs(mission).filter((text) => !logged.includes(text)),
});

const resolveWinningListingCode = (): string => {
    const resolution = ensureM01ListingResolution();
    const winner = resolution.slots[resolution.winnerId];
    return winner ? `${winner.category}-${winner.region}-${winner.code}` : MISSING_FACT;
};

const buildM1Facts = (): BacktraceFacts => ({
    broker: M01_BROKER_ALIAS,
    buyer: M01_BUYER_ALIAS,
    vault: M01_LEDGERVAULT_DOMAIN,
    caseId: M01_CASE_ID,
    listing: resolveWinningListingCode(),
    project: M01_LEDGERVAULT_PROJECT,
});

const buildM2Facts = (): BacktraceFacts => ({
    developer: M02_DEV_SUBDOMAIN,
    ransom: formatUsd(M02_CASE_MATCH_RANSOM_AMOUNT),
    deployLog: M02_DEPLOY_PAYLOAD_NAME,
    homeLead: M02_WORKSTATION_ROUTER_IP,
    firewall: M02_FIREWALL_IP,
    workstation: M02_WORKSTATION_IP,
    shellCompany: M02_SHELL_COMPANY_NAME,
    caseId: M01_CASE_ID,
    settled: M02_CASE_MATCH_SETTLED_AT,
    victims: `${M02_VICTIM_CASE_ID_NA}, ${M02_VICTIM_CASE_ID_EU}`,
    buyer: M01_BUYER_ALIAS,
    batchRef: M02_CASE_BATCH_REF,
    panelShare: formatUsdShare(M02_CASE_PANEL_SHARE, RANSOM_SPLIT_PERCENT.panel),
});

const buildM3Facts = (): BacktraceFacts => {
    const split = splitRansom(RANSOM_BATCH_HOSPITAL.gross);
    const totals = totalRansom(RANSOM_BATCHES);

    return {
        portal: M03_REMOTE_PORTAL_DOMAIN,
        pivot: M03_INTERNAL_NETWORK_FACT,
        parentEntity: M03_PARENT_ENTITY_NAME,
        architectVpn: M04_ARCHITECT_VPN_IP,
        gateway: M03_VAULTLINE_CODENAME,
        vpnPeer: M03_VPN_PEER_LABEL,
        accomplice: M03_ACCOMPLICE_USERNAME,
        shellCompany: M02_SHELL_COMPANY_NAME,
        caseId: M01_CASE_ID,
        settled: RANSOM_BATCH_HOSPITAL.settledAt,
        batchRef: RANSOM_BATCH_HOSPITAL.ref,
        gross: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
        toParent: formatUsdShare(split.parent, RANSOM_SPLIT_PERCENT.parent),
        toPanel: formatUsdShare(split.panel, RANSOM_SPLIT_PERCENT.panel),
        toBroker: formatUsdShare(split.broker, RANSOM_SPLIT_PERCENT.broker),
        retained: formatUsdShare(split.retained, RANSOM_SPLIT_PERCENT.retained),
        batchCount: String(RANSOM_BATCHES.length),
        allBatches: formatUsd(totals.gross),
        allToParent: formatUsd(totals.parent),
        peerGateway: M04_ARCHITECT_VPN_IP,
        peerOwner: M03_PARENT_ENTITY_NAME,
    };
};

const buildM4Facts = (): BacktraceFacts => ({
    probe: M04_INTRUDER_IP,
    breach: `desktop session traced to ${M04_STATIC_HOP_CODENAME}`,
    relay1: M04_STATIC_HOP_CODENAME,
    relay2: M04_QUIET_MIRROR_CODENAME,
    control: `${M04_NIGHT_SHIFT_CODENAME} (${M04_NIGHT_SHIFT_IP})`,
    origin: M04_WHOIS_REGISTRANT,
    hunter: M04_HUNTER_TAG,
    caseId: M01_CASE_ID,
    architectVpn: M04_ARCHITECT_VPN_IP,
});

const buildM5Facts = (): BacktraceFacts => ({
    dismissed: `${GRETA_FULL_NAME} removed from the staff list`,
    greta: `${GRETA_FULL_NAME}, Systems Administrator`,
    gretaName: GRETA_FULL_NAME,
    archive: `${M05_COLD_CHART_CODENAME} opened with her own credential`,
    statement: `acknowledgement signed ${M05_ACK_DATE}`,
    decisionMemo: `paid ${M05_PAID_AT} UTC, classified employee negligence`,
    usbTicket: `${M05_BEDSIDE_ASSET_TAG}, media connected ${M05_USB_DATE}`,
    decider: VIVIEN_ORCHID_FULL_NAME,
    insurer: M07_INSURER_NAME,
    hospital: M01_HOSPITAL_NAME,
    negotiator: M05_NEGOTIATOR,
    gap: M05_GAP_TEXT,
    caseId: M01_CASE_ID,
});

const buildM6Facts = (): BacktraceFacts => ({
    nominees: `${M06_SKN_FULL_NAME}, ${M06_REGISTRY_JURISDICTION}, incorporated ${M06_NOMINEES_INCORPORATED}`,
    registeredAgent: M06_AGENT_NAME,
    ownershipChange: `${M06_HALVARD_NAME} (dissolved ${M06_HALVARD_DISSOLVED}) to ${M06_HOLDINGS_NAME}`,
    insurer: `${M07_INSURER_NAME}. ${VIVIEN_ORCHID_FULL_NAME}, Head of Cyber Risk ${M06_ORCHID_PERIOD}`,
    infra: `${M06_SKN_VPN_HOST} shares a certificate with ${M06_INSURER_PORTAL_HOST}`,
    architect: `${M07_ARCHITECT_REAL_NAME}, Chairman Risk Committee, ${M07_INSURER_NAME} (${M06_ARCHITECT_CHAIR_PERIOD})`,
    architectName: M07_ARCHITECT_REAL_NAME,
    minutesInterest: `${M06_HOLDINGS_NAME} directorship declared, judged immaterial, chair kept`,
    minutesSettlements: `two outside policy terms (${BLACKLEDGER_LEGACY_CLAIM_NA.region} ${BLACKLEDGER_LEGACY_CLAIM_NA.year}, ${BLACKLEDGER_LEGACY_CLAIM_EU.region} ${BLACKLEDGER_LEGACY_CLAIM_EU.year}) released to the settlement account held through ${M06_SKN_FULL_NAME}`,
    minutesMeeting: `Risk Committee ${M06_MINUTES_MEETING_DATE}, signed ${M06_MINUTES_SIGNED_DATE}`,
    front: `${M06_VOSS_NAME}, ${M06_VOSS_APPOINTMENTS} appointments on record`,
    registrant: M04_WHOIS_REGISTRANT,
    peerGateway: M04_ARCHITECT_VPN_IP,
    holdings: M06_HOLDINGS_NAME,
    incorporated: M06_HOLDINGS_INCORPORATED,
    caseId: M01_CASE_ID,
});

const describeLedgerAccounts = (): string => {
    const reserved = M07_LEDGER_ACCOUNTS.filter((entry) => entry.status === "RESERVED").length;
    return `${M07_LEDGER_ACCOUNTS.length} accounts: ${M07_LEDGER_ACCOUNTS.length - reserved} settled, ${reserved} reserved`;
};

const buildM7Facts = (): BacktraceFacts => {
    const totals = totalRansom(RANSOM_BATCHES);

    return {
        claims: `${M07_PAID_CLAIM_REFS.join(", ")}, paid through ${M07_SETTLEMENT_ACCOUNT_HOLDER}`,
        nodes: `${M07_NULLCROWN_CODENAME} + ${M07_ASHVECTOR_CODENAME} listed decommissioned`,
        credential: `${M07_FIREWALL_USERNAME} @ ${M07_FIREWALL_LABEL}`,
        firewall: `${M07_FIREWALL_IP} opened, ${M07_RDP_PORT} reachable`,
        c2: `${M07_C2_IP} (${M07_C2_SERVICE_USERNAME})`,
        manifest: `${RANSOM_BATCHES.length + 2} settled accounts`,
        orders: `release ${M07_RELEASE_ORDER_RUN} authorised ${M07_ORDER_GO_TIME} UTC by ${M07_SENTRY_ACCOUNT}, session from ${M07_BROKER_INFRA_IP}`,
        survey: `${M07_SURVEY_CODE}, visit ${M07_SURVEY_VISIT_DATE}`,
        ledger: `${M07_LEDGER_FILE_NAME} extracted intact`,
        seal: `${M07_SETTLEMENT_ACCOUNT_NUMBER}, held through ${M07_SETTLEMENT_ACCOUNT_HOLDER}`,
        instruction: `order to ${VIVIEN_ORCHID_SHORT_NAME}, dated ${M07_INSTRUCTION_DATE}`,
        decoy: `${M07_NULLCROWN_CODENAME} touched`,
        model: M07_MODEL_NOTE_QUOTE,
        dossier: M07_DOSSIER_SUMMARY,
        architect: M07_ARCHITECT_REAL_NAME,
        parentEntity: M03_PARENT_ENTITY_NAME,
        reserves: M07_RESERVE_REFS.join(", "),
        releaseOrder: M07_RELEASE_ORDER_RUN,
        sentry: M07_SENTRY_ACCOUNT,
        brokerInfra: `${M07_BROKER_INFRA_DOMAIN} (${M07_BROKER_INFRA_IP})`,
        hunter: M04_HUNTER_TAG,
        caseId: M01_CASE_ID,
        evidence: M07_EVIDENCE_CLASSIFICATION,
        allBatches: formatUsd(totals.gross),
        allToParent: formatUsd(totals.parent),
        architectVpn: M04_ARCHITECT_VPN_IP,
        account: M07_SETTLEMENT_ACCOUNT_NUMBER,
        indexHost: M07_C2_IP,
        visitor: `Surveyor ${M07_SURVEY_CODE}`,
        syndicate: BLACKLEDGER_NAME,
        ledgerRoom: `${BLACKLEDGER_DOMAIN} opened, Chair session read only`,
        prototype: `${M01_BUYER_ALIAS} desktop, ${M07_PROTOTYPE_DATE}`,
        orderChat: `SENTRY to ${M01_BUYER_ALIAS}, ${M07_LEDGER_PROTOTYPE_CHAT[0]?.time.slice(0, 10) ?? MISSING_FACT}`,
        split: `${RANSOM_SPLIT_PERCENT.panel}% consulting fees, ${RANSOM_SPLIT_PERCENT.broker}% brokerage`,
        accounts: describeLedgerAccounts(),
        affiliates: `${M01_BUYER_ALIAS} ${RANSOM_SPLIT_PERCENT.panel}%, ${M01_BROKER_ALIAS} ${RANSOM_SPLIT_PERCENT.broker}%`,
    };
};

const FACT_BUILDERS: Readonly<Partial<Record<BacktraceMissionId, () => BacktraceFacts>>> = {
    m1: buildM1Facts,
    m2: buildM2Facts,
    m3: buildM3Facts,
    m4: buildM4Facts,
    m5: buildM5Facts,
    m6: buildM6Facts,
    m7: buildM7Facts,
};

export const buildBacktraceFacts = (mission: BacktraceMissionId): BacktraceFacts =>
    FACT_BUILDERS[mission]?.() ?? {};
