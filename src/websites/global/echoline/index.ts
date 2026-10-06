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
import { CHEVRON_LEFT, CHEVRON_RIGHT, ECHOLINE_ICON, ECHOLINE_LOGO } from "./brand.js";

import indexPage from "./index-page.html";
import snapshotPage from "./snapshot.html";
import snapshotRecordPage from "./snapshot-record.html";

interface CaptureEntry {
    readonly path: string;
    readonly date: string;
    readonly number: number;
    readonly delta: CaptureDelta | null;
    readonly baseline: boolean;
    readonly search: string;
}

interface CaptureGroup {
    readonly subject: string;
    readonly markLatest: boolean;
    readonly captures: readonly CaptureEntry[];
}

const YEAR_MONTH_LENGTH = 7;

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
        baseline: index === 0,
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
        open.push({ subject: M05_ECHOLINE_SUBJECT, markLatest: true, captures: m05Entries() });
    }

    if (m06CapturesOpen()) {
        const subject = `pcr-registry.org/entity/${M06_AGENT_NUMBER.toLowerCase()}`;

        open.push({
            subject,
            markLatest: false,
            captures: [
                {
                    path: M06_ARCHIVE_PATH,
                    date: M06_ARCHIVE_DATE,
                    number: 1,
                    delta: null,
                    baseline: false,
                    search: searchText([subject, M06_ARCHIVE_DATE, M06_ARCHIVE_PATH, m05CaptureRef(M06_ARCHIVE_PATH)]),
                },
            ],
        });
    }

    return open;
};

const renderDelta = (capture: CaptureEntry): string => {
    if (!capture.delta) return capture.baseline ? escape(siteT(M05_SITE_KEY.EL_FIRST_HEAD)) : "";

    const parts = [
        capture.delta.added > 0
            ? `<span class="a">${escape(siteT(M05_SITE_KEY.EL_DELTA_ADDED, { n: capture.delta.added }))}</span>`
            : "",
        capture.delta.removed > 0
            ? `<span class="r">${escape(siteT(M05_SITE_KEY.EL_DELTA_REMOVED, { n: capture.delta.removed }))}</span>`
            : "",
    ].filter((part) => part !== "");

    if (parts.length === 0) return escape(siteT(M05_SITE_KEY.EL_DELTA_NONE));

    return `${parts.join(", ")} ${escape(siteT(M05_SITE_KEY.EL_SINCE_BEFORE))}`;
};

const renderCapture = (capture: CaptureEntry, isLatest: boolean): string => {
    const href = escape(capture.path);
    const latest = isLatest ? `<span class="chip">${escape(siteT(M05_SITE_KEY.EL_MOST_RECENT))}</span>` : "";
    const ref = escape(siteT(M05_SITE_KEY.EL_REF, { ref: m05CaptureRef(capture.path) }));

    return [
        `<li class="capture" data-search="${escape(capture.search)}">`,
        `<div class="n">${capture.number}</div>`,
        `<div><div class="when"><a href="${href}"><time datetime="${escape(capture.date)}">${escape(capture.date)}</time></a>${latest}</div>`,
        `<p class="what"><code>${ref}</code>${renderDelta(capture)}</p></div>`,
        `<a class="open" href="${href}">${escape(siteT(M05_SITE_KEY.EL_VIEW))}</a>`,
        "</li>",
    ].join("");
};

const renderGroups = (open: readonly CaptureGroup[] = groups()): string => {
    if (open.length === 0) return `<p class="empty">${escape(siteT(M05_SITE_KEY.EL_EMPTY))}</p>`;

    return open
        .map((group) =>
            [
                '<section class="archive-group">',
                `<div class="group-head"><h2>${escape(siteT(M05_SITE_KEY.EL_SNAPSHOTS_OF))}</h2><span class="group-subject">${escape(group.subject)}</span></div>`,
                `<ol class="caps">${group.captures.map((capture, position) => renderCapture(capture, group.markLatest && position === 0)).join("")}</ol>`,
                "</section>",
            ].join(""),
        )
        .join("");
};

const renderIndex = (): string =>
    fillMarkers(localizeHtml(indexPage), { EL_LOGO: ECHOLINE_LOGO, EL_GROUPS: renderGroups() });

const roleOf = (entry: StaffRow): string => escape(siteT(M05_STAFF_ROLE_KEYS[entry.roleKey]));

const renderDeparted = (entry: StaffRow, lastListed: string): string =>
    `<li><strong>${escape(entry.name)}</strong><span class="role">${roleOf(entry)}</span><code>${escape(entry.account)}</code><span class="seen">${escape(siteT(M05_SITE_KEY.EL_LAST_LISTED, { date: lastListed }))}</span></li>`;

const renderArrival = (entry: StaffRow): string =>
    `<li class="c"><strong>${escape(entry.name)}</strong><span class="role">${roleOf(entry)}</span></li>`;

const renderColumn = (kind: "out" | "in", head: string, count: number, items: string): string => {
    const body = items ? `<ul>${items}</ul>` : `<p class="none">${escape(siteT(M05_SITE_KEY.EL_NOBODY))}</p>`;

    return `<div class="chg-col ${kind}"><h3>${escape(head)}<b>${count}</b></h3>${body}</div>`;
};

