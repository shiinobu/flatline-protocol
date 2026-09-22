import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { buildM01HomeSoldLots, ensureM01ListingResolution } from "../../../content/m01-listing-pool.js";
import { renderM01ListingPage } from "../../../content/m01-listing-templates.js";
import { M01_OBSIDIAN_DOMAIN } from "../../../content/m01.js";
import { localizeHtml } from "../../shared/localize.js";
import { requireHttps, securePage } from "../../shared/page-guards.js";

import adminPage from "./admin.html";
import eduPageApac6641 from "./edu-apac-6641.html";
import govPageEu7793 from "./gov-eu-7793.html";
import homePage from "./home.html";
import ispPageNa2207 from "./isp-na-2207.html";
import retailPageNa5528 from "./retail-na-5528.html";
import vendorPortalPage from "./vendor-portal.html";

const page = securePage;

const homeListing = (path: string, html: string, title: string, description: string): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        const denied = requireHttps(context);
        if (denied) return denied;

        const soldLots = buildM01HomeSoldLots("obsidian");
        const injectedHtml = html.replace(
            /const SOLD_LOTS = \/\*__M01_SOLD_LOTS__\*\/\[[\s\S]*?\];/,
            `const SOLD_LOTS = ${JSON.stringify(soldLots)};`,
        );

        return { title, description, html: localizeHtml(injectedHtml) };
    },
});

const soldListing = (path: string, slotId: string): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        const denied = requireHttps(context);
        if (denied) return denied;

        const resolution = ensureM01ListingResolution();
        const resolved = resolution.slots[slotId];
        const isWinner = resolution.winnerId === slotId;
        const slot = { id: slotId, site: "obsidian" as const, domain: M01_OBSIDIAN_DOMAIN, path, nodeLabel: "OA-00" };

        return {
            title: `Obsidian Access — ${resolved.category}-${resolved.region}-${resolved.code}`,
            description: "No longer listed.",
            html: renderM01ListingPage({ slot, resolved, isWinner }),
        };
    },
});

@RegisterWebsite
export class ObsidianAccessWebsite extends Website {
    SiteName = "Obsidian Access";
    Host = M01_OBSIDIAN_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        homeListing("/", homePage, "Obsidian Access", "Verified network access, mirror listings."),
        page("/listings/p7s3-61va/", ispPageNa2207, "Obsidian Access — ISP-NA-2207", "Regional ISP, NA region."),
        page("/listings/q0t6-94wb/", eduPageApac6641, "Obsidian Access — EDU-APAC-6641", "University network, APAC region."),
        page("/listings/r3u9-27xc/", retailPageNa5528, "Obsidian Access — RETAIL-NA-5528", "Retail chain, NA region."),
        page("/listings/s6v2-50yd/", govPageEu7793, "Obsidian Access — GOV-EU-7793", "Government network, EU region."),
        soldListing("/listings/b2e6-93mh/", "obsidian.retaileu4471"),
        soldListing("/listings/c5f9-26ni/", "obsidian.govapac1120"),
        soldListing("/listings/d8g3-59oj/", "obsidian.logna8802"),
        soldListing("/listings/e1h7-82pk/", "obsidian.finna3387"),
        soldListing("/listings/f4i2-16ql/", "obsidian.eduseea9915"),
        soldListing("/listings/g7j5-49rm/", "obsidian.ispapac4420"),
        page("/admin/", adminPage, "Obsidian Access — Admin", "Restricted."),
        page("/vendor-portal/", vendorPortalPage, "Obsidian Access — Vendor Portal", "Reseller access."),
    ];
}
