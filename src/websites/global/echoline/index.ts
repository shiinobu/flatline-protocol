import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M05_SNAPSHOTS, type StaffRow } from "../../../content/m05/echoline.js";
import { M05_ECHOLINE_DOMAIN, M05_SNAPSHOT_2025, M05_SNAPSHOT_2026 } from "../../../content/m05/network.js";
import { isM05ArchiveOpen } from "../../../context/m05/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { localizeHtml } from "../localize.js";
import { notFoundMetadata, requireHttps } from "../page-guards.js";

import indexPage from "./index-page.html";
import snapshotPage from "./snapshot.html";

const ROLE_KEYS: Readonly<Record<StaffRow["roleKey"], string>> = {
    sysadmin: M05_SITE_KEY.EL_ROLE_SYSADMIN,
    contractor: M05_SITE_KEY.EL_ROLE_CONTRACTOR,
    servicedesk: M05_SITE_KEY.EL_ROLE_SERVICEDESK,
    network: M05_SITE_KEY.EL_ROLE_NETWORK,
};

const escape = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderRows = (staff: readonly StaffRow[]): string =>
    staff
        .map(
            (entry) =>
                `<tr><td>${escape(entry.name)}</td><td>${escape(siteT(ROLE_KEYS[entry.roleKey]))}</td><td class="c">${escape(entry.account)}</td></tr>`,
        )
        .join("");

const renderIndex = (): string =>
    localizeHtml(indexPage)
        .replace("/*__EL_DATE_2025__*/", M05_SNAPSHOT_2025)
        .replace("/*__EL_DATE_2026__*/", M05_SNAPSHOT_2026);

const renderSnapshot = (date: string, staff: readonly StaffRow[]): string =>
    localizeHtml(snapshotPage)
        .replace("/*__EL_BANNER__*/", escape(siteT(M05_SITE_KEY.EL_BANNER).replace("{{date}}", date)))
        .replace("/*__EL_ROWS__*/", renderRows(staff));

const gated = (path: string, title: string, html: () => string): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!isM05ArchiveOpen()) return notFoundMetadata();

        return requireHttps(context) ?? { title, description: "Archived capture.", html: html() };
    },
});

@RegisterWebsite
export class EcholineArchiveWebsite extends Website {
    SiteName = "Echoline Archive";
    Host = M05_ECHOLINE_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        gated("/", "Echoline Archive", renderIndex),
        ...M05_SNAPSHOTS.map((snapshot) =>
            gated(snapshot.path, "Archived capture", () => renderSnapshot(snapshot.date, snapshot.staff)),
        ),
    ];
}
