import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { M04_C2_IP, M04_LEGACY_CMS_PATH } from "../../../content/m04.js";
import { securePage as page } from "../../shared/page-guards.js";

import homePage from "./home.html";
import legacyCmsPage from "./legacy-cms.html";

@RegisterWebsite
export class ArchitectC2Website extends Website {
    SiteName = "C2 Dashboard";
    Host = M04_C2_IP;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "C2 Dashboard", "Restricted."),
        page(M04_LEGACY_CMS_PATH, legacyCmsPage, "LegacyCMS 2.1 — Admin", "Unpatched legacy CMS instance."),
    ];
}
