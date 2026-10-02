import { M06_SITE_KEY } from "../../i18n/m06/site.js";
import {
    ARCHITECT_REAL_NAME,
    FINANCE_ANALYST_HANDLE,
    VIVIEN_ORCHID_FULL_NAME,
} from "../global/characters.js";
import { M02_SHELL_COMPANY_NAME, M03_PARENT_ENTITY_NAME, M07_INSURER_NAME } from "../global/entities.js";
import {
    M06_AGENT_DOMAIN,
    M06_AGENT_NAME,
    M06_AGENT_PATH,
    M06_ARCHITECT_LEFT_BOARD,
    M06_ARCHITECT_PATH,
    M06_BRANDT_RESIGNED,
    M06_FILING_2019_PATH,
    M06_FILING_2019_YEAR,
    M06_FILING_2024_PATH,
    M06_FILING_2024_YEAR,
    M06_HALVARD_DISSOLVED,
    M06_HALVARD_PATH,
    M06_HARTLEY_APPOINTED,
    M06_HOLDINGS_INCORPORATED,
    M06_HOLDINGS_PATH,
    M06_INSURER_DOMAIN,
    M06_MUTUAL_PATH,
    M06_NOMINEES_INCORPORATED,
    M06_NOMINEES_PATH,
    M06_ORCHID_PATH,
    M06_REGISTRY_JURISDICTION,
    M06_SHELL_PATH,
    M06_VOSS_PATH,
} from "./network.js";

export type RecordKind = "entity" | "officer" | "filing";

export interface RecordField {
    readonly labelKey: string;
    readonly value: string;
    readonly valueKey?: string;
    readonly suffixKey?: string;
}

export interface RecordLink {
    readonly path: string;
    readonly label: string;
}

export interface RegistryRecord {
    readonly path: string;
    readonly kind: RecordKind;
    readonly stage: number;
    readonly title: string;
    readonly number: string;
    readonly statusKey: string;
    readonly fields: readonly RecordField[];
    readonly tableHeadKeys: readonly string[];
    readonly tableRows: readonly (readonly string[])[];
    readonly tableCaptionKey: string;
    readonly noteKeys: readonly string[];
    readonly noteVars: Readonly<Record<string, string>>;
    readonly links: readonly RecordLink[];
}

export const M06_SKN_FULL_NAME = `${M03_PARENT_ENTITY_NAME} Ltd`;
export const M06_HALVARD_NAME = "Halvard Trust";
export const M06_HOLDINGS_NAME = "Nordhaven Holdings (PC) Ltd";
export const M06_MUTUAL_NAME = `${M07_INSURER_NAME} Ltd`;
export const M06_VOSS_NAME = "Alexander Voss";
export const M06_HARTLEY_NAME = "Imogen Hartley";
export const M06_BRANDT_NAME = "Tomas Brandt";
export const M06_VOSS_APPOINTMENTS = "412";

export const M06_SKN_NUMBER = "PC-114772";
export const M06_AGENT_NUMBER = "PC-079550";
export const M06_SHELL_NUMBER = "PC-132277";
export const M06_HALVARD_NUMBER = "PC-098431";
export const M06_HOLDINGS_NUMBER = "PC-141009";
export const M06_MUTUAL_NUMBER = "PC-061845";

export const M06_ARCHITECT_ACTUARY_PERIOD = "2009-2018";
export const M06_ARCHITECT_CHAIR_PERIOD = "2018-2024";
export const M06_ORCHID_PERIOD = "2019-2024";

const field = (labelKey: string, value: string): RecordField => ({ labelKey, value });
const localized = (labelKey: string, valueKey: string): RecordField => ({ labelKey, value: "", valueKey });

const buildNominees = (): RegistryRecord => ({
    path: M06_NOMINEES_PATH,
    kind: "entity",
    stage: 1,
    title: M06_SKN_FULL_NAME,
    number: M06_SKN_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_ACTIVE,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_SKN_NUMBER),
        field(M06_SITE_KEY.LABEL_INCORPORATED, M06_NOMINEES_INCORPORATED),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        field(M06_SITE_KEY.LABEL_AGENT, `${M06_AGENT_NAME} · ${M06_AGENT_DOMAIN}`),
        localized(M06_SITE_KEY.LABEL_STATUS, M06_SITE_KEY.STATUS_ACTIVE),
        localized(M06_SITE_KEY.LABEL_OWNER, M06_SITE_KEY.VALUE_SEE_FILINGS),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_NAME, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_SINCE],
    tableRows: [
        [M06_VOSS_NAME, M06_SITE_KEY.ROLE_DIRECTOR, M06_NOMINEES_INCORPORATED],
        [M06_HARTLEY_NAME, M06_SITE_KEY.ROLE_DIRECTOR, M06_HARTLEY_APPOINTED],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_OFFICERS,
    noteKeys: [M06_SITE_KEY.NOTE_BRANDT, M06_SITE_KEY.ENTITY_NOTE],
    noteVars: { name: M06_BRANDT_NAME, date: M06_BRANDT_RESIGNED },
    links: [
        { path: M06_VOSS_PATH, label: M06_VOSS_NAME },
        { path: M06_AGENT_PATH, label: M06_AGENT_NAME },
    ],
});

