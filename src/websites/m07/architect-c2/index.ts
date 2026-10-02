import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { M07_C2_IP, M07_LEGACY_CMS_PATH } from "../../../content/m07/network.js";
import { gateMissionPages, securePage as page } from "../../global/page-guards.js";

import homePage from "./home.html";
import legacyCmsPage from "./legacy-cms.html";

@RegisterWebsite
export class ArchitectC2Website extends Website {
    SiteName = "C2 Dashboard";
    Host = M07_C2_IP;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m07", [
        page("/", homePage, "C2 Dashboard", "Restricted."),
        page(M07_LEGACY_CMS_PATH, legacyCmsPage, "LegacyCMS 2.1 — Admin", "Unpatched legacy CMS instance."),
    ]);
}
