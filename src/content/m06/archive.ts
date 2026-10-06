import { M06_SITE_KEY } from "../../i18n/m06/site.js";
import { FINANCE_ANALYST_HANDLE } from "../global/characters.js";
import { M02_SHELL_COMPANY_NAME } from "../global/entities.js";
import { M06_AGENT_NAME, M06_ARCHIVE_SNAPSHOT } from "./network.js";
import { M06_SHELL_NUMBER, M06_SKN_FULL_NAME, M06_SKN_NUMBER } from "./records.js";

export interface ArchiveClientRow {
    readonly entity: string;
    readonly number: string;
    readonly statusKey: string;
}

export const M06_ARCHIVE_PATH = "/s/3kq8/";
export const M06_ARCHIVE_DATE = M06_ARCHIVE_SNAPSHOT;
export const M06_ARCHIVE_AGENT_NAME = M06_AGENT_NAME;
export const M06_ARCHIVE_CONTACT = FINANCE_ANALYST_HANDLE;

export const M06_ARCHIVE_ROWS: readonly ArchiveClientRow[] = [
    { entity: M06_SKN_FULL_NAME, number: M06_SKN_NUMBER, statusKey: M06_SITE_KEY.STATUS_ACTIVE },
    { entity: M02_SHELL_COMPANY_NAME, number: M06_SHELL_NUMBER, statusKey: M06_SITE_KEY.STATUS_ACTIVE },
];
