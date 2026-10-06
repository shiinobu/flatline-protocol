import { M05_ECHOLINE_CHANGE_CAPTURE_REF, M05_LIVE_STAFF, type StaffRow } from "../../../content/m05/echoline.js";
import {
    M05_ACCOUNT_DISABLED_DATE,
    M05_BOARD_THREADS,
    M05_HOME_CARDS,
    M05_HOSPITAL_HOME_URL,
    M05_HOSPITAL_NAV,
    M05_CAREERS_URL,
    M05_JOBS,
    M05_NEWS_POSTS,
    M05_NEWS_URL,
    M05_OUTAGE_DATE,
    M05_PATIENT_URL,
    M05_SEARCH_ENTRIES,
    M05_STAFF_ROLE_KEYS,
    M05_STATUS_COMPONENTS,
    M05_STATUS_INCIDENTS,
    M05_STATUS_URL,
    M05_TEAM_URL,
    M05_VENDOR_RETIRED_DATE,
    M05_WEBMAIL_URL,
    type JobPosting,
    type SearchEntry,
} from "../../../content/m05/hospital.js";
import {
    M05_CHANGE_ID,
    M05_ECHOLINE_DOMAIN,
    M05_POLICY_ID,
    M05_REMOTE_DOMAIN,
    M05_TEAM_PATH,
    M05_TEAM_UPDATED,
} from "../../../content/m05/network.js";
import { M05_FORMAT_HEX, M05_HANDOVER_HEX } from "../../../content/m05/sealed.js";
import { siteT } from "../../../context/global/site-strings.js";
import { isM05TeamOpen } from "../../../context/m05/progress.js";
import { M05_HS_KEY } from "../../../i18n/m05/hospital.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { escapeHtml, fillDataMarker, fillMarkers, localizeHtml } from "../../global/localize.js";

import careersPage from "./careers.html";
import changePage from "./change.html";
import frame from "./frame.html";
import homePage from "./home.html";
import newsPage from "./news.html";
import noticePage from "./notice.html";
import policyPage from "./policy.html";
import statusPage from "./status.html";
import teamPage from "./team.html";
import webmailPage from "./webmail.html";

const t = (key: string, vars?: Record<string, string | number>): string => escapeHtml(siteT(key, vars));

const renderNav = (activeHref: string): string =>
    [
        `<a${activeHref === M05_HOSPITAL_HOME_URL ? ' class="on" aria-current="page"' : ""} href="${escapeHtml(M05_HOSPITAL_HOME_URL)}">${t(M05_HS_KEY.FR_NAV_HOME)}</a>`,
        ...M05_HOSPITAL_NAV.map(
            (link) =>
                `<a${link.href === activeHref ? ' class="on" aria-current="page"' : ""} href="${escapeHtml(link.href)}">${t(link.labelKey)}</a>`,
        ),
    ].join("");

const renderFooterLinks = (): string =>
    isM05TeamOpen()
        ? `<a href="${escapeHtml(`${M05_HOSPITAL_HOME_URL.replace(/\/$/, "")}${M05_TEAM_PATH}`)}">${t(M05_HS_KEY.NAV_IT)}</a>`
        : "";

const searchItem = (entry: SearchEntry): string =>
    [
        `<li data-title="${t(entry.titleKey, entry.id ? { id: entry.id } : undefined)}"`,
        ` data-desc="${t(entry.descKey)}"`,
        ` data-href="${escapeHtml(entry.href)}"`,
        ` data-kw="${escapeHtml(entry.keywords.join("|"))}"`,
        ` data-exact="${entry.exact ? "1" : "0"}"></li>`,
    ].join("");

const renderSearchData = (): string =>
    M05_SEARCH_ENTRIES.filter((entry) => !entry.needsTeamOpen || isM05TeamOpen())
        .map(searchItem)
        .join("");

const wrap = (title: string, activeHref: string, main: string): string => {
    const nav = renderNav(activeHref);

    return fillMarkers(localizeHtml(frame), {
        TITLE: escapeHtml(title),
        NAV: nav,
        NAV_MOBILE: nav,
        SEARCH_DATA: renderSearchData(),
        MAIN: main,
        FOOTER_LINKS: renderFooterLinks(),
    });
};

