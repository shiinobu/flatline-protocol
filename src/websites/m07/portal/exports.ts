import { Events } from "@hotbunny/hackhub-content-sdk";

import {
    M07_CLAIM_LOOKUP_EVENT,
    M07_CLAIM_WITHHELD,
    M07_SETTLEMENT_ACCOUNT_HOLDER,
    M07_SETTLEMENT_ACCOUNT_NUMBER,
    findM07Claim,
    isHeldM07Reserve,
    type M07Claim,
    type M07ClaimLookupPayload,
} from "../../../content/m07/claims.js";
import { areMissionSitesOpen } from "../../../context/global/site-access.js";
import { siteT } from "../../../context/global/site-strings.js";
import { isM07PortalOpen, isM07ReservesOpen } from "../../../context/m07/progress.js";
import { M07_SITE_KEY } from "../../../i18n/m07/site.js";

const MAX_REF_LENGTH = 32;

export type ClaimTone = "paid" | "reserve" | "none";

export interface ClaimRow {
    readonly label: string;
    readonly value: string;
}

export interface ClaimLookupResult {
    readonly found: boolean;
    readonly ref: string;
    readonly tone: ClaimTone;
    readonly badge: string;
    readonly rows: readonly ClaimRow[];
    readonly message: string;
}

const row = (labelKey: string, value: string): ClaimRow => ({ label: siteT(labelKey), value });

const noResult = (ref: string, message: string): ClaimLookupResult => ({
    found: false,
    ref,
    tone: "none",
    badge: "",
    rows: [],
    message,
});

const insuredOf = (claim: M07Claim): string =>
    claim.insured === M07_CLAIM_WITHHELD ? siteT(M07_SITE_KEY.PORTAL_INSURED_WITHHELD) : claim.insured;

const paidRows = (claim: M07Claim): readonly ClaimRow[] => [
    row(M07_SITE_KEY.PORTAL_ROW_INSURED, insuredOf(claim)),
    row(M07_SITE_KEY.PORTAL_ROW_STATUS, siteT(M07_SITE_KEY.PORTAL_STATUS_PAID)),
    row(M07_SITE_KEY.PORTAL_ROW_DATE_PAID, claim.date),
    row(
        M07_SITE_KEY.PORTAL_ROW_ACCOUNT,
        siteT(M07_SITE_KEY.PORTAL_ACCOUNT_PAID, { holder: M07_SETTLEMENT_ACCOUNT_HOLDER }),
    ),
    ...(claim.approvedAt === undefined
        ? []
        : [
              row(
                  M07_SITE_KEY.PORTAL_ROW_CLASS,
                  siteT(M07_SITE_KEY.PORTAL_CLASS_RETAINED, { date: claim.approvedAt }),
              ),
          ]),
];

const reserveRows = (claim: M07Claim): readonly ClaimRow[] => [
    row(M07_SITE_KEY.PORTAL_ROW_INSURED, insuredOf(claim)),
    row(M07_SITE_KEY.PORTAL_ROW_STATUS, siteT(M07_SITE_KEY.PORTAL_STATUS_RESERVED)),
    row(M07_SITE_KEY.PORTAL_ROW_DATE_RESERVE, claim.date),
    row(
        M07_SITE_KEY.PORTAL_ROW_ACCOUNT,
        siteT(M07_SITE_KEY.PORTAL_ACCOUNT_RESERVE, {
            number: M07_SETTLEMENT_ACCOUNT_NUMBER,
            holder: M07_SETTLEMENT_ACCOUNT_HOLDER,
        }),
    ),
    row(M07_SITE_KEY.PORTAL_ROW_NOTICE, siteT(M07_SITE_KEY.PORTAL_NOTICE_RESERVE)),
];

const resultOf = (claim: M07Claim): ClaimLookupResult =>
    claim.kind === "paid"
        ? {
              found: true,
              ref: claim.ref,
              tone: "paid",
              badge: siteT(M07_SITE_KEY.PORTAL_BADGE_PAID),
              rows: paidRows(claim),
              message: "",
          }
        : {
              found: true,
              ref: claim.ref,
              tone: "reserve",
              badge: siteT(M07_SITE_KEY.PORTAL_BADGE_RESERVED),
              rows: reserveRows(claim),
              message: "",
          };

export const claimLookup = (raw: unknown): ClaimLookupResult => {
    const ref = String(raw).trim().slice(0, MAX_REF_LENGTH);
    if (!areMissionSitesOpen("m07") || !isM07PortalOpen()) return noResult(ref, siteT(M07_SITE_KEY.PORTAL_NOT_FOUND));

    const reservesOpen = isM07ReservesOpen();
    if (isHeldM07Reserve(ref, reservesOpen)) return noResult(ref, siteT(M07_SITE_KEY.PORTAL_HELD));

    const claim = findM07Claim(ref, reservesOpen);
    if (claim === null) return noResult(ref, siteT(M07_SITE_KEY.PORTAL_NOT_FOUND));

    const payload: M07ClaimLookupPayload = { ref: claim.ref, kind: claim.kind };
    Events.emit(M07_CLAIM_LOOKUP_EVENT, payload);

    return resultOf(claim);
};
