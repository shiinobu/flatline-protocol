import {
    Events,
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_LEDGERVAULT_DOMAIN } from "../../../content/m01/network.js";
import { M01_PROJECT_OPENED_EVENT } from "../../../content/m01/quest.js";
import { isM01VaultSealed } from "../../../context/m01/progress.js";
import { localizeHtml } from "../../global/localize.js";
import { notFoundMetadata } from "../../global/page-guards.js";

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
            metadata: (): PageMetadata =>
                isM01VaultSealed()
                    ? notFoundMetadata()
                    : {
                          title: "LedgerVault",
                          description: "Private project storage.",
                          html: localizeHtml(homePage),
                      },
        },
    ];
}
