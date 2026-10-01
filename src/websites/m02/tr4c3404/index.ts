import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { M02_ADMIN_PATH, M02_ROOT_DOMAIN } from "../../../content/m02/network.js";
import { securePage as page } from "../../global/page-guards.js";

import adminPage from "./admin.html";
import homePage from "./home.html";

@RegisterWebsite
export class Tr4c3404Website extends Website {
    SiteName = "TR4C3404";
    Host = M02_ROOT_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        page("/", homePage, "TR4C3404 — dev notes", "Toolkit developer's personal site."),
        page(M02_ADMIN_PATH, adminPage, "TR4C3404 — admin", "Restricted admin login."),
    ];
}
