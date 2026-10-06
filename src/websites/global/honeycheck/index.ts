import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M07_HONEYCHECK_DOMAIN,
    M07_HONEYCHECK_RECORDS,
    type HoneyCheckRecord,
} from "../../../content/m07/honeycheck.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M07_SITE_KEY } from "../../../i18n/m07/site.js";
import { gateMissionPages, requireHttps } from "../../global/page-guards.js";
import { fillDataMarker, localizeHtml } from "../../global/localize.js";

import homePage from "./home.html";

const SIGNAL_KEYS: Readonly<Record<string, string>> = {
    c2: M07_SITE_KEY.HC_SIGNALS_C2,
    nullcrown: M07_SITE_KEY.HC_SIGNALS_NULLCROWN,
    ashvector: M07_SITE_KEY.HC_SIGNALS_ASHVECTOR,
};

const toPayload = (record: HoneyCheckRecord): Record<string, string | number> => ({
    host: record.host,
    verdict: record.verdict,
    tone: record.tone,
    confidence: record.confidence,
    lastSeen: record.lastSeen,
    signals: siteT(SIGNAL_KEYS[record.signalsKey] ?? ""),
});

const verdictText = (): Record<string, string> => ({
    clean: siteT(M07_SITE_KEY.HC_VERDICT_CLEAN),
    likely: siteT(M07_SITE_KEY.HC_VERDICT_LIKELY),
    notHoneypot: siteT(M07_SITE_KEY.HC_VERDICT_NOT_POT),
    confidence: siteT(M07_SITE_KEY.HC_CONFIDENCE),
});

const renderHome = (): string =>
    fillDataMarker(
        fillDataMarker(localizeHtml(homePage), "HONEYCHECK_DATA", JSON.stringify(M07_HONEYCHECK_RECORDS.map(toPayload))),
        "HONEYCHECK_TEXT",
        JSON.stringify(verdictText()),
    );

const home = (): DynamicWebsitePageDefinition => ({
    path: "/",
    metadata: (context: PageContext): PageMetadata =>
        requireHttps(context) ?? {
            title: "HoneyCheck",
            description: "Host sampling and honeypot risk notes.",
            html: renderHome(),
        },
});

@RegisterWebsite
export class HoneyCheckWebsite extends Website {
    SiteName = "HoneyCheck";
    Host = M07_HONEYCHECK_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m07", [home()]);
}
