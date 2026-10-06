import { M05_HS_KEY } from "../../i18n/m05/hospital.js";
import { M05_SITE_KEY } from "../../i18n/m05/site.js";
import type { StaffRow } from "./echoline.js";
import {
    M05_CAREERS_DOMAIN,
    M05_CHANGE_ID,
    M05_CHANGE_PATH,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_NEWS_DOMAIN,
    M05_PATIENT_DOMAIN,
    M05_POLICY_ID,
    M05_POLICY_PATH,
    M05_REMOTE_DOMAIN,
    M05_STATUS_DOMAIN,
    M05_TEAM_PATH,
    M05_WEBMAIL_DOMAIN,
} from "./network.js";

export const M05_STAFF_ROLE_KEYS: Readonly<Record<StaffRow["roleKey"], string>> = {
    sysadmin: M05_SITE_KEY.EL_ROLE_SYSADMIN,
    contractor: M05_SITE_KEY.EL_ROLE_CONTRACTOR,
    servicedesk: M05_SITE_KEY.EL_ROLE_SERVICEDESK,
    network: M05_SITE_KEY.EL_ROLE_NETWORK,
    desktop: M05_SITE_KEY.EL_ROLE_DESKTOP,
    liaison: M05_SITE_KEY.EL_ROLE_LIAISON,
    infraEngineer: M05_SITE_KEY.EL_ROLE_INFRA_ENGINEER,
    clinicalAnalyst: M05_SITE_KEY.EL_ROLE_CLINICAL_ANALYST,
    sdAnalyst: M05_SITE_KEY.EL_ROLE_SD_ANALYST,
    infraAnalyst: M05_SITE_KEY.EL_ROLE_INFRA_ANALYST,
    dbSupport: M05_SITE_KEY.EL_ROLE_DB_SUPPORT,
    iam: M05_SITE_KEY.EL_ROLE_IAM,
    endpoint: M05_SITE_KEY.EL_ROLE_ENDPOINT,
    asset: M05_SITE_KEY.EL_ROLE_ASSET,
    support: M05_SITE_KEY.EL_ROLE_SUPPORT,
    ops: M05_SITE_KEY.EL_ROLE_OPS,
    security: M05_SITE_KEY.EL_ROLE_SECURITY,
    reliability: M05_SITE_KEY.EL_ROLE_RELIABILITY,
    appSupport: M05_SITE_KEY.EL_ROLE_APPSUPPORT,
    monitoring: M05_SITE_KEY.EL_ROLE_MONITORING,
    dbOps: M05_SITE_KEY.EL_ROLE_DB_OPS,
    shared: M05_SITE_KEY.EL_ROLE_SHARED,
};

export const M05_OUTAGE_DATE = "2026-08-14";
export const M05_VENDOR_RETIRED_DATE = "2026-08-15";
export const M05_ACCOUNT_DISABLED_DATE = "2026-08-19";

export const M05_HOSPITAL_HOME_URL = `https://${M05_HOSPITAL_HOME_DOMAIN}/`;
export const M05_NEWS_URL = `https://${M05_NEWS_DOMAIN}/`;
export const M05_CAREERS_URL = `https://${M05_CAREERS_DOMAIN}/`;
export const M05_STATUS_URL = `https://${M05_STATUS_DOMAIN}/`;
export const M05_PATIENT_URL = `https://${M05_PATIENT_DOMAIN}/`;
export const M05_WEBMAIL_URL = `https://${M05_WEBMAIL_DOMAIN}/`;
export const M05_REMOTE_URL = `https://${M05_REMOTE_DOMAIN}/`;
export const M05_TEAM_URL = `https://${M05_HOSPITAL_HOME_DOMAIN}${M05_TEAM_PATH}`;
export const M05_CHANGE_URL = `https://${M05_HOSPITAL_HOME_DOMAIN}${M05_CHANGE_PATH}`;
export const M05_POLICY_URL = `https://${M05_HOSPITAL_HOME_DOMAIN}${M05_POLICY_PATH}`;

export interface HospitalNavLink {
    readonly labelKey: string;
    readonly href: string;
}