const buildAgent = (shellStatusKey: string): RegistryRecord => ({
    path: M06_AGENT_PATH,
    kind: "entity",
    stage: 1,
    title: M06_AGENT_NAME,
    number: M06_AGENT_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_ACTIVE,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_AGENT_NUMBER),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        localized(M06_SITE_KEY.LABEL_STATUS, M06_SITE_KEY.STATUS_ACTIVE),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_ENTITY, M06_SITE_KEY.COL_NUMBER, M06_SITE_KEY.COL_STATUS],
    tableRows: [
        [M06_SKN_FULL_NAME, M06_SKN_NUMBER, M06_SITE_KEY.STATUS_ACTIVE],
        [M02_SHELL_COMPANY_NAME, M06_SHELL_NUMBER, shellStatusKey],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_CLIENTS,
    noteKeys: [M06_SITE_KEY.NOTE_AGENT_SCOPE],
    noteVars: {},
    links: [
        { path: M06_NOMINEES_PATH, label: M06_SKN_FULL_NAME },
        { path: M06_SHELL_PATH, label: M02_SHELL_COMPANY_NAME },
    ],
});

const buildShell = (statusKey: string, contactKey: string | undefined): RegistryRecord => ({
    path: M06_SHELL_PATH,
    kind: "entity",
    stage: 1,
    title: M02_SHELL_COMPANY_NAME,
    number: M06_SHELL_NUMBER,
    statusKey,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_SHELL_NUMBER),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        field(M06_SITE_KEY.LABEL_AGENT, M06_AGENT_NAME),
        localized(M06_SITE_KEY.LABEL_STATUS, statusKey),
        { labelKey: M06_SITE_KEY.LABEL_CONTACT, value: FINANCE_ANALYST_HANDLE, suffixKey: contactKey },
    ],
    tableHeadKeys: [],
    tableRows: [],
    tableCaptionKey: "",
    noteKeys: [M06_SITE_KEY.NOTE_SHELL],
    noteVars: {},
    links: [{ path: M06_AGENT_PATH, label: M06_AGENT_NAME }],
});

