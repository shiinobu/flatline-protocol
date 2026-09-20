import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M02_ADMIN_PATH, M02_ROOT_DOMAIN } from "../../../content/m02.js";

import adminPage from "./admin.html";
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
export class A7xCodeFaceWebsite extends Website {
    SiteName = "A7xCodeFace";
    Host = M02_ROOT_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "A7xCodeFace — dev notes", "Toolkit developer's personal site."),
        page(M02_ADMIN_PATH, adminPage, "A7xCodeFace — admin", "Restricted admin login."),
    ];
}
