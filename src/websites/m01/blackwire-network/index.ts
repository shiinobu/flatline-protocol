import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_DOMAIN, M01_HIDDEN_PATH } from "../../../content/m01.js";

import accPage19 from "./acc-19.html";
import accPage52 from "./acc-52.html";
import adminPage from "./admin.html";
import homePage from "./home.html";
import httpErrorPage from "./http-error.html";
import lotPage05 from "./lot-05.html";
import lotPage88 from "./lot-88.html";
import lotPage91 from "./lot-91.html";
import lotPage94 from "./lot-94.html";
import opnPage14 from "./opn-14.html";
import opnPage102 from "./opn-102.html";
import pkgPage77 from "./pkg-77.html";
import reqPage33 from "./req-33.html";
import vendorPortalPage from "./vendor-portal.html";

const page = (
    path: string,
    html: string,
    title: string,
    description: string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!context.url.startsWith("https:")) {
            return {
                title: "400 Bad Request",
                description: "Insecure request rejected.",
                html: httpErrorPage,
            };
        }

        return { title, description, html };
    },
});

@RegisterWebsite
export class BlackwireNetworkWebsite extends Website {
    SiteName = "Blackwire Network";
    Host = M01_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "Blackwire Network — Storefront", "Verified network access, sold as-is."),
        page("/listings/retail-eu-2231/", lotPage88, "Blackwire Network — RETAIL-EU-2231", "Retail chain, EU region."),
        page("/listings/isp-apac-6604/", lotPage91, "Blackwire Network — ISP-APAC-6604", "Regional ISP, APAC."),
        page("/listings/logistics-na-1187/", opnPage14, "Blackwire Network — LOGISTICS-NA-1187", "Logistics company, NA region."),
        page("/listings/edu-eu-3390/", accPage52, "Blackwire Network — EDU-EU-3390", "University network, EU."),
        page("/listings/retail-na-0552/", lotPage94, "Blackwire Network — RETAIL-NA-0552", "No longer listed."),
        page("/listings/fin-eu-7743/", reqPage33, "Blackwire Network — FIN-EU-7743", "No longer listed."),
        page("/listings/logistics-apac-2266/", pkgPage77, "Blackwire Network — LOGISTICS-APAC-2266", "No longer listed."),
        page("/listings/gov-na-9981/", accPage19, "Blackwire Network — GOV-NA-9981", "No longer listed."),
        page("/listings/isp-eu-4415/", lotPage05, "Blackwire Network — ISP-EU-4415", "No longer listed."),
        page(
            M01_HIDDEN_PATH,
            opnPage102,
            "Blackwire Network — MED-SEA-0417",
            "No longer listed.",
        ),
        page("/admin/", adminPage, "Blackwire Network — Admin", "Restricted."),
        page("/vendor-portal/", vendorPortalPage, "Blackwire Network — Vendor Portal", "Reseller access."),
    ];
}
