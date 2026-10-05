import type { DynamicWebsitePageDefinition, PageContext, PageMetadata } from "@hotbunny/hackhub-content-sdk";

import { areMissionSitesOpen } from "../../context/global/site-access.js";
import type { QuestId } from "../../guard/flags.js";
import httpErrorPage from "./http-error-400.html";
import { localizeHtml } from "./localize.js";
import notFoundPage404 from "./not-found-404.html";

export const requireHttps = (context: PageContext): PageMetadata | null => {
    if (context.url.startsWith("https:")) return null;

    return {
        title: "400 Bad Request",
        description: "Insecure request rejected.",
        html: httpErrorPage,
    };
};

export const securePage = (
    path: string,
    html: string,
    title: string,
    description: string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata =>
        requireHttps(context) ?? { title, description, html: localizeHtml(html) },
});

export const notFoundMetadata = (): PageMetadata => ({
    title: "404 Not Found",
    description: "Resource unavailable.",
    html: notFoundPage404,
});

export const notFoundPage = (path: string): DynamicWebsitePageDefinition => ({
    path,
    metadata: notFoundMetadata,
});

const closedSearchableMetadata = (context: PageContext): PageMetadata | null =>
    context.searchStr === undefined ? notFoundMetadata() : null;

export const gateMissionPages = (
    mission: QuestId,
    pages: readonly DynamicWebsitePageDefinition[],
): DynamicWebsitePageDefinition[] =>
    pages.map((definition) => ({
        ...definition,
        metadata: (context: PageContext): PageMetadata | null => {
            if (areMissionSitesOpen(mission)) return definition.metadata(context);

            return definition.seo ? closedSearchableMetadata(context) : notFoundMetadata();
        },
    }));