export const M05_HOSPITAL_NAV: readonly HospitalNavLink[] = [
    { labelKey: M05_HS_KEY.NAV_ABOUT, href: `${M05_HOSPITAL_HOME_URL}#about` },
    { labelKey: M05_HS_KEY.NAV_NEWS, href: M05_NEWS_URL },
    { labelKey: M05_HS_KEY.NAV_CAREERS, href: M05_CAREERS_URL },
    { labelKey: M05_HS_KEY.NAV_STATUS, href: M05_STATUS_URL },
    { labelKey: M05_HS_KEY.NAV_PATIENTS, href: M05_PATIENT_URL },
    { labelKey: M05_HS_KEY.NAV_STAFF, href: M05_WEBMAIL_URL },
];

export const M05_HOME_CARDS: readonly { readonly titleKey: string; readonly bodyKey: string; readonly href: string }[] = [
    { titleKey: M05_HS_KEY.NAV_PATIENTS, bodyKey: M05_HS_KEY.CARD_PATIENTS, href: M05_PATIENT_URL },
    { titleKey: M05_HS_KEY.NAV_NEWS, bodyKey: M05_HS_KEY.CARD_NEWS, href: M05_NEWS_URL },
    { titleKey: M05_HS_KEY.NAV_CAREERS, bodyKey: M05_HS_KEY.CARD_CAREERS, href: M05_CAREERS_URL },
    { titleKey: M05_HS_KEY.NAV_STATUS, bodyKey: M05_HS_KEY.CARD_STATUS, href: M05_STATUS_URL },
];

export interface NewsPost {
    readonly date: string;
    readonly titleKey: string;
    readonly bodyKey: string;
}

export const M05_NEWS_POSTS: readonly NewsPost[] = [
    { date: "2026-08-24", titleKey: M05_HS_KEY.NEWS_3_TITLE, bodyKey: M05_HS_KEY.NEWS_3_BODY },
    { date: "2026-08-17", titleKey: M05_HS_KEY.NEWS_2_TITLE, bodyKey: M05_HS_KEY.NEWS_2_BODY },
    { date: "2026-08-14", titleKey: M05_HS_KEY.NEWS_1_TITLE, bodyKey: M05_HS_KEY.NEWS_1_BODY },
];

export interface JobPosting {
    readonly id: string;
    readonly posted: string;
    readonly closing: string | null;
    readonly titleKey: string;
    readonly metaKey: string;
    readonly summaryKey: string;
    readonly noteKey?: string;
    readonly requirementKeys: readonly string[];
}

export const M05_SYSADMIN_JOB: JobPosting = {
    id: "SA-0826",
    posted: "2026-08-26",
    closing: "2026-10-15",
    titleKey: M05_HS_KEY.JOB_SA_TITLE,
    metaKey: M05_HS_KEY.JOB_SA_META,
    summaryKey: M05_HS_KEY.JOB_SA_SUMMARY,
    noteKey: M05_HS_KEY.JOB_SA_NOTE,
    requirementKeys: [M05_HS_KEY.JOB_SA_REQ_1, M05_HS_KEY.JOB_SA_REQ_2, M05_HS_KEY.JOB_SA_REQ_3],
};

export const M05_JOBS: readonly JobPosting[] = [
    M05_SYSADMIN_JOB,
    {
        id: "NC-0826",
        posted: "2026-08-28",
        closing: null,
        titleKey: M05_HS_KEY.JOB_NC_TITLE,
        metaKey: M05_HS_KEY.JOB_NC_META,
        summaryKey: M05_HS_KEY.JOB_NC_SUMMARY,
        requirementKeys: [M05_HS_KEY.JOB_NC_REQ_1, M05_HS_KEY.JOB_NC_REQ_2],
    },
];

export interface StatusComponent {
    readonly nameKey: string;
    readonly closedSince: string | null;
}

export const M05_STATUS_COMPONENTS: readonly StatusComponent[] = [
    { nameKey: M05_HS_KEY.COMP_CLINICAL, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_SCHEDULING, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_IMAGING, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_BILLING, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_REMOTE, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_OT1, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_OT2, closedSince: null },
    { nameKey: M05_HS_KEY.COMP_OT3, closedSince: M05_OUTAGE_DATE },
];

export interface StatusIncident {
    readonly at: string;
    readonly titleKey: string;
    readonly bodyKey: string;
}

export const M05_STATUS_INCIDENTS: readonly StatusIncident[] = [
    { at: "2026-08-17", titleKey: M05_HS_KEY.INCIDENT_3_TITLE, bodyKey: M05_HS_KEY.INCIDENT_3_BODY },
    { at: "2026-08-14 09:48 UTC", titleKey: M05_HS_KEY.INCIDENT_2_TITLE, bodyKey: M05_HS_KEY.INCIDENT_2_BODY },
    { at: "2026-08-14 02:41 UTC", titleKey: M05_HS_KEY.INCIDENT_1_TITLE, bodyKey: M05_HS_KEY.INCIDENT_1_BODY },
];