const buildVoss = (): RegistryRecord => ({
    path: M06_VOSS_PATH,
    kind: "officer",
    stage: 1,
    title: M06_VOSS_NAME,
    number: "",
    statusKey: M06_SITE_KEY.STATUS_VERIFIED,
    fields: [
        localized(M06_SITE_KEY.LABEL_CAPACITY, M06_SITE_KEY.CAPACITY_NOMINEE),
        field(M06_SITE_KEY.LABEL_APPOINTMENTS, M06_VOSS_APPOINTMENTS),
        localized(M06_SITE_KEY.LABEL_STATE, M06_SITE_KEY.STATUS_VERIFIED),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_ENTITY, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_SINCE],
    tableRows: [
        [M06_SKN_FULL_NAME, M06_SITE_KEY.ROLE_DIRECTOR, M06_NOMINEES_INCORPORATED],
        [M06_SITE_KEY.VALUE_OTHER_APPOINTMENTS, M06_SITE_KEY.ROLE_DIRECTOR, ""],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_APPOINTMENTS,
    noteKeys: [M06_SITE_KEY.NOTE_VOSS],
    noteVars: {},
    links: [{ path: M06_NOMINEES_PATH, label: M06_SKN_FULL_NAME }],
});

const buildFiling2019 = (): RegistryRecord => ({
    path: M06_FILING_2019_PATH,
    kind: "filing",
    stage: 3,
    title: M06_SKN_FULL_NAME,
    number: M06_SKN_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_VERIFIED,
    fields: [
        field(M06_SITE_KEY.LABEL_FILED, M06_FILING_2019_YEAR),
        localized(M06_SITE_KEY.LABEL_SUBJECT, M06_SITE_KEY.SUBJECT_OWNERSHIP),
        field(M06_SITE_KEY.LABEL_OWNER, M06_HALVARD_NAME),
        localized(M06_SITE_KEY.LABEL_STATE, M06_SITE_KEY.STATUS_VERIFIED),
    ],
    tableHeadKeys: [],
    tableRows: [],
    tableCaptionKey: "",
    noteKeys: [M06_SITE_KEY.NOTE_FILING_2019],
    noteVars: {},
    links: [{ path: M06_HALVARD_PATH, label: M06_HALVARD_NAME }],
});

const buildFiling2024 = (): RegistryRecord => ({
    path: M06_FILING_2024_PATH,
    kind: "filing",
    stage: 3,
    title: M06_SKN_FULL_NAME,
    number: M06_SKN_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_CONFLICTING,
    fields: [
        field(M06_SITE_KEY.LABEL_FILED, M06_FILING_2024_YEAR),
        localized(M06_SITE_KEY.LABEL_SUBJECT, M06_SITE_KEY.SUBJECT_OWNERSHIP),
        localized(M06_SITE_KEY.LABEL_OWNER, M06_SITE_KEY.STATUS_WITHHELD),
        localized(M06_SITE_KEY.LABEL_STATE, M06_SITE_KEY.STATUS_CONFLICTING),
        field(M06_SITE_KEY.LABEL_CROSSREF, `${M06_HOLDINGS_NAME} · ${M06_HOLDINGS_NUMBER}`),
    ],
    tableHeadKeys: [],
    tableRows: [],
    tableCaptionKey: "",
    noteKeys: [M06_SITE_KEY.NOTE_FILING_2024],
    noteVars: {},
    links: [
        { path: M06_HALVARD_PATH, label: M06_HALVARD_NAME },
        { path: M06_HOLDINGS_PATH, label: M06_HOLDINGS_NAME },
    ],
});

const buildHalvard = (): RegistryRecord => ({
    path: M06_HALVARD_PATH,
    kind: "entity",
    stage: 3,
    title: M06_HALVARD_NAME,
    number: M06_HALVARD_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_DISSOLVED,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_HALVARD_NUMBER),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        localized(M06_SITE_KEY.LABEL_STATUS, M06_SITE_KEY.STATUS_DISSOLVED),
        field(M06_SITE_KEY.LABEL_DISSOLVED, M06_HALVARD_DISSOLVED),
    ],
    tableHeadKeys: [],
    tableRows: [],
    tableCaptionKey: "",
    noteKeys: [M06_SITE_KEY.NOTE_HALVARD],
    noteVars: {},
    links: [],
});

const buildHoldings = (): RegistryRecord => ({
    path: M06_HOLDINGS_PATH,
    kind: "entity",
    stage: 4,
    title: M06_HOLDINGS_NAME,
    number: M06_HOLDINGS_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_ACTIVE,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_HOLDINGS_NUMBER),
        field(M06_SITE_KEY.LABEL_INCORPORATED, M06_HOLDINGS_INCORPORATED),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        localized(M06_SITE_KEY.LABEL_STATUS, M06_SITE_KEY.STATUS_ACTIVE),
        field(M06_SITE_KEY.LABEL_SHAREHOLDER, M06_MUTUAL_NAME),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_NAME, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_PERIOD],
    tableRows: [
        [
            ARCHITECT_REAL_NAME,
            M06_SITE_KEY.ROLE_DIRECTOR,
            `${M06_HOLDINGS_INCORPORATED} — ${M06_ARCHITECT_LEFT_BOARD}`,
        ],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_OFFICERS,
    noteKeys: [M06_SITE_KEY.NOTE_HOLDINGS],
    noteVars: {},
    links: [
        { path: M06_MUTUAL_PATH, label: M06_MUTUAL_NAME },
        { path: M06_NOMINEES_PATH, label: M06_SKN_FULL_NAME },
    ],
});

