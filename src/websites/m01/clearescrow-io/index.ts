import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_ESCROW_DOMAIN } from "../../../content/m01.js";

import appPage from "./app.html";
import homePage from "./home.html";

@RegisterWebsite
export class ClearEscrowWebsite extends Website {
    SiteName = "ClearEscrow";
    Host = M01_ESCROW_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "ClearEscrow", html: homePage, description: "Escrow and payment settlement." },
        { path: "/app/", title: "ClearEscrow — Partner Dashboard", html: appPage },
    ];
}
