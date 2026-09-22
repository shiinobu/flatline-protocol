import { RegisterWebsite, Website, type DynamicWebsitePageDefinition, type PageMetadata } from "@hotbunny/hackhub-content-sdk";

import { M01_LEDGERVAULT_DOMAIN } from "../../../content/m01.js";
import { localizeHtml } from "../../shared/localize.js";

import homePage from "./home.html";

@RegisterWebsite
export class LedgerVaultWebsite extends Website {
    SiteName = "LedgerVault";
    Host = M01_LEDGERVAULT_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (): PageMetadata => ({
                title: "LedgerVault",
                description: "Private project storage.",
                html: localizeHtml(homePage),
            }),
        },
    ];
}
