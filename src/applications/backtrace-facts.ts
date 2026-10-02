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
} from "../content/m03/network.js";
import type { BacktraceFacts, BacktraceMissionId } from "./backtrace-state.js";

const MISSING_FACT = "—";

export const BACKTRACE_KEYS = {
    m1: ["broker", "buyer", "vault", "caseId"],
    m2: ["developer", "ransom", "deployLog", "homeLead", "firewall", "workstation", "shellCompany"],
    m3: ["portal", "parentEntity", "gateway", "vpnPeer", "accomplice"],
    m4: [],
    m5: [],
    m6: [],
    m7: [],
} as const satisfies Readonly<Record<BacktraceMissionId, readonly string[]>>;

export type BacktraceKey<M extends BacktraceMissionId> = (typeof BACKTRACE_KEYS)[M][number];

export const isBacktraceKey = (mission: BacktraceMissionId, key: string): boolean =>
    (BACKTRACE_KEYS[mission] as readonly string[]).includes(key);

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

const FACT_BUILDERS: Readonly<Partial<Record<BacktraceMissionId, () => BacktraceFacts>>> = {
    m1: buildM1Facts,
    m2: buildM2Facts,
    m3: buildM3Facts,
};

export const buildBacktraceFacts = (mission: BacktraceMissionId): BacktraceFacts =>
    FACT_BUILDERS[mission]?.() ?? {};
