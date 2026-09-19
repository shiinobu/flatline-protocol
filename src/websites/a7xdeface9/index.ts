import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_DOMAIN, M01_HIDDEN_PATH } from "../../content/m01.js";

import { ACCESS_LOG_HTML } from "./access-log.js";
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
export class A7xDeface9Website extends Website {
    SiteName = "VerifiedAccess";
    Host = M01_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "VerifiedAccess — Storefront", "Verified network access, sold as-is."),
        page("/lot-88/", lotPage88, "VerifiedAccess — LOT 88", "Retail chain, EU region."),
        page("/lot-91/", lotPage91, "VerifiedAccess — LOT 91", "Regional ISP, APAC."),
        page("/opn-14/", opnPage14, "VerifiedAccess — OPN 14", "Logistics company, NA region."),
        page("/acc-52/", accPage52, "VerifiedAccess — ACC 52", "University network, EU."),
        page("/lot-94/", lotPage94, "VerifiedAccess — LOT 94", "No longer listed."),
        page("/req-33/", reqPage33, "VerifiedAccess — REQ 33", "No longer listed."),
        page("/pkg-77/", pkgPage77, "VerifiedAccess — PKG 77", "No longer listed."),
        page("/acc-19/", accPage19, "VerifiedAccess — ACC 19", "No longer listed."),
        page("/lot-05/", lotPage05, "VerifiedAccess — LOT 05", "No longer listed."),
        page(
            M01_HIDDEN_PATH,
            opnPage102,
            "VerifiedAccess — OPN 102",
            "No longer listed.",
        ),
        page("/admin/", adminPage, "VerifiedAccess — Admin", "Restricted."),
        page("/vendor-portal/", vendorPortalPage, "VerifiedAccess — Vendor Portal", "Reseller access."),
        page("/access-log/", ACCESS_LOG_HTML, "VerifiedAccess — access.log", "Unrotated server log."),
    ];
}
