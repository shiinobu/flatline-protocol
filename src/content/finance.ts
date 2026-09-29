import { M01_CASE_ID } from "./m01.js";

export interface RansomBatch {
    readonly ref: string;
    readonly caseRef: string;
    readonly settledAt: string;
    readonly gross: number;
}

export interface RansomSplit {
    readonly parent: number;
    readonly panel: number;
    readonly broker: number;
    readonly retained: number;
}

export interface RansomTotals extends RansomSplit {
    readonly gross: number;
}

export const RANSOM_SPLIT_PERCENT = {
    parent: 60,
    panel: 25,
    broker: 5,
    retained: 10,
} as const;

export const RANSOM_POSTING_TIMES = {
    received: "09:04",
    parent: "09:20",
    panel: "09:24",
    broker: "09:27",
} as const;

export const RANSOM_BATCH_EU: RansomBatch = {
    ref: "PB-2605-01",
    caseRef: "LOG-EU-2209",
    settledAt: "2026-05-02",
    gross: 1400000,
};

export const RANSOM_BATCH_NA: RansomBatch = {
    ref: "PB-2607-01",
    caseRef: "FIN-NA-0091",
    settledAt: "2026-07-22",
    gross: 4100000,
};

export const RANSOM_BATCH_HOSPITAL: RansomBatch = {
    ref: "PB-2608-01",
    caseRef: M01_CASE_ID,
    settledAt: "2026-08-14",
    gross: 2850000,
};

export const RANSOM_BATCHES: readonly RansomBatch[] = [RANSOM_BATCH_EU, RANSOM_BATCH_NA, RANSOM_BATCH_HOSPITAL];

export const RANSOM_BATCHES_Q3: readonly RansomBatch[] = [RANSOM_BATCH_NA, RANSOM_BATCH_HOSPITAL];

const percentOf = (gross: number, percent: number): number => Math.round((gross * percent) / 100);

export const splitRansom = (gross: number): RansomSplit => {
    const parent = percentOf(gross, RANSOM_SPLIT_PERCENT.parent);
    const panel = percentOf(gross, RANSOM_SPLIT_PERCENT.panel);
    const broker = percentOf(gross, RANSOM_SPLIT_PERCENT.broker);
    return { parent, panel, broker, retained: gross - parent - panel - broker };
};

export const totalRansom = (batches: readonly RansomBatch[]): RansomTotals =>
    batches.reduce<RansomTotals>(
        (total, batch) => {
            const split = splitRansom(batch.gross);
            return {
                gross: total.gross + batch.gross,
                parent: total.parent + split.parent,
                panel: total.panel + split.panel,
                broker: total.broker + split.broker,
                retained: total.retained + split.retained,
            };
        },
        { gross: 0, parent: 0, panel: 0, broker: 0, retained: 0 },
    );

export const formatUsd = (amount: number): string => `$${amount.toLocaleString("en-US")}`;

export const formatUsdShare = (amount: number, percent: number): string => `${formatUsd(amount)} (${percent}%)`;
