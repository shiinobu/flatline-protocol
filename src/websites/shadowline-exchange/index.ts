import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_DECOY_DOMAIN } from "../../content/m01.js";

import homePage from "./home.html";

@RegisterWebsite
export class ShadowlineExchangeWebsite extends Website {
    SiteName = "Shadowline Exchange";
    Host = M01_DECOY_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: "Shadowline Exchange",
            html: homePage,
            description: "Wholesale import/export brokerage.",
        },
    ];
}