const renderCards = (): string =>
    M05_HOME_CARDS.map(
        (card) =>
            `<a class="card" href="${escapeHtml(card.href)}"><h3>${t(card.titleKey)}</h3><p>${t(card.bodyKey)}</p></a>`,
    ).join("");

export const renderHome = (): string =>
    wrap("PacificCare Health", M05_HOSPITAL_HOME_URL, fillMarkers(localizeHtml(homePage), { CARDS: renderCards() }));

const staffRow = (entry: StaffRow): string =>
    `<tr><td>${escapeHtml(entry.name)}</td><td>${t(M05_STAFF_ROLE_KEYS[entry.roleKey])}</td><td class="mono">${escapeHtml(entry.account)}</td></tr>`;

const linkHost = (text: string, host: string): string =>
    escapeHtml(text).replace(host, `<a href="https://${host}/">${host}</a>`);

const boardLine = (speaker: string, textKey: string): string =>
    `<p class="line"><b>${escapeHtml(speaker)}</b> ${t(textKey)}</p>`;

const renderBoard = (): string =>
    M05_BOARD_THREADS.map((thread) =>
        [
            '<article class="post">',
            `<h3>${t(thread.titleKey)}</h3>`,
            `<time datetime="${thread.date}">${thread.date}</time>`,
            thread.lines.map((line) => boardLine(line.speaker, line.textKey)).join(""),
            "</article>",
        ].join(""),
    ).join("");

export const renderTeam = (): string =>
    wrap(
        "Information Technology — team",
        M05_HOSPITAL_HOME_URL,
        fillMarkers(localizeHtml(teamPage), {
            ROWS: M05_LIVE_STAFF.map(staffRow).join(""),
            HIRING: `${t(M05_HS_KEY.TEAM_HIRING)} — <a href="${M05_CAREERS_URL}">${t(M05_HS_KEY.TEAM_HIRING_LINK)}</a>`,
            REMOTE: linkHost(siteT(M05_SITE_KEY.EL_REMOTE_NOTE, { host: M05_REMOTE_DOMAIN }), M05_REMOTE_DOMAIN),
            UPDATED: t(M05_HS_KEY.TEAM_UPDATED, { date: M05_TEAM_UPDATED }),
            BOARD: renderBoard(),
        }),
    );

const renderPosts = (): string =>
    M05_NEWS_POSTS.map(
        (post) =>
            `<article class="post"><h3>${t(post.titleKey)}</h3><time datetime="${post.date}">${post.date}</time><p>${t(post.bodyKey)}</p></article>`,
    ).join("");

export const renderNews = (): string =>
    wrap(
        "PacificCare Newsroom",
        M05_NEWS_URL,
        fillMarkers(localizeHtml(newsPage), { POSTS: renderPosts() }),
    );

const renderJob = (job: JobPosting): string =>
    [
        '<article class="post">',
        `<h3>${t(job.titleKey)}</h3>`,
        `<p class="meta">${t(job.metaKey, { id: job.id, posted: job.posted, closing: job.closing ?? "" })}</p>`,
        `<p>${t(job.summaryKey)}</p>`,
        job.noteKey ? `<p class="note">${t(job.noteKey)}</p>` : "",
        `<ul class="req">${job.requirementKeys.map((key) => `<li>${t(key)}</li>`).join("")}</ul>`,
        "</article>",
    ].join("");

export const renderCareers = (): string =>
    wrap(
        "PacificCare Careers",
        M05_CAREERS_URL,
        fillMarkers(localizeHtml(careersPage), { JOBS: M05_JOBS.map(renderJob).join("") }),
    );

const renderComponents = (): string =>
    M05_STATUS_COMPONENTS.map((component) =>
        component.closedSince === null
            ? `<tr><td>${t(component.nameKey)}</td><td class="ok">${t(M05_HS_KEY.STATUS_OPERATIONAL)}</td></tr>`
            : `<tr><td>${t(component.nameKey)}</td><td class="closed">${t(M05_HS_KEY.STATUS_CLOSED, { date: component.closedSince })}</td></tr>`,
    ).join("");

const renderIncidents = (): string =>
    M05_STATUS_INCIDENTS.map(
        (incident) =>
            `<article class="post"><h3>${t(incident.titleKey)}</h3><time>${escapeHtml(incident.at)}</time><p>${t(incident.bodyKey)}</p></article>`,
    ).join("");

