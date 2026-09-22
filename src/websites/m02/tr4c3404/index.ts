import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { M02_ADMIN_PATH, M02_ROOT_DOMAIN } from "../../../content/m02.js";
import { securePage as page } from "../../shared/page-guards.js";

import adminPage from "./admin.html";
import homePage from "./home.html";

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
