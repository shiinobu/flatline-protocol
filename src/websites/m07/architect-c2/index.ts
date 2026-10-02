import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M07_NODE_ROWS } from "../../../content/m07/legacy-cms.js";
import { M07_C2_IP, M07_LEGACY_CMS_PATH } from "../../../content/m07/network.js";
import { siteT } from "../../../context/global/site-strings.js";
import { isM07DashboardOpen } from "../../../context/m07/progress.js";
import { M07_SITE_KEY } from "../../../i18n/m07/site.js";
import { gateMissionPages, notFoundMetadata, requireHttps, securePage as page } from "../../global/page-guards.js";
import { localizeHtml } from "../../global/localize.js";

import homePage from "./home.html";
import legacyCmsPage from "./legacy-cms.html";

const nodeAddress = (label: string): string =>
    M07_NODE_ROWS.find((row) => row.label === label)?.address ?? "";

const retiredLabel = (label: string): string => {
    const row = M07_NODE_ROWS.find((entry) => entry.label === label);
    if (row === undefined || row.state !== "retired") return siteT(M07_SITE_KEY.CMS_STATE_ACTIVE);

    return siteT(M07_SITE_KEY.CMS_STATE_RETIRED).replace("{{year}}", row.retiredYear);
};

const renderLegacyCms = (): string =>
    localizeHtml(legacyCmsPage)
        .replace("/*__NODE_C2__*/", nodeAddress("index-01"))
        .replace("/*__NODE_FIREWALL__*/", nodeAddress("ash-gate"))
        .replace("/*__NODE_NULLCROWN__*/", nodeAddress("node-07"))
        .replace("/*__NODE_ASHVECTOR__*/", nodeAddress("node-11"))
        .replace("/*__RETIRED_NULLCROWN__*/", retiredLabel("node-07"))
        .replace("/*__RETIRED_ASHVECTOR__*/", retiredLabel("node-11"));

const legacyCms = (): DynamicWebsitePageDefinition => ({
    path: M07_LEGACY_CMS_PATH,
    metadata: (context: PageContext): PageMetadata => {
        if (!isM07DashboardOpen()) return notFoundMetadata();

        return (
            requireHttps(context) ?? {
                title: "LegacyCMS 2.1 — Admin",
                description: "Unpatched legacy CMS instance.",
                html: renderLegacyCms(),
            }
        );
    },
});

@RegisterWebsite
export class ArchitectC2Website extends Website {
    SiteName = "C2 Dashboard";
    Host = M07_C2_IP;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m07", [
        page("/", homePage, "C2 Dashboard", "Restricted."),
        legacyCms(),
    ]);
}
