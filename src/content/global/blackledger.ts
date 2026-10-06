export const BLACKLEDGER_DOMAIN = "blkledger.dark";

export interface BlackledgerLegacyClaim {
    readonly name: string;
    readonly year: string;
    readonly region: string;
}

export const BLACKLEDGER_LEGACY_CLAIM_NA: BlackledgerLegacyClaim = {
    name: "Northstar Port Authority",
    year: "2020",
    region: "NA",
};

export const BLACKLEDGER_LEGACY_CLAIM_EU: BlackledgerLegacyClaim = {
    name: "Rheinland Energie AG",
    year: "2023",
    region: "EU",
};

export const BLACKLEDGER_LEGACY_CLAIMS: readonly BlackledgerLegacyClaim[] = [
    BLACKLEDGER_LEGACY_CLAIM_NA,
    BLACKLEDGER_LEGACY_CLAIM_EU,
];
