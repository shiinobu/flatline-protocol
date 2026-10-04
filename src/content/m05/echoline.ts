import { M05_HOSPITAL_MAIL_DOMAIN, M05_SNAPSHOT_2025, M05_TEAM_PATH } from "./network.js";

export interface StaffRow {
    readonly name: string;
    readonly roleKey: "sysadmin" | "contractor" | "servicedesk" | "network";
    readonly account: string;
}

const row = (name: string, roleKey: StaffRow["roleKey"], account: string): StaffRow => ({
    name,
    roleKey,
    account: `${account}@${M05_HOSPITAL_MAIL_DOMAIN}`,
});

export const M05_STAFF_2025: readonly StaffRow[] = [
    row("Greta de Souza", "sysadmin", "g.desouza"),
    row("Gareth Lim", "contractor", "g.lim"),
    row("Tara Nair", "servicedesk", "t.nair"),
    row("Ruben Wong", "network", "r.wong"),
];

export const M05_LIVE_STAFF: readonly StaffRow[] = [
    row("Tara Nair", "servicedesk", "t.nair"),
    row("Ruben Wong", "network", "r.wong"),
];

export const M05_ECHOLINE_CAPTURE = {
    path: "/s/8fq2/",
    date: M05_SNAPSHOT_2025,
    page: `${M05_HOSPITAL_MAIL_DOMAIN}${M05_TEAM_PATH}`,
    staff: M05_STAFF_2025,
} as const;
