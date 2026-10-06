import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M06_CERT_RECORDS } from "../../../content/m06/hosttrail.js";
import { M06_HOSTTRAIL_DOMAIN } from "../../../content/m06/network.js";
import { M06_STAGE, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { fillDataMarker, localizeHtml } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";

import homePage from "./home.html";

const renderHome = (): string =>
    fillDataMarker(
        fillDataMarker(localizeHtml(homePage), "HT_DATA", JSON.stringify(M06_CERT_RECORDS)),
        "HT_TEXT",
        JSON.stringify({
            alone: siteT(M06_SITE_KEY.HT_SEEN_ALONE),
            shared: siteT(M06_SITE_KEY.HT_SEEN_SHARED),
        }),
    );

@RegisterWebsite
export class HostTrailWebsite extends Website {
    SiteName = "HostTrail";
    Host = M06_HOSTTRAIL_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m06", [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata => {
                if (!isM06StageOpen(M06_STAGE.door)) return notFoundMetadata();

                return (
                    requireHttps(context) ?? {
                        title: "HostTrail",
                        description: "Passive certificate samples by hostname.",
                        html: renderHome(),
                    }
                );
            },
        },
    ]);
}
