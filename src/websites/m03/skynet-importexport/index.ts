import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { M03_SKYNET_DOMAIN } from "../../../content/m03.js";
import { securePage as page } from "../../shared/page-guards.js";

import homePage from "./home.html";

@RegisterWebsite
export class SkynetImportExportWebsite extends Website {
    SiteName = "Skynet Import-Export Co.";
    Host = M03_SKYNET_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "Skynet Import-Export Co.", "Logistics and trade consulting."),
    ];
}
