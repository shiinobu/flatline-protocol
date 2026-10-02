import {
    Events,
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M05_LEAK_HASH_ALGO,
    M05_LEAK_OPENED_EVENT,
    M05_LEAK_RECORDS,
    type LeakRecord,
} from "../../../content/m05/leakindex.js";
import { M05_LEAKINDEX_DOMAIN } from "../../../content/m05/network.js";
import { isM05LookupOpen } from "../../../context/m05/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { fillDataMarker, localizeHtml } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";

import homePage from "./home.html";

const SOURCE_KEYS: Readonly<Record<LeakRecord["source"], string>> = {
    medvendor: M05_SITE_KEY.LI_SOURCE_MEDVENDOR,
    foodforum: M05_SITE_KEY.LI_SOURCE_FOODFORUM,
};

const toPayload = (record: LeakRecord): Record<string, string | number> => ({
    id: record.id,
    email: record.email,
    source: siteT(SOURCE_KEYS[record.source]),
    year: record.year,
    hash: record.hash,
});

const widgetText = (): Record<string, string> => ({
    open: siteT(M05_SITE_KEY.LI_OPEN),
    count: siteT(M05_SITE_KEY.LI_COUNT),
    algo: M05_LEAK_HASH_ALGO,
});

const renderHome = (): string =>
    fillDataMarker(
        fillDataMarker(localizeHtml(homePage), "LEAKINDEX_DATA", JSON.stringify(M05_LEAK_RECORDS.map(toPayload))),
        "LEAKINDEX_TEXT",
        JSON.stringify(widgetText()),
    );

@RegisterWebsite
export class LeakIndexWebsite extends Website {
    SiteName = "LeakIndex";
    Host = M05_LEAKINDEX_DOMAIN;
    Icon = "";

    Exports = {
        flatlineOpenLeakRecord: (id: number): void => {
            Events.emit(M05_LEAK_OPENED_EVENT, { id });
        },
    };

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata => {
                if (!isM05LookupOpen()) return notFoundMetadata();

                return (
                    requireHttps(context) ?? {
                        title: "LeakIndex",
                        description: "Breach record lookup.",
                        html: renderHome(),
                    }
                );
            },
        },
    ]);
}
