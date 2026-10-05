import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M05_ECHOLINE_CAPTURES,
    M05_ECHOLINE_CHANGE_CAPTURE_REF,
    M05_ECHOLINE_SHARED_MAILBOXES,
    M05_ECHOLINE_SUBJECT,
    m05CaptureDelta,
    m05CaptureRef,
    m05CaptureView,
    type CaptureDelta,
    type CaptureView,
    type StaffRow,
} from "../../../content/m05/echoline.js";
import { M05_STAFF_ROLE_KEYS } from "../../../content/m05/hospital.js";
import {
    M05_CHANGE_ID,
    M05_ECHOLINE_DOMAIN,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_REMOTE_DOMAIN,
    M05_SEARCH_PATH,
    M05_TEAM_PATH,
} from "../../../content/m05/network.js";
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
import { isM05ArchiveOpen, isM05TeamOpen } from "../../../context/m05/progress.js";
import { M06_STAGE, isM06ShellStruckOff, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { fillMarkers, localizeHtml } from "../localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../page-guards.js";

import indexPage from "./index-page.html";
import snapshotPage from "./snapshot.html";
import snapshotRecordPage from "./snapshot-record.html";

interface CaptureEntry {
    readonly path: string;
    readonly date: string;
    readonly number: number;
    readonly delta: CaptureDelta | null;
    readonly search: string;
}

interface CaptureGroup {
    readonly subject: string;
    readonly captures: readonly CaptureEntry[];
}

const MINUS = "−";

const escape = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const m05CapturesOpen = (): boolean => areMissionSitesOpen("m05") && isM05ArchiveOpen();

const m06CapturesOpen = (): boolean => areMissionSitesOpen("m06") && isM06StageOpen(M06_STAGE.archive);

const searchText = (parts: readonly string[]): string => parts.join(" ").toLowerCase();

const m05Entries = (): readonly CaptureEntry[] =>
    M05_ECHOLINE_CAPTURES.map((capture, index) => ({
        path: capture.path,
        date: capture.date,
        number: index + 1,
        delta: m05CaptureDelta(index),
        search: searchText([
            M05_ECHOLINE_SUBJECT,
            capture.date,
            capture.path,
            m05CaptureRef(capture.path),
            ...capture.staff.map((entry) => entry.account),
        ]),
    })).reverse();

const groups = (): readonly CaptureGroup[] => {
    const open: CaptureGroup[] = [];

    if (m05CapturesOpen()) {
        open.push({ subject: M05_ECHOLINE_SUBJECT, captures: m05Entries() });
    }

    if (m06CapturesOpen()) {
        const subject = `pcr-registry.org/entity/${M06_AGENT_NUMBER.toLowerCase()}`;

        open.push({
            subject,
            captures: [
                {
                    path: M06_ARCHIVE_PATH,
                    date: M06_ARCHIVE_DATE,
                    number: 1,
                    delta: null,
                    search: searchText([subject, M06_ARCHIVE_DATE, M06_ARCHIVE_PATH, m05CaptureRef(M06_ARCHIVE_PATH)]),
                },
            ],
        });
    }

    return open;
};

const renderChips = (delta: CaptureDelta | null): string =>
    delta
        ? `<span class="chip add" title="${escape(siteT(M05_SITE_KEY.EL_CHIP_ADDED))}">+${delta.added}</span><span class="chip del" title="${escape(siteT(M05_SITE_KEY.EL_CHIP_REMOVED))}">${MINUS}${delta.removed}</span>`
        : "";

const renderCapture = (subject: string, capture: CaptureEntry): string =>
    [
        `<li class="capture" data-search="${escape(capture.search)}">`,
        `<div class="capture-index">${String(capture.number).padStart(2, "0")}</div>`,
        '<div class="capture-body">',
        `<p class="record-label">${escape(siteT(M05_SITE_KEY.EL_REF, { ref: m05CaptureRef(capture.path) }))}</p>`,
        `<a class="capture-link" href="${escape(capture.path)}">${escape(subject)}<span aria-hidden="true">↗</span></a>`,
        `<div class="cap-meta"><span>${escape(siteT(M05_SITE_KEY.EL_CAPTURED))}</span><time datetime="${escape(capture.date)}">${escape(capture.date)}</time>${renderChips(capture.delta)}</div>`,
        "</div>",
        `<a class="open-record" href="${escape(capture.path)}">${escape(siteT(M05_SITE_KEY.EL_VIEW))}</a>`,
        "</li>",
    ].join("");

const renderGroups = (open: readonly CaptureGroup[] = groups()): string => {
    if (open.length === 0) return `<p class="empty">${escape(siteT(M05_SITE_KEY.EL_EMPTY))}</p>`;

    return open
        .map((group) =>
            [
                '<section class="archive-group">',
                `<div class="group-head"><p class="sect">${escape(siteT(M05_SITE_KEY.EL_SNAPSHOTS_OF))}</p><span class="group-subject">${escape(group.subject)}</span></div>`,
                `<ol>${group.captures.map((capture) => renderCapture(group.subject, capture)).join("")}</ol>`,
                "</section>",
            ].join(""),
        )
        .join("");
};

const renderIndex = (): string => fillMarkers(localizeHtml(indexPage), { EL_GROUPS: renderGroups() });

const staffRow = (entry: StaffRow, status: string, statusClass: string, date: string, struck: boolean): string => {
    const wrap = (value: string): string => (struck ? `<s>${escape(value)}</s>` : escape(value));

    return `<tr><td>${wrap(entry.name)}</td><td>${wrap(siteT(M05_STAFF_ROLE_KEYS[entry.roleKey]))}</td><td class="c">${wrap(entry.account)}</td><td><span class="status ${statusClass}">${escape(status)}</span></td><td class="d">${escape(date)}</td></tr>`;
};

const firstCaptured = (date: string): string => siteT(M05_SITE_KEY.EL_FIRST_CAPTURED, { date });

const renderStaffRows = (view: CaptureView): string => {
    const listed = siteT(M05_SITE_KEY.EL_STATUS_LISTED);
    const joined = siteT(M05_SITE_KEY.EL_STATUS_JOINED);
    const baseline = M05_ECHOLINE_CAPTURES[0].date;

    const shared = M05_ECHOLINE_SHARED_MAILBOXES.map((entry) =>
        staffRow(entry, listed, "listed", firstCaptured(baseline), false),
    );
    const people = view.rows.map((item) =>
        item.status === "joined"
            ? staffRow(item.entry, joined, "joined", firstCaptured(item.firstCaptured), false)
            : staffRow(item.entry, listed, "listed", firstCaptured(item.firstCaptured), false),
    );

    return [...shared, ...people].join("");
};

const renderLeftBlock = (view: CaptureView): string => {
    if (view.left.length === 0) return "";

    const rows = view.left
        .map((item) =>
            staffRow(
                item.entry,
                siteT(M05_SITE_KEY.EL_STATUS_LEFT),
                "left",
                `${siteT(M05_SITE_KEY.EL_LAST_CAPTURED, { date: item.lastCaptured })} · ${siteT(M05_SITE_KEY.EL_NOT_LISTED_ON, { date: view.capture.date })}`,
                true,
            ),
        )
        .join("");

    return `<section class="left-block"><p class="left-head">${escape(siteT(M05_SITE_KEY.EL_LEFT_HEAD))}</p><div class="table-wrap"><table><tbody>${rows}</tbody></table></div></section>`;
};

const navLink = (label: string, capture: { readonly path: string } | null, before: string, after: string): string => {
    const text = `${before}${escape(label)}${after}`;

    return capture ? `<a class="nav" href="${escape(capture.path)}">${text}</a>` : `<span class="nav off">${text}</span>`;
};

const renderCaptureBar = (view: CaptureView): string => {
    const ref = m05CaptureRef(view.capture.path);
    const parts = [
        navLink(siteT(M05_SITE_KEY.EL_PREVIOUS), view.previous, "← ", ""),
        `<span class="pos">${escape(siteT(M05_SITE_KEY.EL_POSITION, { n: String(view.position), total: String(view.total) }))}</span>`,
        `<span class="ref">${escape(siteT(M05_SITE_KEY.EL_REF, { ref }))}</span>`,
        navLink(siteT(M05_SITE_KEY.EL_NEXT), view.next, "", " →"),
    ];

    if (isM05TeamOpen()) {
        parts.push(
            `<a class="live" href="https://${escape(M05_HOSPITAL_HOME_DOMAIN)}${escape(M05_TEAM_PATH)}">${escape(siteT(M05_SITE_KEY.EL_OPEN_LIVE))}</a>`,
        );
    }

    if (ref === M05_ECHOLINE_CHANGE_CAPTURE_REF) {
        parts.push(`<span class="cited">${escape(siteT(M05_SITE_KEY.EL_CITED_BY, { id: M05_CHANGE_ID }))}</span>`);
    }

    return parts.join("");
};

const renderStamp = (view: CaptureView): string =>
    escape(
        view.capture.lastUpdated
            ? siteT(M05_SITE_KEY.EL_STAMP, { date: view.capture.lastUpdated })
            : siteT(M05_SITE_KEY.EL_NO_STAMP),
    );

const renderNotes = (view: CaptureView): string =>
    [siteT(M05_SITE_KEY.EL_ARCHIVIST_NOTE), ...(view.isLatest ? [siteT(M05_SITE_KEY.EL_LATE_NOTE)] : [])]
        .map(escape)
        .join("<br>");

const renderStaffSnapshot = (index: number): string => {
    const view = m05CaptureView(index);

    return fillMarkers(localizeHtml(snapshotPage), {
        EL_BANNER: escape(siteT(M05_SITE_KEY.EL_BANNER, { date: view.capture.date })),
        EL_BAR: renderCaptureBar(view),
        EL_STAMP: renderStamp(view),
        EL_ROWS: renderStaffRows(view),
        EL_LEFT: renderLeftBlock(view),
        EL_NOTES: renderNotes(view),
        EL_REMOTE: escape(siteT(M05_SITE_KEY.EL_REMOTE_NOTE, { host: M05_REMOTE_DOMAIN })),
    });
};

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
        { ...indexPageDefinition(), path: M05_SEARCH_PATH, seo: false },
        ...gateMissionPages("m05", [
            ...M05_ECHOLINE_CAPTURES.map((capture, index) =>
                gated(capture.path, "Archived capture", isM05ArchiveOpen, () => renderStaffSnapshot(index)),
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
