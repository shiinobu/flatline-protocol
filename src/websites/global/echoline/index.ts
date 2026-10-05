import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M05_ECHOLINE_CAPTURE, type StaffRow } from "../../../content/m05/echoline.js";
import { M05_STAFF_ROLE_KEYS } from "../../../content/m05/hospital.js";
import { M05_ECHOLINE_DOMAIN, M05_REMOTE_DOMAIN, M05_HOSPITAL_MAIL_DOMAIN } from "../../../content/m05/network.js";
import {
    M06_ARCHIVE_AGENT_NAME,
    M06_ARCHIVE_CONTACT,
    M06_ARCHIVE_DATE,
    M06_ARCHIVE_PATH,
    M06_ARCHIVE_ROWS,
} from "../../../content/m06/archive.js";
import { M06_AGENT_NUMBER } from "../../../content/m06/records.js";
import { M06_REGISTRY_JURISDICTION } from "../../../content/m06/network.js";
import { areMissionSitesOpen } from "../../../context/global/site-access.js";
import { isM05ArchiveOpen } from "../../../context/m05/progress.js";
import { M06_STAGE, isM06ShellStruckOff, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { fillMarkers, localizeHtml } from "../localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../page-guards.js";

import indexPage from "./index-page.html";
import snapshotPage from "./snapshot.html";
import snapshotRecordPage from "./snapshot-record.html";

interface CaptureGroup {
    readonly subject: string;
    readonly captures: readonly { readonly path: string; readonly date: string }[];
}

const escape = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const m05CapturesOpen = (): boolean => areMissionSitesOpen("m05") && isM05ArchiveOpen();

const m06CapturesOpen = (): boolean => areMissionSitesOpen("m06") && isM06StageOpen(M06_STAGE.archive);

const renderStaffRows = (staff: readonly StaffRow[]): string =>
    staff
        .map(
            (entry) =>
                `<tr><td>${escape(entry.name)}</td><td>${escape(siteT(M05_STAFF_ROLE_KEYS[entry.roleKey]))}</td><td class="c">${escape(entry.account)}</td></tr>`,
        )
        .join("");

const groups = (): readonly CaptureGroup[] => {
    const open: CaptureGroup[] = [];

    if (m05CapturesOpen()) {
        open.push({
            subject: `${M05_HOSPITAL_MAIL_DOMAIN}/it/team`,
            captures: [{ path: M05_ECHOLINE_CAPTURE.path, date: M05_ECHOLINE_CAPTURE.date }],
        });
    }

    if (m06CapturesOpen()) {
        open.push({
            subject: `pcr-registry.org/entity/${M06_AGENT_NUMBER.toLowerCase()}`,
            captures: [{ path: M06_ARCHIVE_PATH, date: M06_ARCHIVE_DATE }],
        });
    }

    return open;
};

const renderGroups = (): string => {
    const open = groups();
    if (open.length === 0) return `<p class="empty">${escape(siteT(M05_SITE_KEY.EL_EMPTY))}</p>`;

    return open
        .map((group) => {
            const items = group.captures
                .map((capture) =>
                    [
                        "<li>",
                        `<div class="cap-date"><a href="${escape(capture.path)}">${escape(siteT(M05_SITE_KEY.EL_VIEW))}</a></div>`,
                        `<div class="cap-meta">${escape(siteT(M05_SITE_KEY.EL_CAPTURED))} ${escape(capture.date)}</div>`,
                        "</li>",
                    ].join(""),
                )
                .join("");

            return [
                `<p class="sect">${escape(siteT(M05_SITE_KEY.EL_SNAPSHOTS_OF))} — ${escape(group.subject)}</p>`,
                `<ol>${items}</ol>`,
            ].join("");
        })
        .join("");
};

const renderIndex = (): string => fillMarkers(localizeHtml(indexPage), { EL_GROUPS: renderGroups() });

const renderStaffSnapshot = (date: string, staff: readonly StaffRow[]): string =>
    fillMarkers(localizeHtml(snapshotPage), {
        EL_BANNER: escape(siteT(M05_SITE_KEY.EL_BANNER, { date })),
        EL_ROWS: renderStaffRows(staff),
        EL_REMOTE: escape(siteT(M05_SITE_KEY.EL_REMOTE_NOTE, { host: M05_REMOTE_DOMAIN })),
    });

const archiveContact = (): string => {
    const base = M06_ARCHIVE_CONTACT;

    return isM06ShellStruckOff() ? `${base} — ${siteT(M06_SITE_KEY.VALUE_NO_LONGER_LISTED)}` : base;
};

const renderRecordSnapshot = (): string => {
    const fields = [
        [siteT(M06_SITE_KEY.LABEL_NUMBER), M06_AGENT_NUMBER],
        [siteT(M06_SITE_KEY.LABEL_JURISDICTION), M06_REGISTRY_JURISDICTION],
        [siteT(M06_SITE_KEY.LABEL_AGENT), M06_ARCHIVE_AGENT_NAME],
        [siteT(M06_SITE_KEY.AR_LISTED_AS), archiveContact()],
    ]
        .map(([label, value]) => `<dt>${escape(label)}</dt><dd>${escape(value)}</dd>`)
        .join("");

    const rows = M06_ARCHIVE_ROWS.map(
        (row) =>
            `<tr><td>${escape(row.entity)}</td><td>${escape(row.number)}</td><td>${escape(siteT(row.statusKey))}</td></tr>`,
    ).join("");

    return fillMarkers(localizeHtml(snapshotRecordPage), {
        AR_BANNER: escape(siteT(M06_SITE_KEY.AR_BANNER, { date: M06_ARCHIVE_DATE })),
        AR_FIELDS: fields,
        AR_ROWS: rows,
    });
};

const gated = (
    path: string,
    title: string,
    open: () => boolean,
    html: () => string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!open()) return notFoundMetadata();

        return requireHttps(context) ?? { title, description: "Archived capture.", html: html() };
    },
});

const anyCaptureOpen = (): boolean => m05CapturesOpen() || m06CapturesOpen();

const indexPageDefinition = (): DynamicWebsitePageDefinition => ({
    path: "/",
    seo: true,
    metadata: (context: PageContext): PageMetadata | null => {
        if (!anyCaptureOpen()) return context.searchStr === undefined ? notFoundMetadata() : null;

        const insecure = context.searchStr === undefined ? requireHttps(context) : null;

        return insecure ?? { title: "Echoline Archive", description: "Archived capture.", html: renderIndex() };
    },
});

@RegisterWebsite
export class EcholineArchiveWebsite extends Website {
    SiteName = "Echoline Web Archive";
    Host = M05_ECHOLINE_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        indexPageDefinition(),
        ...gateMissionPages("m05", [
            gated(M05_ECHOLINE_CAPTURE.path, "Archived capture", isM05ArchiveOpen, () =>
                renderStaffSnapshot(M05_ECHOLINE_CAPTURE.date, M05_ECHOLINE_CAPTURE.staff),
            ),
        ]),
        ...gateMissionPages("m06", [
            gated(
                M06_ARCHIVE_PATH,
                "Archived capture",
                () => isM06StageOpen(M06_STAGE.archive),
                renderRecordSnapshot,
            ),
        ]),
    ];
}
