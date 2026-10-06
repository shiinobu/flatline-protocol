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

export const M05_LEAK_RECORDS: readonly LeakRecord[] = [
    { id: 1, email: M05_GRETA_WORK_EMAIL, source: "medvendor", year: "2025", hash: M05_GRETA_HASH },
    { id: 2, email: GRETA_PRIVATE_EMAIL, source: "foodforum", year: "2022", hash: M05_PAY_STATION_HASH },
    { id: 3, email: `r.natnaree@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 4, email: `gteoh@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
    { id: 5, email: `valerie.dizon@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PAY_STATION_HASH },
    { id: 6, email: `rafael.bautista@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 7, email: `skrishnan@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
    { id: 8, email: `anastasia.santiago@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PAY_STATION_HASH },
    { id: 9, email: `lchaiyasit@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_LEAD_APRON_HASH },
    { id: 10, email: `kieran.pradipta@${M05_HOSPITAL_MAIL_DOMAIN}`, source: "medvendor", year: "2025", hash: M05_PRINTER_HASH },
];

export const M05_LEAK_HASH_ALGO = "MD5";
export const M05_CORRECT_LEAK_RECORD_ID = 1;
export const M05_LEAK_OPENED_EVENT = "flatline.m05.leakRecordOpened";
