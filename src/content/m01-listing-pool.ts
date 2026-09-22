import { Random, SaveStorage, Variables } from "@hotbunny/hackhub-content-sdk";

import { M01_LISTING_KEY } from "./m01-listing-template-i18n.js";
import { M01_BROKER_ALIAS, M01_FROSTGATE_DOMAIN, M01_DOMAIN, M01_OBSIDIAN_DOMAIN } from "./m01.js";

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

const M01_LISTING_RESOLUTION_KEY = "m01.listingResolution";

const generateUniqueCode = (used: Set<string>): string => {
    let code: string;
    do {
        code = String(Random.number(1000, 9999));
    } while (used.has(code));
    used.add(code);
    return code;
};

const generateM01ListingResolution = (): M01ListingResolution => {
    const allIds = M01_LISTING_SLOTS.map((slot) => slot.id);
    const winnerId = Random.pick(allIds);
    const otherIds = allIds.filter((id) => id !== winnerId);
    const extraSeaIds = new Set(Random.pickMultiple(otherIds, M01_LISTING_SEA_TOTAL - 1));
    const nonSeaRegions = M01_LISTING_REGIONS.filter((region) => region !== M01_LISTING_REAL_REGION);
    const shuffledDecoyVendors = Random.pickMultiple([...M01_DECOY_VENDOR_ALIASES], M01_DECOY_VENDOR_ALIASES.length);
    const usedCodes = new Set<string>();

    let decoyVendorIndex = 0;
    const slots: Record<string, M01ListingResolvedSlot> = {};
    for (const slot of M01_LISTING_SLOTS) {
        const isWinner = slot.id === winnerId;
        const region = isWinner || extraSeaIds.has(slot.id) ? M01_LISTING_REAL_REGION : Random.pick(nonSeaRegions);
        const vendor = isWinner ? M01_BROKER_ALIAS : shuffledDecoyVendors[decoyVendorIndex++];

        slots[slot.id] = {
            category: Random.pick([...M01_LISTING_CATEGORIES]),
            region,
            code: generateUniqueCode(usedCodes),
            vendor,
        };
    }

    return { winnerId, slots };
};

export const ensureM01ListingResolution = (): M01ListingResolution => {
    let resolution = SaveStorage.get<M01ListingResolution>(M01_LISTING_RESOLUTION_KEY);
    if (!resolution) {
        resolution = generateM01ListingResolution();
        SaveStorage.set(M01_LISTING_RESOLUTION_KEY, resolution);
    }
    Variables.set(M01_LISTING_RESOLUTION_KEY, resolution);
    return resolution;
};

export const resetM01ListingResolution = (): void => {
    SaveStorage.remove(M01_LISTING_RESOLUTION_KEY);
    Variables.remove(M01_LISTING_RESOLUTION_KEY);
};

export const getM01ListingResolution = (): M01ListingResolution | undefined =>
    Variables.get<M01ListingResolution>(M01_LISTING_RESOLUTION_KEY);

export const getM01ListingSlot = (id: string): M01ListingSlot | undefined =>
    M01_LISTING_SLOTS.find((slot) => slot.id === id);

export const getM01WinningSlot = (): M01ListingSlot | undefined => {
    const resolution = getM01ListingResolution();
    if (!resolution) return undefined;
    return getM01ListingSlot(resolution.winnerId);
};

export const getM01ResolvedCode = (id: string): string => {
    const resolved = getM01ListingResolution()?.slots[id];
    return resolved ? `${resolved.category}-${resolved.region}-${resolved.code}` : "PENDING-0000";
};

export const getM01WinningCode = (): string => {
    const resolution = getM01ListingResolution();
    if (!resolution) return "PENDING-0000";
    return getM01ResolvedCode(resolution.winnerId);
};

export interface M01HomeSoldLot {
    readonly label: string;
    readonly cat: string;
}

export const buildM01HomeSoldLots = (site: M01ListingSlot["site"]): M01HomeSoldLot[] => {
    const resolution = ensureM01ListingResolution();
    return M01_LISTING_SLOTS.filter((slot) => slot.site === site).map((slot) => {
        const resolved = resolution.slots[slot.id];
        return { label: `${resolved.category}-${resolved.region}-${resolved.code}`, cat: resolved.category };
    });
};
