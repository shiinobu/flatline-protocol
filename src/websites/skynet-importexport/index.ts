import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M03_SKYNET_DOMAIN } from "../../content/m03.js";

import homePage from "./home.html";
import httpErrorPage from "./http-error.html";

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
export class SkynetImportExportWebsite extends Website {
    SiteName = "Skynet Import-Export Co.";
    Host = M03_SKYNET_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "Skynet Import-Export Co.", "Logistics and trade consulting."),
    ];
}
