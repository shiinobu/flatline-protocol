import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M05_REMOTE_DOMAIN } from "../../../content/m05/network.js";
import { isM05TeamOpen } from "../../../context/m05/progress.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";
import { toolIcon } from "../../global/tool-page.js";
import { portalLogin, portalSeen, portalState, type PortalLoginResult, type PortalState } from "./exports.js";
import { renderPortal } from "./render.js";

const PORTAL_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#0b1f19"/>' +
        '<path d="M10 54C8 28 24 10 56 8c2 30-14 48-42 46z" fill="#35c68c"/>' +
        '<path d="M16 48c8-16 18-24 34-32" fill="none" stroke="#06231b" stroke-width="4" stroke-linecap="round"/>',
);

@RegisterWebsite
export class PacificCareRemoteWebsite extends Website {
    SiteName = "PacificCare Remote Access";
    Host = M05_REMOTE_DOMAIN;
    Icon = PORTAL_ICON;

    Exports = {
        flatlineLogin: (user: string, password: string): PortalLoginResult => portalLogin(user, password),
        flatlinePortalSeen: (kind: string, ref: string): number => portalSeen(kind, ref),
        flatlinePortalState: (): PortalState => portalState(),
    };

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m05", [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata => {
                const insecure = requireHttps(context);
                if (insecure) return insecure;
                if (!isM05TeamOpen()) return notFoundMetadata();

                return {
                    title: "PacificCare Remote Access",
                    description: "Staff remote access.",
                    html: renderPortal(),
                };
            },
        },
    ]);
}