const buildMutual = (): RegistryRecord => ({
    path: M06_MUTUAL_PATH,
    kind: "entity",
    stage: 4,
    title: M06_MUTUAL_NAME,
    number: M06_MUTUAL_NUMBER,
    statusKey: M06_SITE_KEY.STATUS_ACTIVE,
    fields: [
        field(M06_SITE_KEY.LABEL_NUMBER, M06_MUTUAL_NUMBER),
        field(M06_SITE_KEY.LABEL_JURISDICTION, M06_REGISTRY_JURISDICTION),
        localized(M06_SITE_KEY.LABEL_STATUS, M06_SITE_KEY.STATUS_ACTIVE),
        field(M06_SITE_KEY.LABEL_WEBSITE, M06_INSURER_DOMAIN),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_NAME, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_PERIOD],
    tableRows: [
        [VIVIEN_ORCHID_FULL_NAME, M06_SITE_KEY.ROLE_CYBER_RISK, M06_ORCHID_PERIOD],
        [ARCHITECT_REAL_NAME, M06_SITE_KEY.ROLE_CHAIR_RISK, M06_ARCHITECT_CHAIR_PERIOD],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_OFFICERS,
    noteKeys: [M06_SITE_KEY.NOTE_MUTUAL],
    noteVars: {},
    links: [
        { path: M06_ORCHID_PATH, label: VIVIEN_ORCHID_FULL_NAME },
        { path: M06_HOLDINGS_PATH, label: M06_HOLDINGS_NAME },
    ],
});

const buildOrchid = (): RegistryRecord => ({
    path: M06_ORCHID_PATH,
    kind: "officer",
    stage: 4,
    title: VIVIEN_ORCHID_FULL_NAME,
    number: "",
    statusKey: M06_SITE_KEY.STATUS_FORMER,
    fields: [
        localized(M06_SITE_KEY.LABEL_CAPACITY, M06_SITE_KEY.CAPACITY_OFFICER),
        localized(M06_SITE_KEY.LABEL_STATE, M06_SITE_KEY.STATUS_FORMER),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_ENTITY, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_PERIOD],
    tableRows: [[M06_MUTUAL_NAME, M06_SITE_KEY.ROLE_CYBER_RISK, M06_ORCHID_PERIOD]],
    tableCaptionKey: M06_SITE_KEY.CAPTION_APPOINTMENTS,
    noteKeys: [M06_SITE_KEY.NOTE_ORCHID],
    noteVars: {},
    links: [{ path: M06_MUTUAL_PATH, label: M06_MUTUAL_NAME }],
});

const buildArchitect = (): RegistryRecord => ({
    path: M06_ARCHITECT_PATH,
    kind: "officer",
    stage: 5,
    title: ARCHITECT_REAL_NAME,
    number: "",
    statusKey: M06_SITE_KEY.STATUS_FORMER,
    fields: [
        localized(M06_SITE_KEY.LABEL_CAPACITY, M06_SITE_KEY.CAPACITY_OFFICER),
        localized(M06_SITE_KEY.LABEL_STATE, M06_SITE_KEY.STATUS_FORMER),
    ],
    tableHeadKeys: [M06_SITE_KEY.COL_ENTITY, M06_SITE_KEY.COL_ROLE, M06_SITE_KEY.COL_PERIOD],
    tableRows: [
        [M06_MUTUAL_NAME, M06_SITE_KEY.ROLE_ACTUARY, M06_ARCHITECT_ACTUARY_PERIOD],
        [M06_MUTUAL_NAME, M06_SITE_KEY.ROLE_CHAIR_RISK, M06_ARCHITECT_CHAIR_PERIOD],
        [
            M06_HOLDINGS_NAME,
            M06_SITE_KEY.ROLE_DIRECTOR,
            `${M06_HOLDINGS_INCORPORATED} — ${M06_ARCHITECT_LEFT_BOARD}`,
        ],
    ],
    tableCaptionKey: M06_SITE_KEY.CAPTION_APPOINTMENTS,
    noteKeys: [M06_SITE_KEY.NOTE_ARCHITECT],
    noteVars: {},
    links: [
        { path: M06_MUTUAL_PATH, label: M06_MUTUAL_NAME },
        { path: M06_HOLDINGS_PATH, label: M06_HOLDINGS_NAME },
    ],
});

export const buildM06Records = (shellStruckOff: boolean): readonly RegistryRecord[] => {
    const shellStatusKey = shellStruckOff ? M06_SITE_KEY.STATUS_STRUCK_OFF : M06_SITE_KEY.STATUS_ACTIVE;
    const contactKey = shellStruckOff ? M06_SITE_KEY.VALUE_NO_LONGER_LISTED : undefined;

    return [
        buildNominees(),
        buildAgent(shellStatusKey),
        buildShell(shellStatusKey, contactKey),
        buildVoss(),
        buildFiling2019(),
        buildFiling2024(),
        buildHalvard(),
        buildHoldings(),
        buildMutual(),
        buildOrchid(),
        buildArchitect(),
    ];
};

export const M06_FILING_PATHS: readonly string[] = [M06_FILING_2019_PATH, M06_FILING_2024_PATH];
