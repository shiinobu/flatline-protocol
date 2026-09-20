import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_LEDGERVAULT_DOMAIN } from "../../../content/m01.js";

import homePage from "./home.html";

@RegisterWebsite
export class LedgerVaultWebsite extends Website {
    SiteName = "LedgerVault";
    Host = M01_LEDGERVAULT_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "LedgerVault", html: homePage, description: "Private project storage." },
    ];
}
