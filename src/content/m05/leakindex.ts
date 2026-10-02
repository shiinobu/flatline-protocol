import {
    M05_GRETA_HASH,
    M05_GRETA_WORK_EMAIL,
    M05_HOSPITAL_MAIL_DOMAIN,
    M05_LEAD_APRON_HASH,
    M05_PAY_STATION_HASH,
    M05_PRINTER_HASH,
} from "./network.js";
import { GRETA_PRIVATE_EMAIL } from "../global/characters.js";

export interface LeakRecord {
    readonly id: number;
    readonly email: string;
    readonly source: "medvendor" | "foodforum";
    readonly year: string;
    readonly hash: string;
}

export const M05_LEAK_SOURCE_YEARS = { medvendor: "2025", foodforum: "2022" } as const;

export const M05_LEAK_RECORDS: readonly LeakRecord[] = [
    { id: 1, email: M05_GRETA_WORK_EMAIL, source: "medvendor", year: "2025", hash: M05_GRETA_HASH },
    { id: 2, email: GRETA_PRIVATE_EMAIL, source: "foodforum", year: "2022", hash: M05_PAY_STATION_HASH },
    { id: 3, email: `gdesouza@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 4, email: `g.lim@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
    { id: 5, email: `t.nair@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PAY_STATION_HASH },
    { id: 6, email: `r.wong@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 7, email: `s.ibrahim@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
    { id: 8, email: `a.pereira@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PAY_STATION_HASH },
    { id: 9, email: `l.chen@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 10, email: `m.santos@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
];

export const M05_LEAK_HASH_ALGO = "MD5";
export const M05_CORRECT_LEAK_RECORD_ID = 1;
export const M05_LEAK_OPENED_EVENT = "flatline.m05.leakRecordOpened";
