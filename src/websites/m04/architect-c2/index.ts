import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M04_C2_IP, M04_LEGACY_CMS_PATH } from "../../../content/m04.js";

import homePage from "./home.html";
import httpErrorPage from "./http-error.html";
import legacyCmsPage from "./legacy-cms.html";

const page = (
    path: string,
    html: string,
    title: string,
    description: string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!context.url.startsWith("https:")) {
            return {
                title: "400 Bad Request",
                description: "Insecure request rejected.",
                html: httpErrorPage,
            };
        }

        return { title, description, html };
    },
});

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
