import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import {
    RANSOM_BATCHES,
    RANSOM_POSTING_TIMES,
    splitRansom,
    totalRansom,
    type RansomBatch,
} from "../global/finance.js";

export const M03_LEDGER_TABLE = "wire_transfers";
export const M03_ACCESS_TABLE = "helpdesk_resets";

export const M03_LEDGER_ESCROW_PARTY = "ClearEscrow Settlement";
export const M03_LEDGER_PANEL_PARTY = "TR4C3404 Consulting";
export const M03_LEDGER_BROKER_PARTY = "X7xSentry9 Brokerage";

export const M03_ALL_TOTALS = totalRansom(RANSOM_BATCHES);

export interface M03LedgerRow {
    readonly id: number;
    readonly postedAt: string;
    readonly direction: "IN" | "OUT";
    readonly party: string;
    readonly amount: number;
    readonly balance: number;
    readonly memo: string;
}

interface M03LedgerLeg {
    readonly postedAt: string;
    readonly direction: "IN" | "OUT";
    readonly party: string;
    readonly amount: number;
    readonly memo: string;
}

const buildBatchLegs = (batch: RansomBatch): readonly M03LedgerLeg[] => {
    const split = splitRansom(batch.gross);
    const tag = `${batch.ref} ${batch.caseRef}`;
    const at = (time: string): string => `${batch.settledAt} ${time} UTC`;

    return [
        {
            postedAt: at(RANSOM_POSTING_TIMES.received),
            direction: "IN",
            party: M03_LEDGER_ESCROW_PARTY,
            amount: batch.gross,
            memo: `${tag} escrow release`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.parent),
            direction: "OUT",
            party: M03_PARENT_ENTITY_NAME,
            amount: split.parent,
            memo: `${tag} management fee`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.panel),
            direction: "OUT",
            party: M03_LEDGER_PANEL_PARTY,
            amount: split.panel,
            memo: `${tag} consulting fees (logistics)`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.broker),
            direction: "OUT",
            party: M03_LEDGER_BROKER_PARTY,
            amount: split.broker,
            memo: `${tag} customs brokerage`,
        },
    ];
};

export const buildM03LedgerRows = (): readonly M03LedgerRow[] =>
    RANSOM_BATCHES.flatMap(buildBatchLegs).reduce<readonly M03LedgerRow[]>((rows, leg) => {
        const previousBalance = rows[rows.length - 1]?.balance ?? 0;
        const signedAmount = leg.direction === "IN" ? leg.amount : -leg.amount;

        return [
            ...rows,
            {
                id: rows.length + 1,
                postedAt: leg.postedAt,
                direction: leg.direction,
                party: leg.party,
                amount: leg.amount,
                balance: previousBalance + signedAmount,
                memo: leg.memo,
            },
        ];
    }, []);
