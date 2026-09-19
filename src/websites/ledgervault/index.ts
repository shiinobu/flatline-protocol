import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_LEDGERVAULT_DOMAIN } from "../../content/m01.js";

import homePage from "./home.html";
import q1Page from "./q1-2026.html";
import q2Page from "./q2-2026.html";
import { Q3_2026_SEA_HTML } from "./q3-2026-sea.js";

@RegisterWebsite
export class LedgerVaultWebsite extends Website {
    SiteName = "LedgerVault";
    Host = M01_LEDGERVAULT_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "LedgerVault", html: homePage, description: "Private project storage." },
        { path: "/q1-2026/", title: "LedgerVault — Q1-2026", html: q1Page },
        { path: "/q2-2026/", title: "LedgerVault — Q2-2026", html: q2Page },
        { path: "/q3-2026-sea/", title: "LedgerVault — Q3-2026-SEA", html: Q3_2026_SEA_HTML },
    ];
}
