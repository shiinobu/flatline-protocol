import { Random, SaveStorage, SharedVariables } from "@hotbunny/hackhub-content-sdk";

import {
    M01_DECOY_VENDOR_ALIASES,
    M01_LISTING_CATEGORIES,
    M01_LISTING_REAL_REGION,
    M01_LISTING_REGIONS,
    M01_LISTING_SEA_TOTAL,
    M01_LISTING_SLOTS,
    type M01HomeSoldLot,
    type M01ListingResolution,
    type M01ListingResolvedSlot,
    type M01ListingSlot,
} from "../../content/m01/listing-pool.js";
import { M01_BROKER_ALIAS } from "../../content/m01/network.js";

const M01_LISTING_RESOLUTION_KEY = "m01.listingResolution";
const M01_LISTING_MIRROR_KEY = "flatline.m01.listingResolution";

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
    SharedVariables.set(M01_LISTING_MIRROR_KEY, resolution);
    return resolution;
};

export const resetM01ListingResolution = (): void => {
    SaveStorage.remove(M01_LISTING_RESOLUTION_KEY);
    SharedVariables.remove(M01_LISTING_MIRROR_KEY);
};

export const rollM01ListingResolution = (): M01ListingResolution => {
    resetM01ListingResolution();
    return ensureM01ListingResolution();
};

export const getM01ListingResolution = (): M01ListingResolution | undefined =>
    SharedVariables.get<M01ListingResolution>(M01_LISTING_MIRROR_KEY);

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

export const buildM01HomeSoldLots = (site: M01ListingSlot["site"]): M01HomeSoldLot[] | undefined => {
    const resolution = getM01ListingResolution();
    if (!resolution) return undefined;

    return M01_LISTING_SLOTS.filter((slot) => slot.site === site).map((slot) => {
        const resolved = resolution.slots[slot.id];
        return { label: `${resolved.category}-${resolved.region}-${resolved.code}`, cat: resolved.category };
    });
};
