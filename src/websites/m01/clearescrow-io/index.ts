import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_ESCROW_DOMAIN } from "../../../content/m01.js";

import homePage from "./home.html";

@RegisterWebsite
export class ClearEscrowWebsite extends Website {
    SiteName = "ClearEscrow";
    Host = M01_ESCROW_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "ClearEscrow — Public Transaction Board", html: homePage, description: "Independent third-party escrow and payment settlement." },
    ];
}
