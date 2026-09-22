import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_ESCROW_DOMAIN } from "../../../content/m01.js";
import { M01_LISTING_SLOTS, ensureM01ListingResolution } from "../../../content/m01-listing-pool.js";
import { localizeHtml } from "../../shared/localize.js";
import { requireHttps } from "../../shared/page-guards.js";

import homePage from "./home.html";

const SITE_PREFIX: Record<string, string> = {
    blackwire: "BW",
    frostgate: "FG",
    obsidian: "OA",
};

const ROW_TIMESTAMPS: ReadonlyArray<readonly [string, string]> = [
    ["23:58", "ESC-88201"], ["23:41", "ESC-88202"], ["23:27", "ESC-88203"],
    ["23:12", "ESC-88204"], ["22:58", "ESC-88205"], ["22:44", "ESC-88206"],
    ["22:31", "ESC-88207"], ["22:15", "ESC-88208"], ["21:58", "ESC-88209"],
    ["21:40", "ESC-88210"], ["21:23", "ESC-88211"], ["21:07", "ESC-88212"],
    ["20:52", "ESC-88213"], ["20:36", "ESC-88214"], ["20:19", "ESC-88215"],
    ["20:03", "ESC-88216"], ["19:47", "ESC-88217"], ["19:30", "ESC-88218"],
];

const buildTransactionRows = (): unknown[][] => {
    const resolution = ensureM01ListingResolution();

    return M01_LISTING_SLOTS.map((slot, index) => {
        const resolved = resolution.slots[slot.id];
        const [time, escrowRef] = ROW_TIMESTAMPS[index % ROW_TIMESTAMPS.length];
        const listingCode = `${SITE_PREFIX[slot.site]}-${resolved.code}`;
        const vendor = resolution.winnerId === slot.id ? "—" : resolved.vendor;

        return [time, escrowRef, listingCode, "—", vendor, "UNDISCLOSED", "released"];
    });
};

@RegisterWebsite
export class ClearEscrowWebsite extends Website {
    SiteName = "ClearEscrow";
    Host = M01_ESCROW_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata => {
                const denied = requireHttps(context);
                if (denied) return denied;

                const rows = buildTransactionRows();
                const html = homePage.replace(
                    /const transactions = \/\*__M01_TRANSACTIONS__\*\/\[[\s\S]*?\];/,
                    `const transactions = ${JSON.stringify(rows)};`,
                );

                return {
                    title: "ClearEscrow — Public Transaction Board",
                    description: "Independent third-party escrow and payment settlement.",
                    html: localizeHtml(html),
                };
            },
        },
    ];
}
