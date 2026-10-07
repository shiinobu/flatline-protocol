import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { BLACKLEDGER_DOMAIN } from "../../../../content/global/blackledger.js";

import homePage from "./home.original.html";

@RegisterWebsite
export class BlackledgerWebsite extends Website {
    SiteName = "BLACKLEDGER";
    Host = BLACKLEDGER_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "BLACKLEDGER", html: homePage, description: "every account, settled." },
    ];
}
