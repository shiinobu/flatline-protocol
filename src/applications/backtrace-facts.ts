import { ensureM01ListingResolution } from "../content/m01-listing-pool.js";
import {
    M01_BROKER_ALIAS,
    M01_BUYER_ALIAS,
    M01_CASE_ID,
    M01_LEDGERVAULT_DOMAIN,
    M01_LEDGERVAULT_PROJECT,
} from "../content/m01.js";
import {
    M02_CASE_MATCH_RANSOM_AMOUNT,
    M02_CASE_MATCH_SETTLED_AT,
    M02_DEV_SUBDOMAIN,
    M02_SHELL_COMPANY_NAME,
    M02_VICTIM_CASE_ID_EU,
    M02_VICTIM_CASE_ID_NA,
} from "../content/m02.js";
import type { BacktraceFacts, BacktraceMissionId } from "./backtrace-state.js";

const MISSING_FACT = "—";

const resolveWinningListingCode = (): string => {
    const resolution = ensureM01ListingResolution();
    const winner = resolution.slots[resolution.winnerId];
    return winner ? `${winner.category}-${winner.region}-${winner.code}` : MISSING_FACT;
};

const buildM1Facts = (): BacktraceFacts => ({
    broker: M01_BROKER_ALIAS,
    buyer: M01_BUYER_ALIAS,
    caseId: M01_CASE_ID,
    listing: resolveWinningListingCode(),
    project: M01_LEDGERVAULT_PROJECT,
    vault: M01_LEDGERVAULT_DOMAIN,
});

const buildM2Facts = (): BacktraceFacts => ({
    buyer: M01_BUYER_ALIAS,
    developer: M02_DEV_SUBDOMAIN,
    shellCompany: M02_SHELL_COMPANY_NAME,
    caseId: M01_CASE_ID,
    ransom: `$${M02_CASE_MATCH_RANSOM_AMOUNT.toLocaleString("en-US")}`,
    settled: M02_CASE_MATCH_SETTLED_AT,
    victims: `${M02_VICTIM_CASE_ID_NA}, ${M02_VICTIM_CASE_ID_EU}`,
});

const FACT_BUILDERS: Readonly<Partial<Record<BacktraceMissionId, () => BacktraceFacts>>> = {
    m1: buildM1Facts,
    m2: buildM2Facts,
};

export const buildBacktraceFacts = (mission: BacktraceMissionId): BacktraceFacts =>
    FACT_BUILDERS[mission]?.() ?? {};
