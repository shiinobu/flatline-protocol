import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { buildM01HomeSoldLots, ensureM01ListingResolution } from "../../../content/m01-listing-pool.js";
import { renderM01ListingPage } from "../../../content/m01-listing-templates.js";
import { M01_FROSTGATE_DOMAIN } from "../../../content/m01.js";
import { localizeHtml } from "../../shared/localize.js";
import { requireHttps, securePage } from "../../shared/page-guards.js";

import adminPage from "./admin.html";
import homePage from "./home.html";
import isPageNa7734 from "./isp-na-7734.html";
import logisticsPageApac2261 from "./logistics-apac-2261.html";
import retailPageApac3390 from "./retail-apac-3390.html";
import telecomPageEu5518 from "./telecom-eu-5518.html";
import vendorPortalPage from "./vendor-portal.html";

const page = securePage;

const homeListing = (path: string, html: string, title: string, description: string): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        const denied = requireHttps(context);
        if (denied) return denied;

        const soldLots = buildM01HomeSoldLots("frostgate");
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
        const slot = { id: slotId, site: "frostgate" as const, domain: M01_FROSTGATE_DOMAIN, path, nodeLabel: "FG-00" };

        return {
            title: `Frostgate Exchange — ${resolved.category}-${resolved.region}-${resolved.code}`,
            description: "No longer listed.",
            html: renderM01ListingPage({ slot, resolved, isWinner }),
        };
    },
});

@RegisterWebsite
export class FrostgateExchangeWebsite extends Website {
    SiteName = "Frostgate Exchange";
    Host = M01_FROSTGATE_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        homeListing("/", homePage, "Frostgate Exchange", "Verified network access, sold as-is."),
        page("/listings/l5o1-49rw/", telecomPageEu5518, "Frostgate Exchange — TELECOM-EU-5518", "Telecom carrier, EU region."),
        page("/listings/m8p4-72sx/", retailPageApac3390, "Frostgate Exchange — RETAIL-APAC-3390", "Retail chain, APAC region."),
        page("/listings/n1q7-05ty/", isPageNa7734, "Frostgate Exchange — ISP-NA-7734", "Regional ISP, NA region."),
        page("/listings/o4r0-38uz/", logisticsPageApac2261, "Frostgate Exchange — LOGISTICS-APAC-2261", "Logistics company, APAC region."),
        soldListing("/listings/v8y4-15gb/", "frostgate.ispeu3302"),
        soldListing("/listings/w3z7-52hc/", "frostgate.eduna7710"),
        soldListing("/listings/x6a2-38id/", "frostgate.finapac2244"),
        soldListing("/listings/y9b5-71je/", "frostgate.retailna6650"),
        soldListing("/listings/z4c8-04kf/", "frostgate.logisticseu1183"),
        soldListing("/listings/a7d1-67lg/", "frostgate.govapac9042"),
        page("/admin/", adminPage, "Frostgate Exchange — Admin", "Restricted."),
        page("/vendor-portal/", vendorPortalPage, "Frostgate Exchange — Vendor Portal", "Reseller access."),
    ];
}
