import { M01_CASE_ID } from "../global/case.js";
import { M01_HOSPITAL_NAME } from "../global/entities.js";
import { RANSOM_BATCH_EU, RANSOM_BATCH_HOSPITAL, RANSOM_BATCH_NA } from "../global/finance.js";
import { M06_SKN_FULL_NAME, M06_SKN_NUMBER } from "../m06/records.js";

export type M07ClaimKind = "paid" | "reserve";

export const M07_CLAIM_LOOKUP_EVENT = "flatline.m07.claimLookup";

export interface M07ClaimLookupPayload {
    readonly ref: string;
    readonly kind: M07ClaimKind;
}

export interface M07Claim {
    readonly ref: string;
    readonly kind: M07ClaimKind;
    readonly insured: string;
    readonly date: string;
    readonly approvedAt?: string;
}

export const M07_CLAIM_WITHHELD = "withheld";
export const M07_PORTAL_LEDGER_UPDATED = "2026-10-03";
export const M07_HOSPITAL_APPROVED_AT = "2026-08-17";
export const M07_SETTLEMENT_ACCOUNT_NUMBER = M06_SKN_NUMBER;
export const M07_SETTLEMENT_ACCOUNT_HOLDER = M06_SKN_FULL_NAME;

export const M07_RESERVE_EU_REF = "FIN-EU-2214";
export const M07_RESERVE_EU_DATE = "2026-06-18";
export const M07_RESERVE_MED_REF = "MED-APAC-6689";
export const M07_RESERVE_MED_DATE = "2026-07-14";

export const M07_PAID_CLAIM_REFS: readonly string[] = [
    M01_CASE_ID,
    RANSOM_BATCH_NA.caseRef,
    RANSOM_BATCH_EU.caseRef,
];

export const M07_RESERVE_REFS: readonly string[] = [M07_RESERVE_EU_REF, M07_RESERVE_MED_REF];

export const M07_CLAIMS: readonly M07Claim[] = [
    {
        ref: M01_CASE_ID,
        kind: "paid",
        insured: M01_HOSPITAL_NAME,
        date: RANSOM_BATCH_HOSPITAL.settledAt,
        approvedAt: M07_HOSPITAL_APPROVED_AT,
    },
    { ref: RANSOM_BATCH_NA.caseRef, kind: "paid", insured: M07_CLAIM_WITHHELD, date: RANSOM_BATCH_NA.settledAt },
    { ref: RANSOM_BATCH_EU.caseRef, kind: "paid", insured: M07_CLAIM_WITHHELD, date: RANSOM_BATCH_EU.settledAt },
    { ref: M07_RESERVE_EU_REF, kind: "reserve", insured: M07_CLAIM_WITHHELD, date: M07_RESERVE_EU_DATE },
    { ref: M07_RESERVE_MED_REF, kind: "reserve", insured: M07_CLAIM_WITHHELD, date: M07_RESERVE_MED_DATE },
];

export const normalizeClaimRef = (raw: string): string => raw.trim().toUpperCase();

export const isHeldM07Reserve = (raw: string, reservesOpen: boolean): boolean => {
    if (reservesOpen) return false;

    const ref = normalizeClaimRef(raw);
    return M07_CLAIMS.some((entry) => entry.kind === "reserve" && entry.ref === ref);
};

export const findM07Claim = (raw: string, reservesOpen: boolean): M07Claim | null => {
    const ref = normalizeClaimRef(raw);
    const claim = M07_CLAIMS.find((entry) => entry.ref === ref);
    if (claim === undefined) return null;

    return claim.kind === "reserve" && !reservesOpen ? null : claim;
};