const renderChanges = (view: CaptureView): string => {
    if (!view.previous) {
        return `<section class="changes first"><h2>${escape(siteT(M05_SITE_KEY.EL_FIRST_HEAD))}</h2><p>${escape(siteT(M05_SITE_KEY.EL_FIRST_BODY))}</p></section>`;
    }

    const departed = view.left.map((item) => renderDeparted(item.entry, item.lastCaptured));
    const arrivals = view.rows.filter((row) => row.status === "joined").map((row) => row.entry);

    return [
        '<section class="changes" aria-labelledby="changes-title">',
        `<h2 id="changes-title">${escape(siteT(M05_SITE_KEY.EL_CHANGES_HEAD))}<span>${escape(view.previous.date)}</span></h2>`,
        '<div class="chg-cols">',
        renderColumn("out", siteT(M05_SITE_KEY.EL_OUT_HEAD), departed.length, departed.join("")),
        renderColumn("in", siteT(M05_SITE_KEY.EL_IN_HEAD), arrivals.length, arrivals.map(renderArrival).join("")),
        "</div></section>",
    ].join("");
};

const renderRoster = (view: CaptureView): string => {
    const people = view.rows
        .map((row) => {
            const fresh = row.status === "joined" ? `<span class="chip">${escape(siteT(M05_SITE_KEY.EL_NEW))}</span>` : "";

            return `<li><strong>${escape(row.entry.name)}</strong>${fresh}<span class="role">${roleOf(row.entry)}</span><code>${escape(row.entry.account)}</code></li>`;
        })
        .join("");
    const shared = M05_ECHOLINE_SHARED_MAILBOXES.map((entry) => `<code>${escape(entry.account)}</code>`).join(", ");

    return [
        '<section class="roster" aria-labelledby="roster-title">',
        `<h2 id="roster-title">${escape(siteT(M05_SITE_KEY.EL_ROSTER_HEAD))}<span>${escape(siteT(M05_SITE_KEY.EL_ROSTER_COUNT, { n: view.rows.length }))}</span></h2>`,
        `<ul class="people">${people}</ul>`,
        `<p class="shared"><b>${escape(siteT(M05_SITE_KEY.EL_SHARED_HEAD))}</b> ${shared}</p>`,
        "</section>",
    ].join("");
};

const renderStrip = (view: CaptureView): string => {
    const items = M05_ECHOLINE_CAPTURES.map((capture, index) => {
        const current = index + 1 === view.position ? ' aria-current="page"' : "";
        const title = `${capture.date} · ${siteT(M05_SITE_KEY.EL_REF, { ref: m05CaptureRef(capture.path) })}`;

        return `<li><a href="${escape(capture.path)}"${current} title="${escape(title)}"><b>${index + 1}</b><i>${escape(capture.date.slice(0, YEAR_MONTH_LENGTH))}</i></a></li>`;
    }).join("");

    return `<ol class="strip" aria-label="${escape(siteT(M05_SITE_KEY.EL_NAV_INDEX))}">${items}</ol>`;
};

const navLink = (label: string, capture: { readonly path: string } | null, before: string, after: string): string => {
    const text = `${before}${escape(label)}${after}`;

    return capture ? `<a class="btn" href="${escape(capture.path)}">${text}</a>` : `<span class="btn off">${text}</span>`;
};

const renderCaptureBar = (view: CaptureView): string => {
    const position = siteT(M05_SITE_KEY.EL_POSITION, { n: view.position, total: view.total });
    const ref = siteT(M05_SITE_KEY.EL_REF, { ref: m05CaptureRef(view.capture.path) });

    return [
        navLink(siteT(M05_SITE_KEY.EL_PREVIOUS), view.previous, CHEVRON_LEFT, ""),
        `<p class="where"><b>${escape(position)}</b><span>${escape(view.capture.date)} · <code>${escape(ref)}</code></span></p>`,
        navLink(siteT(M05_SITE_KEY.EL_NEXT), view.next, "", CHEVRON_RIGHT),
    ].join("");
};

const renderStamp = (view: CaptureView): string => {
    const stamp = view.capture.lastUpdated
        ? siteT(M05_SITE_KEY.EL_STAMP, { date: view.capture.lastUpdated })
        : siteT(M05_SITE_KEY.EL_NO_STAMP);
    const parts = [escape(stamp)];

    if (isM05TeamOpen()) {
        parts.push(
            `<a href="https://${escape(M05_HOSPITAL_HOME_DOMAIN)}${escape(M05_TEAM_PATH)}">${escape(siteT(M05_SITE_KEY.EL_OPEN_LIVE))}</a>`,
        );
    }

    if (m05CaptureRef(view.capture.path) === M05_ECHOLINE_CHANGE_CAPTURE_REF) {
        parts.push(`<span class="cited">${escape(siteT(M05_SITE_KEY.EL_CITED_BY, { id: M05_CHANGE_ID }))}</span>`);
    }

    return parts.join(" · ");
};

const renderNotes = (view: CaptureView): string =>
    [
        `<p><b>${escape(siteT(M05_SITE_KEY.EL_NOTE_LABEL))}</b> ${escape(siteT(M05_SITE_KEY.EL_ARCHIVIST_NOTE))}</p>`,
        ...(view.isLatest ? [`<p>${escape(siteT(M05_SITE_KEY.EL_LATE_NOTE))}</p>`] : []),
    ].join("");

const renderStaffSnapshot = (index: number): string => {
    const view = m05CaptureView(index);

    return fillMarkers(localizeHtml(snapshotPage), {
        EL_BANNER: escape(siteT(M05_SITE_KEY.EL_BANNER, { date: view.capture.date })),
        EL_LOGO: ECHOLINE_LOGO,
        EL_BAR: renderCaptureBar(view),
        EL_STRIP: renderStrip(view),
        EL_STAMP: renderStamp(view),
        EL_REMOTE: escape(siteT(M05_SITE_KEY.EL_REMOTE_NOTE, { host: M05_REMOTE_DOMAIN })),
        EL_CHANGES: renderChanges(view),
        EL_ROSTER: renderRoster(view),
        EL_NOTES: renderNotes(view),
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
        EL_LOGO: ECHOLINE_LOGO,
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
    Icon = ECHOLINE_ICON;

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
