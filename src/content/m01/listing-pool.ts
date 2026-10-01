import { M01_LISTING_KEY } from "../../i18n/m01/listing-template.js";
import { M01_DOMAIN, M01_FROSTGATE_DOMAIN, M01_OBSIDIAN_DOMAIN } from "./network.js";

export const M01_LISTING_CATEGORIES = ["RETAIL", "ISP", "LOGISTICS", "EDU", "GOV", "FIN", "MED", "TELECOM"] as const;
export const M01_LISTING_REGIONS = ["SEA", "EU", "NA", "APAC"] as const;
export const M01_LISTING_REAL_REGION = "SEA";
export const M01_LISTING_SEA_TOTAL = 6;

export const M01_DECOY_VENDOR_ALIASES = [
    "DUSKFENCE", "DARKINDEX", "GRAYWATCH", "RUSTVEIN_9", "VOIDCARTEL", "MIRRORVAULT",
    "NULLROUTE99", "PALEWIRE", "COALVEIN", "CINDERLOCK", "IRONVEIL", "KILOWATT_X",
    "GRIMLEDGER", "ASHFALL_TRD", "NIGHTMARKET7", "HOLLOWPIPE", "EMBERSTOCK",
] as const;

export const M01_CATEGORY_DESCRIPTION_KEYS: Record<string, string> = {
    RETAIL: M01_LISTING_KEY.CATEGORY_DESC_RETAIL,
    ISP: M01_LISTING_KEY.CATEGORY_DESC_ISP,
    LOGISTICS: M01_LISTING_KEY.CATEGORY_DESC_LOGISTICS,
    EDU: M01_LISTING_KEY.CATEGORY_DESC_EDU,
    GOV: M01_LISTING_KEY.CATEGORY_DESC_GOV,
    FIN: M01_LISTING_KEY.CATEGORY_DESC_FIN,
    MED: M01_LISTING_KEY.CATEGORY_DESC_MED,
    TELECOM: M01_LISTING_KEY.CATEGORY_DESC_TELECOM,
};

export interface M01ListingSlot {
    readonly id: string;
    readonly site: "blackwire" | "frostgate" | "obsidian";
    readonly domain: string;
    readonly path: string;
    readonly nodeLabel: string;
}

export const M01_LISTING_SLOTS: M01ListingSlot[] = [
    { id: "blackwire.lot94", site: "blackwire", domain: M01_DOMAIN, path: "/listings/n4k2-88c1/", nodeLabel: "BW-14" },
    { id: "blackwire.req33", site: "blackwire", domain: M01_DOMAIN, path: "/listings/p7v9-22de/", nodeLabel: "BW-22" },
    { id: "blackwire.pkg77", site: "blackwire", domain: M01_DOMAIN, path: "/listings/q1m5-77af/", nodeLabel: "BW-31" },
    { id: "blackwire.acc19", site: "blackwire", domain: M01_DOMAIN, path: "/listings/r8t3-41bd/", nodeLabel: "BW-09" },
    { id: "blackwire.lot05", site: "blackwire", domain: M01_DOMAIN, path: "/listings/s2w6-90ce/", nodeLabel: "BW-46" },
    { id: "blackwire.opn102", site: "blackwire", domain: M01_DOMAIN, path: "/listings/u5x1-63fa/", nodeLabel: "BW-07" },
    { id: "frostgate.ispeu3302", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/v8y4-15gb/", nodeLabel: "FG-11" },
    { id: "frostgate.eduna7710", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/w3z7-52hc/", nodeLabel: "FG-24" },
    { id: "frostgate.finapac2244", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/x6a2-38id/", nodeLabel: "FG-08" },
    { id: "frostgate.retailna6650", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/y9b5-71je/", nodeLabel: "FG-33" },
    { id: "frostgate.logisticseu1183", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/z4c8-04kf/", nodeLabel: "FG-19" },
    { id: "frostgate.govapac9042", site: "frostgate", domain: M01_FROSTGATE_DOMAIN, path: "/listings/a7d1-67lg/", nodeLabel: "FG-42" },
    { id: "obsidian.retaileu4471", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/b2e6-93mh/", nodeLabel: "OA-04" },
    { id: "obsidian.govapac1120", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/c5f9-26ni/", nodeLabel: "OA-17" },
    { id: "obsidian.logna8802", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/d8g3-59oj/", nodeLabel: "OA-23" },
    { id: "obsidian.finna3387", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/e1h7-82pk/", nodeLabel: "OA-11" },
    { id: "obsidian.eduseea9915", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/f4i2-16ql/", nodeLabel: "OA-38" },
    { id: "obsidian.ispapac4420", site: "obsidian", domain: M01_OBSIDIAN_DOMAIN, path: "/listings/g7j5-49rm/", nodeLabel: "OA-29" },
];

export interface M01ListingResolvedSlot {
    readonly category: string;
    readonly region: string;
    readonly code: string;
    readonly vendor: string;
}

export interface M01ListingResolution {
    readonly winnerId: string;
    readonly slots: Record<string, M01ListingResolvedSlot>;
}

export interface M01HomeSoldLot {
    readonly label: string;
    readonly cat: string;
}
