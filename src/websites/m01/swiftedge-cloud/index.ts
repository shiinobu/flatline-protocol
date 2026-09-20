import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_HOSTING_DOMAIN } from "../../../content/m01.js";

import homePage from "./home.html";

@RegisterWebsite
export class SwiftEdgeCloudWebsite extends Website {
    SiteName = "SwiftEdge Cloud";
    Host = M01_HOSTING_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "SwiftEdge Cloud", html: homePage, description: "CDN and edge hosting provider." },
    ];
}
