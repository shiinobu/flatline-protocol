import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    M06_FILING_2019_PATH,
    M06_FILING_2024_PATH,
    M06_FILINGS_ARCHIVE_PATH,
    M06_REGISTRY_DOMAIN,
    M06_REGISTRY_UPDATED,
} from "../../../content/m06/network.js";
import {
    M06_FILING_PATHS,
    buildM06Records,
    type RecordField,
    type RecordLink,
    type RegistryRecord,
} from "../../../content/m06/records.js";
import { M06_FILING_2019_HEX, M06_FILING_2024_HEX } from "../../../content/m06/sealed.js";
import { M06_STAGE, isM06ShellStruckOff, isM06StageOpen } from "../../../context/m06/progress.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { fillDataMarker, fillMarkers, localizeHtml } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";

import filingsArchivePage from "./filings-archive.html";
import registryHeader from "./header.html";
import homePage from "./home.html";
import recordPage from "./record.html";
import registryStyle from "./style.html";

interface FilingSeal {
    readonly hex: string;
    readonly hintKey: string;
}

const FILING_SEALS: Readonly<Record<string, FilingSeal>> = {
    [M06_FILING_2019_PATH]: { hex: M06_FILING_2019_HEX, hintKey: M06_SITE_KEY.SEAL_HINT_2019 },
    [M06_FILING_2024_PATH]: { hex: M06_FILING_2024_HEX, hintKey: M06_SITE_KEY.SEAL_HINT_2024 },
};

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
        `<h2 class="section">${escape(siteT(record.tableCaptionKey))}</h2>`,
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

const openLinksOf = (record: RegistryRecord): readonly RecordLink[] =>
    record.links.filter((link) => linkOpen(link.path));

const renderLinks = (links: readonly RecordLink[]): string => {
    if (links.length === 0) return "";

    const items = links
        .map((link) => `<li><a href="${escape(link.path)}">${escape(link.label)}</a></li>`)
        .join("");

    return [
        `<h2 class="section">${escape(siteT(M06_SITE_KEY.SECTION_LINKS))}</h2>`,
        `<ul class="links">${items}</ul>`,
    ].join("");
};

const renderPlate = (record: RegistryRecord): string =>
    record.number === ""
        ? ""
        : `<div class="plate"><span>${escape(siteT(M06_SITE_KEY.LABEL_NUMBER))}</span><b>${escape(record.number)}</b></div>`;

const renderSeal = (record: RegistryRecord): string => {
    const seal = FILING_SEALS[record.path];
    if (seal === undefined) return "";

    return [
        `<h2 class="section">${escape(siteT(M06_SITE_KEY.SECTION_SEALED))}</h2>`,
        `<pre class="seal" tabindex="0">${escape(seal.hex)}</pre>`,
        `<p class="note">${escape(siteT(seal.hintKey))}</p>`,
    ].join("");
};

const updatedLine = (): string =>
    escape(siteT(M06_SITE_KEY.REGISTRY_UPDATED).replace("{{date}}", M06_REGISTRY_UPDATED));

const renderFooter = (): string =>
    `<footer>${escape(siteT(M06_SITE_KEY.REGISTRY_FOOTER))}<div class="updated">${updatedLine()}</div></footer>`;

const withChrome = (html: string, values: Readonly<Record<string, string>>): string =>
    fillMarkers(localizeHtml(html), {
        REG_STYLE: registryStyle,
        REG_HEADER: localizeHtml(registryHeader),
        REG_FOOTER: renderFooter(),
        ...values,
    });

const renderRecord = (record: RegistryRecord): string => {
    const links = openLinksOf(record);

    return withChrome(recordPage, {
        REC_KIND: escape(siteT(SUBTITLE_KEYS[record.kind])),
        REC_TITLE: escape(record.title),
        REC_FLAG: FLAGGED_STATUS_KEYS.includes(record.statusKey) ? " flag" : "",
        REC_STATUS: escape(siteT(record.statusKey)),
        REC_PLATE: renderPlate(record),
        REC_COLS: links.length > 0 ? " has-side" : "",
        REC_FIELDS: renderFields(record.fields),
        REC_SEAL: renderSeal(record),
        REC_TABLE: renderTable(record),
        REC_NOTES: renderNotes(record.noteKeys, record.noteVars),
        REC_LINKS: renderLinks(links),
    });
};

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
    fillDataMarker(
        fillDataMarker(withChrome(homePage, {}), "REG_DATA", JSON.stringify(searchPayload())),
        "REG_TEXT",
        JSON.stringify({ count: siteT(M06_SITE_KEY.SEARCH_COUNT) }),
    );

const renderFilings = (): string => {
    const rows = buildM06Records(isM06ShellStruckOff())
        .filter((record) => M06_FILING_PATHS.includes(record.path))
        .map((record) => {
            const filed = record.fields.find((entry) => entry.labelKey === M06_SITE_KEY.LABEL_FILED);
            const view = `<a href="${escape(record.path)}">${escape(siteT(M06_SITE_KEY.FILINGS_VIEW))}</a>`;

            return [
                "<tr>",
                `<td class="num">${escape(filed?.value ?? "")}</td>`,
                `<td>${escape(siteT(M06_SITE_KEY.SUBJECT_OWNERSHIP))}</td>`,
                `<td>${escape(siteT(record.statusKey))}</td>`,
                `<td>${view}</td>`,
                "</tr>",
            ].join("");
        })
        .join("");

    return withChrome(filingsArchivePage, { FIL_ROWS: rows });
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
