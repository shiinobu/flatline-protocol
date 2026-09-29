import {
    Events,
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_LEDGERVAULT_DOMAIN, M01_PROJECT_OPENED_EVENT } from "../../../content/m01.js";
import { localizeHtml } from "../../shared/localize.js";

import homePage from "./home.html";

@RegisterWebsite
export class LedgerVaultWebsite extends Website {
    SiteName = "LedgerVault";
    Host = M01_LEDGERVAULT_DOMAIN;
    Icon = "";

    Exports = {
        flatlineOpenProject: (folder: string): void => {
            Events.emit(M01_PROJECT_OPENED_EVENT, { folder });
        },
    };

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
