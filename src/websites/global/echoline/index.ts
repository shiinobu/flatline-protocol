import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { M05_SNAPSHOTS, type StaffRow } from "../../../content/m05/echoline.js";
import { M05_ECHOLINE_DOMAIN, M05_HOSPITAL_MAIL_DOMAIN } from "../../../content/m05/network.js";
import {
    M06_ARCHIVE_AGENT_NAME,
    M06_ARCHIVE_CONTACT,
    M06_ARCHIVE_DATE,
    M06_ARCHIVE_PATH,
    M06_ARCHIVE_ROWS,
} from "../../../content/m06/archive.js";
import { M06_AGENT_NUMBER } from "../../../content/m06/records.js";
import { M06_REGISTRY_JURISDICTION } from "../../../content/m06/network.js";
import { isM05ArchiveOpen } from "../../../context/m05/progress.js";
import { M06_STAGE, isM06ShellStruckOff, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { localizeHtml } from "../localize.js";
import { notFoundMetadata, requireHttps } from "../page-guards.js";

import indexPage from "./index-page.html";
import snapshotPage from "./snapshot.html";
import snapshotRecordPage from "./snapshot-record.html";

const ROLE_KEYS: Readonly<Record<StaffRow["roleKey"], string>> = {
    sysadmin: M05_SITE_KEY.EL_ROLE_SYSADMIN,
    contractor: M05_SITE_KEY.EL_ROLE_CONTRACTOR,
    servicedesk: M05_SITE_KEY.EL_ROLE_SERVICEDESK,
    network: M05_SITE_KEY.EL_ROLE_NETWORK,
};

interface CaptureGroup {
    readonly subject: string;
    readonly captures: readonly { readonly path: string; readonly date: string }[];
}

const escape = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderStaffRows = (staff: readonly StaffRow[]): string =>
    staff
        .map(
            (entry) =>
                `<tr><td>${escape(entry.name)}</td><td>${escape(siteT(ROLE_KEYS[entry.roleKey]))}</td><td class="c">${escape(entry.account)}</td></tr>`,
        )
        .join("");

const groups = (): readonly CaptureGroup[] => {
    const open: CaptureGroup[] = [];

    if (isM05ArchiveOpen()) {
        open.push({
            subject: `${M05_HOSPITAL_MAIL_DOMAIN}/it/team`,
            captures: M05_SNAPSHOTS.map((snapshot) => ({ path: snapshot.path, date: snapshot.date })),
        });
    }

    if (isM06StageOpen(M06_STAGE.archive)) {
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

const renderIndex = (): string => localizeHtml(indexPage).replace("/*__EL_GROUPS__*/", renderGroups());

const renderStaffSnapshot = (date: string, staff: readonly StaffRow[]): string =>
    localizeHtml(snapshotPage)
        .replace("/*__EL_BANNER__*/", escape(siteT(M05_SITE_KEY.EL_BANNER).replace("{{date}}", date)))
        .replace("/*__EL_ROWS__*/", renderStaffRows(staff));

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

    return localizeHtml(snapshotRecordPage)
        .replace(
            "/*__AR_BANNER__*/",
            escape(siteT(M06_SITE_KEY.AR_BANNER).replace("{{date}}", M06_ARCHIVE_DATE)),
        )
        .replace("/*__AR_FIELDS__*/", fields)
        .replace("/*__AR_ROWS__*/", rows);
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

const anyCaptureOpen = (): boolean => isM05ArchiveOpen() || isM06StageOpen(M06_STAGE.archive);

@RegisterWebsite
export class EcholineArchiveWebsite extends Website {
    SiteName = "Echoline Archive";
    Host = M05_ECHOLINE_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        gated("/", "Echoline Archive", anyCaptureOpen, renderIndex),
        ...M05_SNAPSHOTS.map((snapshot) =>
            gated(snapshot.path, "Archived capture", isM05ArchiveOpen, () =>
                renderStaffSnapshot(snapshot.date, snapshot.staff),
            ),
        ),
        gated(
            M06_ARCHIVE_PATH,
            "Archived capture",
            () => isM06StageOpen(M06_STAGE.archive),
            renderRecordSnapshot,
        ),
    ];
}
