import { M05_HOSPITAL_MAIL_DOMAIN, M05_SNAPSHOT_2025, M05_SNAPSHOT_2026 } from "./network.js";

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

export const M05_STAFF_2026: readonly StaffRow[] = [
    row("Tara Nair", "servicedesk", "t.nair"),
    row("Ruben Wong", "network", "r.wong"),
];

export const M05_SNAPSHOTS = [
    { path: "/s/8fq2/", date: M05_SNAPSHOT_2025, staff: M05_STAFF_2025 },
    { path: "/s/8fq7/", date: M05_SNAPSHOT_2026, staff: M05_STAFF_2026 },
] as const;
