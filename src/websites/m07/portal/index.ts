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
    '<rect width="64" height="64" rx="14" fill="#1a0b0e"/>' +
        '<path d="M19 46V18l26 28V18" fill="none" stroke="#c4122f" stroke-width="5" stroke-linejoin="round"/>',
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
