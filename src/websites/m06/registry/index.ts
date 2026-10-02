import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import {
    M06_FILINGS_ARCHIVE_PATH,
    M06_NOMINEES_PATH,
    M06_REGISTRY_DOMAIN,
} from "../../../content/m06/network.js";
import { gateMissionPages, securePage as page } from "../../global/page-guards.js";

import entityNomineesPage from "./entity-nominees.html";
import filingsArchivePage from "./filings-archive.html";
import homePage from "./home.html";

@RegisterWebsite
export class PortCalderRegistryWebsite extends Website {
    SiteName = "Port Calder Companies Registry";
    Host = M06_REGISTRY_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m06", [
        page("/", homePage, "Port Calder Companies Registry", "Statutory register of companies and officers."),
        page(M06_NOMINEES_PATH, entityNomineesPage, "Registered entity", "Particulars as filed."),
        page(M06_FILINGS_ARCHIVE_PATH, filingsArchivePage, "Filing archive", "Superseded filings."),
    ]);
}
