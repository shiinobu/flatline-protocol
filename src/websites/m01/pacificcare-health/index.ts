import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M01_HOSPITAL_DOMAIN } from "../../../content/m01/network.js";
import { gateMissionPages } from "../../global/page-guards.js";

import homePage from "./home.html";

@RegisterWebsite
export class PacificCareHealthWebsite extends Website {
    SiteName = "PacificCare Health";
    Host = M01_HOSPITAL_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m01", [
        {
            path: "/",
            metadata: (): PageMetadata => ({
                title: "PacificCare Health",
                description: "Regional hospital network, SEA.",
                html: homePage,
            }),
        },
    ]);
}
