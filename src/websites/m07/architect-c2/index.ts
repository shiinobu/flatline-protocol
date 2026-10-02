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
import { fillMarkers, localizeHtml } from "../../global/localize.js";

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
    fillMarkers(localizeHtml(legacyCmsPage), {
        NODE_C2: nodeAddress("index-01"),
        NODE_FIREWALL: nodeAddress("ash-gate"),
        NODE_NULLCROWN: nodeAddress("node-07"),
        NODE_ASHVECTOR: nodeAddress("node-11"),
        RETIRED_NULLCROWN: retiredLabel("node-07"),
        RETIRED_ASHVECTOR: retiredLabel("node-11"),
    });

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
