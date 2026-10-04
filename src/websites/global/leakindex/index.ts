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
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { fillDataMarker, localizeHtml } from "../localize.js";
import { requireHttps } from "../page-guards.js";

import homePage from "./home.html";

const LEAKINDEX_ICON =
    "data:image/svg+xml," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
            '<rect width="64" height="64" rx="14" fill="#140c0a"/>' +
            '<circle cx="27" cy="27" r="12" fill="none" stroke="#ff7a4a" stroke-width="5"/>' +
            '<path d="M36 36l13 13" fill="none" stroke="#ff7a4a" stroke-width="6" stroke-linecap="round"/>' +
            '<path d="M22 27h10M27 22v10" stroke="#ffd0b8" stroke-width="3" stroke-linecap="round"/></svg>',
    );

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
    Icon = LEAKINDEX_ICON;
    Popular = true;

    Exports = {
        flatlineOpenLeakRecord: (id: number): void => {
            Events.emit(M05_LEAK_OPENED_EVENT, { id });
        },
    };

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata =>
                requireHttps(context) ?? {
                    title: "LeakIndex",
                    description: "Breach record lookup.",
                    html: renderHome(),
                },
        },
    ];
}