export interface BoardLine {
    readonly speaker: string;
    readonly textKey: string;
}

export interface BoardThread {
    readonly date: string;
    readonly titleKey: string;
    readonly lines: readonly BoardLine[];
}

const TARA = "Valerie Kirana Dizon";
const RUBEN = "Rafael Surya Bautista";

export const M05_BOARD_THREADS: readonly BoardThread[] = [
    {
        date: "2026-09-02",
        titleKey: M05_HS_KEY.BOARD_A_TITLE,
        lines: [
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_A_1 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_A_2 },
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_A_3 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_A_4 },
        ],
    },
    {
        date: "2026-08-28",
        titleKey: M05_HS_KEY.BOARD_B_TITLE,
        lines: [
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_B_1 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_B_2 },
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_B_3 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_B_4 },
        ],
    },
    {
        date: "2026-08-18",
        titleKey: M05_HS_KEY.BOARD_C_TITLE,
        lines: [
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_C_1 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_C_2 },
        ],
    },
    {
        date: "2026-08-17",
        titleKey: M05_HS_KEY.BOARD_D_TITLE,
        lines: [
            { speaker: TARA, textKey: M05_HS_KEY.BOARD_D_1 },
            { speaker: RUBEN, textKey: M05_HS_KEY.BOARD_D_2 },
        ],
    },
];

export interface SearchEntry {
    readonly id?: string;
    readonly titleKey: string;
    readonly descKey: string;
    readonly href: string;
    readonly keywords: readonly string[];
    readonly exact: boolean;
    readonly needsTeamOpen: boolean;
}

export const M05_SEARCH_ENTRIES: readonly SearchEntry[] = [
    {
        titleKey: M05_HS_KEY.SEARCH_HOME,
        descKey: M05_HS_KEY.HOME_LEAD,
        href: M05_HOSPITAL_HOME_URL,
        keywords: ["pacificcare", "health", "hospital", "home"],
        exact: false,
        needsTeamOpen: false,
    },
    {
        titleKey: M05_HS_KEY.NAV_NEWS,
        descKey: M05_HS_KEY.CARD_NEWS,
        href: M05_NEWS_URL,
        keywords: ["newsroom", "news", "statements", "press", "media"],
        exact: false,
        needsTeamOpen: false,
    },
    {
        titleKey: M05_HS_KEY.NAV_CAREERS,
        descKey: M05_HS_KEY.CARD_CAREERS,
        href: M05_CAREERS_URL,
        keywords: ["careers", "jobs", "vacancy", "vacancies", "systems administrator"],
        exact: false,
        needsTeamOpen: false,
    },
    {
        titleKey: M05_HS_KEY.NAV_STATUS,
        descKey: M05_HS_KEY.CARD_STATUS,
        href: M05_STATUS_URL,
        keywords: ["status", "service status", "incident", "outage"],
        exact: false,
        needsTeamOpen: false,
    },
    {
        titleKey: M05_HS_KEY.NAV_PATIENTS,
        descKey: M05_HS_KEY.CARD_PATIENTS,
        href: M05_PATIENT_URL,
        keywords: ["patients", "patient portal", "appointments", "billing"],
        exact: false,
        needsTeamOpen: false,
    },
    {
        titleKey: M05_HS_KEY.NAV_IT,
        descKey: M05_SITE_KEY.EL_STAFF_INTRO,
        href: M05_TEAM_URL,
        keywords: ["it", "information technology", "team", "staff", "roster"],
        exact: false,
        needsTeamOpen: true,
    },
    {
        id: M05_CHANGE_ID,
        titleKey: M05_HS_KEY.CHG_HEADING,
        descKey: M05_HS_KEY.CHG_DESC,
        href: M05_CHANGE_URL,
        keywords: ["sa-0826", "change record", "change"],
        exact: false,
        needsTeamOpen: true,
    },
    {
        id: M05_POLICY_ID,
        titleKey: M05_HS_KEY.POL_HEADING,
        descKey: M05_HS_KEY.POL_DESC,
        href: M05_POLICY_URL,
        keywords: ["it-dept-77"],
        exact: true,
        needsTeamOpen: true,
    },
];
