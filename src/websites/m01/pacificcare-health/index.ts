import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_HOSPITAL_DOMAIN } from "../../../content/m01.js";

import homePage from "./home.html";

@RegisterWebsite
export class PacificCareHealthWebsite extends Website {
    SiteName = "PacificCare Health";
    Host = M01_HOSPITAL_DOMAIN;
    Icon = "";

    Pages: WebsitePageDefinition[] = [
        { path: "/", title: "PacificCare Health", html: homePage, description: "Regional hospital network, SEA." },
    ];
}
