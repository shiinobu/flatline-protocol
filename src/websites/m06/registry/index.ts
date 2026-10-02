import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M06_FILINGS_ARCHIVE_PATH,
    M06_REGISTRY_DOMAIN,
    M06_REGISTRY_UPDATED,
} from "../../../content/m06/network.js";
import {
    M06_FILING_PATHS,
    buildM06Records,
    type RecordField,
    type RegistryRecord,
} from "../../../content/m06/records.js";
import { M06_STAGE, isM06ShellStruckOff, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { fillDataMarker, fillMarker, fillMarkers, localizeHtml } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";

import filingsArchivePage from "./filings-archive.html";
import homePage from "./home.html";
import recordPage from "./record.html";

const SITE_KEYS: ReadonlySet<string> = new Set(Object.values(M06_SITE_KEY));

const KIND_KEYS: Readonly<Record<RegistryRecord["kind"], string>> = {
    entity: M06_SITE_KEY.KIND_ENTITY,
    officer: M06_SITE_KEY.KIND_OFFICER,
    filing: M06_SITE_KEY.KIND_FILING,
};

const SUBTITLE_KEYS: Readonly<Record<RegistryRecord["kind"], string>> = {
    entity: M06_SITE_KEY.SUB_ENTITY,
    officer: M06_SITE_KEY.SUB_OFFICER,
    filing: M06_SITE_KEY.SUB_FILING,
};

const FLAGGED_STATUS_KEYS: readonly string[] = [
    M06_SITE_KEY.STATUS_CONFLICTING,
    M06_SITE_KEY.STATUS_DISSOLVED,
    M06_SITE_KEY.STATUS_STRUCK_OFF,
];

const escape = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cellText = (value: string): string => (SITE_KEYS.has(value) ? siteT(value) : value);

const fieldValue = (entry: RecordField): string => {
    const base = entry.valueKey ? siteT(entry.valueKey) : entry.value;

    return entry.suffixKey ? `${base} — ${siteT(entry.suffixKey)}` : base;
};

const renderFields = (fields: readonly RecordField[]): string =>
    fields
        .map((entry) => `<dt>${escape(siteT(entry.labelKey))}</dt><dd>${escape(fieldValue(entry))}</dd>`)
        .join("");

const renderTable = (record: RegistryRecord): string => {
    if (record.tableRows.length === 0) return "";

    const head = record.tableHeadKeys
        .map((key) => `<th scope="col">${escape(siteT(key))}</th>`)
        .join("");
    const body = record.tableRows
        .map((row) => `<tr>${row.map((cell) => `<td>${escape(cellText(cell))}</td>`).join("")}</tr>`)
        .join("");

    return [
        `<div class="section">${escape(siteT(record.tableCaptionKey))}</div>`,
        `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
    ].join("");
};

const renderNotes = (
    noteKeys: readonly string[],
    vars: Readonly<Record<string, string>>,
): string => noteKeys.map((key) => `<p class="note">${escape(siteT(key, vars))}</p>`).join("");

const linkOpen = (path: string): boolean => {
    const target = buildM06Records(false).find((entry) => entry.path === path);

    return target === undefined || isM06StageOpen(target.stage);
};

const renderLinks = (record: RegistryRecord): string => {
    const open = record.links.filter((link) => linkOpen(link.path));
    if (open.length === 0) return "";

    const items = open
        .map((link) => `<li><a href="${escape(link.path)}">${escape(link.label)}</a></li>`)
        .join("");

    return [
        `<div class="section">${escape(siteT(M06_SITE_KEY.SECTION_LINKS))}</div>`,
        `<ul class="links">${items}</ul>`,
    ].join("");
};

const updatedLine = (): string =>
    escape(siteT(M06_SITE_KEY.REGISTRY_UPDATED).replace("{{date}}", M06_REGISTRY_UPDATED));

const renderRecord = (record: RegistryRecord): string =>
    fillMarkers(localizeHtml(recordPage), {
        REC_KIND: escape(siteT(SUBTITLE_KEYS[record.kind])),
        REC_TITLE: escape(record.title),
        REC_FLAG: FLAGGED_STATUS_KEYS.includes(record.statusKey) ? " flag" : "",
        REC_STATUS: escape(siteT(record.statusKey)),
        REC_FIELDS: renderFields(record.fields),
        REC_TABLE: renderTable(record),
        REC_NOTES: renderNotes(record.noteKeys, record.noteVars),
        REC_LINKS: renderLinks(record),
        REC_UPDATED: updatedLine(),
    });

const openRecords = (): readonly RegistryRecord[] =>
    buildM06Records(isM06ShellStruckOff()).filter((record) => isM06StageOpen(record.stage));

const searchPayload = (): readonly Record<string, string>[] =>
    openRecords().map((record) => ({
        name: record.title,
        number: record.number,
        status: siteT(record.statusKey),
        kind: siteT(KIND_KEYS[record.kind]),
        path: record.path,
    }));

const renderHome = (): string =>
    fillMarker(
        fillDataMarker(
            fillDataMarker(localizeHtml(homePage), "REG_DATA", JSON.stringify(searchPayload())),
            "REG_TEXT",
            JSON.stringify({ count: siteT(M06_SITE_KEY.SEARCH_COUNT) }),
        ),
        "REG_UPDATED",
        updatedLine(),
    );

const renderFilings = (): string => {
    const rows = buildM06Records(isM06ShellStruckOff())
        .filter((record) => M06_FILING_PATHS.includes(record.path))
        .map((record) => {
            const filed = record.fields.find((entry) => entry.labelKey === M06_SITE_KEY.LABEL_FILED);
            const view = `<a href="${escape(record.path)}">${escape(siteT(M06_SITE_KEY.FILINGS_VIEW))}</a>`;

            return [
                "<tr>",
                `<td>${escape(filed?.value ?? "")}</td>`,
                `<td>${escape(siteT(M06_SITE_KEY.SUBJECT_OWNERSHIP))}</td>`,
                `<td>${escape(siteT(record.statusKey))}</td>`,
                `<td>${view}</td>`,
                "</tr>",
            ].join("");
        })
        .join("");

    return fillMarkers(localizeHtml(filingsArchivePage), { FIL_ROWS: rows, FIL_UPDATED: updatedLine() });
};

const staged = (
    path: string,
    stage: number,
    title: string,
    description: string,
    html: () => string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!isM06StageOpen(stage)) return notFoundMetadata();

        return requireHttps(context) ?? { title, description, html: html() };
    },
});

const recordPages = (): DynamicWebsitePageDefinition[] =>
    buildM06Records(false).map((record) =>
        staged(record.path, record.stage, record.title, "Particulars as filed.", () => {
            const current = buildM06Records(isM06ShellStruckOff()).find((entry) => entry.path === record.path);

            return renderRecord(current ?? record);
        }),
    );

@RegisterWebsite
export class PortCalderRegistryWebsite extends Website {
    SiteName = "Port Calder Companies Registry";
    Host = M06_REGISTRY_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m06", [
        {
            path: "/",
            metadata: (context: PageContext): PageMetadata =>
                requireHttps(context) ?? {
                    title: "Port Calder Companies Registry",
                    description: "Statutory register of companies and officers.",
                    html: renderHome(),
                },
        },
        staged(
            M06_FILINGS_ARCHIVE_PATH,
            M06_STAGE.archive,
            "Filing archive",
            "Superseded filings.",
            renderFilings,
        ),
        ...recordPages(),
    ]);
}
