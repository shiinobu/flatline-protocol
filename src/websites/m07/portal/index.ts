import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M07_PORTAL_LEDGER_UPDATED } from "../../../content/m07/claims.js";
import { M07_PORTAL_HOST } from "../../../content/m07/network.js";
import { isM07PortalOpen } from "../../../context/m07/progress.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";
import { localizeHtml } from "../../global/localize.js";
import { toolIcon } from "../../global/tool-page.js";
import { claimLookup, type ClaimLookupResult } from "./exports.js";

import homePage from "./home.html";

const PORTAL_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#0c1a26"/>' +
        '<path d="M32 10v34M20 24h24M14 38c2 10 10 16 18 16s16-6 18-16" fill="none" stroke="#d9a441" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="32" cy="14" r="4" fill="#d9a441"/>',
);

const homePageDefinition = (): DynamicWebsitePageDefinition => ({
    path: "/",
    metadata: (context: PageContext): PageMetadata => {
        const insecure = requireHttps(context);
        if (insecure) return insecure;
        if (!isM07PortalOpen()) return notFoundMetadata();

        return {
            title: "Nordhaven Mutual Assurance — Claims status",
            description: "Check the status of an insurance claim.",
            html: localizeHtml(homePage).replace("{{date}}", M07_PORTAL_LEDGER_UPDATED),
        };
    },
});

@RegisterWebsite
export class NordhavenPortalWebsite extends Website {
    SiteName = "Nordhaven Claims Desk";
    Host = M07_PORTAL_HOST;
    Icon = PORTAL_ICON;

    Exports = {
        flatlineClaimLookup: (ref: string): ClaimLookupResult => claimLookup(ref),
    };

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m07", [homePageDefinition()]);
}
