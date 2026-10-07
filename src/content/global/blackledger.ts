export const BLACKLEDGER_DOMAIN = "fc3dhvrvxdw4qdnzcruwf233nyk6rtea.blackledger";
export const BLACKLEDGER_NAME = "BLACKLEDGER";

export interface BlackledgerLegacyClaim {
    readonly name: string;
    readonly year: string;
    readonly region: string;
    readonly project: string;
}

export const BLACKLEDGER_LEGACY_CLAIM_NA: BlackledgerLegacyClaim = {
    name: "Northstar Port Authority",
    year: "2020",
    region: "NA",
    project: "Q1-2020-NA",
};

export const BLACKLEDGER_LEGACY_CLAIM_EU: BlackledgerLegacyClaim = {
    name: "Rheinland Energie AG",
    year: "2023",
    region: "EU",
    project: "Q2-2023-EU",
};

export const BLACKLEDGER_LEGACY_CLAIMS: readonly BlackledgerLegacyClaim[] = [
    BLACKLEDGER_LEGACY_CLAIM_NA,
    BLACKLEDGER_LEGACY_CLAIM_EU,
];
