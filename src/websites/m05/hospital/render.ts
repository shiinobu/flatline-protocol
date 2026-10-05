import { M05_LIVE_STAFF, type StaffRow } from "../../../content/m05/echoline.js";
import {
    M05_ACCOUNT_DISABLED_DATE,
    M05_HOME_CARDS,
    M05_HOSPITAL_HOME_URL,
    M05_HOSPITAL_NAV,
    M05_CAREERS_URL,
    M05_JOBS,
    M05_NEWS_POSTS,
    M05_NEWS_URL,
    M05_OUTAGE_DATE,
    M05_PATIENT_URL,
    M05_STAFF_ROLE_KEYS,
    M05_STATUS_COMPONENTS,
    M05_STATUS_INCIDENTS,
    M05_STATUS_URL,
    M05_VENDOR_RETIRED_DATE,
    M05_WEBMAIL_URL,
    type JobPosting,
} from "../../../content/m05/hospital.js";
import {
    M05_REMOTE_DOMAIN,
    M05_TEAM_PATH,
    M05_TEAM_UPDATED,
} from "../../../content/m05/network.js";
import { siteT } from "../../../context/global/site-strings.js";
import { isM05TeamOpen } from "../../../context/m05/progress.js";
import { M05_HS_KEY } from "../../../i18n/m05/hospital.js";
import { M05_SITE_KEY } from "../../../i18n/m05/site.js";
import { escapeHtml, fillDataMarker, fillMarkers, localizeHtml } from "../../global/localize.js";

import careersPage from "./careers.html";
import frame from "./frame.html";
import homePage from "./home.html";
import newsPage from "./news.html";
import noticePage from "./notice.html";
import statusPage from "./status.html";
import teamPage from "./team.html";
import webmailPage from "./webmail.html";

const t = (key: string, vars?: Record<string, string | number>): string => escapeHtml(siteT(key, vars));

const renderNav = (activeHref: string): string =>
    M05_HOSPITAL_NAV.map(
        (link) =>
            `<a${link.href === activeHref ? ' class="on"' : ""} href="${escapeHtml(link.href)}">${t(link.labelKey)}</a>`,
    ).join("");

const renderFooterLinks = (): string =>
    isM05TeamOpen()
        ? `<a href="${escapeHtml(`${M05_HOSPITAL_HOME_URL.replace(/\/$/, "")}${M05_TEAM_PATH}`)}">${t(M05_HS_KEY.NAV_IT)}</a>`
        : "";

const wrap = (title: string, activeHref: string, main: string): string =>
    fillMarkers(localizeHtml(frame), {
        TITLE: escapeHtml(title),
        NAV: renderNav(activeHref),
        MAIN: main,
        FOOTER_LINKS: renderFooterLinks(),
    });

const renderCards = (): string =>
    M05_HOME_CARDS.map(
        (card) =>
            `<div class="card"><h3><a href="${escapeHtml(card.href)}">${t(card.titleKey)}</a></h3><p>${t(card.bodyKey)}</p></div>`,
    ).join("");

export const renderHome = (): string =>
    wrap("PacificCare Health", M05_HOSPITAL_HOME_URL, fillMarkers(localizeHtml(homePage), { CARDS: renderCards() }));

const staffRow = (entry: StaffRow): string =>
    `<tr><td>${escapeHtml(entry.name)}</td><td>${t(M05_STAFF_ROLE_KEYS[entry.roleKey])}</td><td class="mono">${escapeHtml(entry.account)}</td></tr>`;

const linkHost = (text: string, host: string): string =>
    escapeHtml(text).replace(host, `<a href="https://${host}/">${host}</a>`);

export const renderTeam = (): string =>
    wrap(
        "Information Technology — team",
        M05_HOSPITAL_HOME_URL,
        fillMarkers(localizeHtml(teamPage), {
            ROWS: M05_LIVE_STAFF.map(staffRow).join(""),
            HIRING: `${t(M05_HS_KEY.TEAM_HIRING)} — <a href="${M05_CAREERS_URL}">${t(M05_HS_KEY.TEAM_HIRING_LINK)}</a>`,
            REMOTE: linkHost(siteT(M05_SITE_KEY.EL_REMOTE_NOTE, { host: M05_REMOTE_DOMAIN }), M05_REMOTE_DOMAIN),
            UPDATED: t(M05_HS_KEY.TEAM_UPDATED, { date: M05_TEAM_UPDATED }),
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