export const renderStatus = (): string =>
    wrap(
        "PacificCare Service Status",
        M05_STATUS_URL,
        fillMarkers(localizeHtml(statusPage), { COMPONENTS: renderComponents(), INCIDENTS: renderIncidents() }),
    );

const notice = (heading: string, body: string, extra: string): string =>
    fillMarkers(localizeHtml(noticePage), { HEADING: heading, BODY: body, EXTRA: extra });

export const renderPatient = (): string =>
    wrap(
        "PacificCare Patient Portal",
        M05_PATIENT_URL,
        notice(
            t(M05_HS_KEY.PATIENT_HEADING),
            t(M05_HS_KEY.PATIENT_BODY, { date: M05_OUTAGE_DATE }),
            `<p class="note">${t(M05_HS_KEY.PATIENT_PHONE)}</p>`,
        ),
    );

export const renderGateway = (): string =>
    wrap(
        "PacificCare Vendor Remote Support Gateway",
        "",
        notice(
            t(M05_HS_KEY.GATEWAY_TITLE),
            t(M05_HS_KEY.GATEWAY_BODY, { date: M05_VENDOR_RETIRED_DATE }),
            `<p class="note">${linkHost(siteT(M05_HS_KEY.GATEWAY_STAFF, { host: M05_REMOTE_DOMAIN }), M05_REMOTE_DOMAIN)}</p>`,
        ),
    );

const mailText = (): string =>
    JSON.stringify({
        failed: siteT(M05_HS_KEY.MAIL_FAILED),
        disabled: siteT(M05_HS_KEY.MAIL_DISABLED, { date: M05_ACCOUNT_DISABLED_DATE }),
    });

export const renderWebmail = (): string =>
    wrap(
        "PacificCare Webmail",
        M05_WEBMAIL_URL,
        fillDataMarker(localizeHtml(webmailPage), "MAIL_TEXT", mailText()),
    );

const recordField = (label: string, value: string): string => `<dt>${label}</dt><dd>${value}</dd>`;

const renderChangeFields = (): string =>
    [
        recordField(t(M05_HS_KEY.CHG_TYPE_L), t(M05_HS_KEY.CHG_TYPE_V)),
        recordField(t(M05_HS_KEY.CHG_STATUS_L), t(M05_HS_KEY.CHG_STATUS_V)),
        recordField(t(M05_HS_KEY.CHG_REASON_L), t(M05_HS_KEY.CHG_REASON_V)),
        recordField(t(M05_HS_KEY.CHG_REVIEW_L), t(M05_HS_KEY.CHG_REVIEW_V)),
        recordField(t(M05_HS_KEY.CHG_ROSTER_L), t(M05_HS_KEY.CHG_ROSTER_V)),
        recordField(
            t(M05_HS_KEY.CHG_SOURCE_L),
            `<a href="https://${M05_ECHOLINE_DOMAIN}/">${t(M05_HS_KEY.CHG_SOURCE_V)}</a>`,
        ),
        recordField(t(M05_HS_KEY.CHG_CAPTURE_L), escapeHtml(M05_ECHOLINE_CHANGE_CAPTURE_REF)),
    ].join("");

export const renderChange = (): string =>
    wrap(
        siteT(M05_HS_KEY.CHG_HEADING, { id: M05_CHANGE_ID }),
        "",
        fillMarkers(localizeHtml(changePage), {
            BACK_URL: escapeHtml(M05_TEAM_URL),
            HEADING: t(M05_HS_KEY.CHG_HEADING, { id: M05_CHANGE_ID }),
            FIELDS: renderChangeFields(),
            HEX: M05_HANDOVER_HEX,
        }),
    );

export const renderPolicy = (): string =>
    wrap(
        siteT(M05_HS_KEY.POL_HEADING, { id: M05_POLICY_ID }),
        "",
        fillMarkers(localizeHtml(policyPage), {
            BACK_URL: escapeHtml(M05_TEAM_URL),
            HEADING: t(M05_HS_KEY.POL_HEADING, { id: M05_POLICY_ID }),
            HEX: M05_FORMAT_HEX,
        }),
    );
