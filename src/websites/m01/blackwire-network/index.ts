import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { buildM01HomeSoldLots, ensureM01ListingResolution } from "../../../content/m01-listing-pool.js";
import { renderM01ListingPage } from "../../../content/m01-listing-templates.js";
import { M01_DOMAIN } from "../../../content/m01.js";
import { localizeHtml } from "../../shared/localize.js";
import { requireHttps, securePage } from "../../shared/page-guards.js";

import accPage52 from "./acc-52.html";
import adminPage from "./admin.html";
import homePage from "./home.html";
import lotPage88 from "./lot-88.html";
import lotPage91 from "./lot-91.html";
import opnPage14 from "./opn-14.html";
import vendorPortalPage from "./vendor-portal.html";

const page = securePage;

const homeListing = (
    path: string,
    html: string,
    title: string,
    description: string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        const denied = requireHttps(context);
        if (denied) return denied;

        const soldLots = buildM01HomeSoldLots("blackwire");
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
        const slot = { id: slotId, site: "blackwire" as const, domain: M01_DOMAIN, path, nodeLabel: "BW-00" };

        return {
            title: `Blackwire Network — ${resolved.category}-${resolved.region}-${resolved.code}`,
            description: "No longer listed.",
            html: renderM01ListingPage({ slot, resolved, isWinner }),
        };
    },
});

@RegisterWebsite
export class BlackwireNetworkWebsite extends Website {
    SiteName = "Blackwire Network";
    Host = M01_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        homeListing("/", homePage, "Blackwire Network — Storefront", "Verified network access, sold as-is."),
        page("/listings/h3k8-27ns/", lotPage88, "Blackwire Network — RETAIL-EU-2231", "Retail chain, EU region."),
        page("/listings/i6l2-50ot/", lotPage91, "Blackwire Network — ISP-APAC-6604", "Regional ISP, APAC."),
        page("/listings/j9m5-83pu/", opnPage14, "Blackwire Network — LOGISTICS-NA-1187", "Logistics company, NA region."),
        page("/listings/k2n8-16qv/", accPage52, "Blackwire Network — EDU-EU-3390", "University network, EU."),
        soldListing("/listings/n4k2-88c1/", "blackwire.lot94"),
        soldListing("/listings/p7v9-22de/", "blackwire.req33"),
        soldListing("/listings/q1m5-77af/", "blackwire.pkg77"),
        soldListing("/listings/r8t3-41bd/", "blackwire.acc19"),
        soldListing("/listings/s2w6-90ce/", "blackwire.lot05"),
        soldListing("/listings/u5x1-63fa/", "blackwire.opn102"),
        page("/admin/", adminPage, "Blackwire Network — Admin", "Restricted."),
        page("/vendor-portal/", vendorPortalPage, "Blackwire Network — Vendor Portal", "Reseller access."),
    ];
}
