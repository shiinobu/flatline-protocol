import { M05_HOSPITAL_MAIL_DOMAIN, M05_TEAM_PATH } from "./network.js";

export type StaffRoleKey =
    | "sysadmin"
    | "contractor"
    | "servicedesk"
    | "network"
    | "desktop"
    | "liaison"
    | "infraEngineer"
    | "clinicalAnalyst"
    | "sdAnalyst"
    | "infraAnalyst"
    | "dbSupport"
    | "iam"
    | "endpoint"
    | "asset"
    | "support"
    | "ops"
    | "security"
    | "reliability"
    | "appSupport"
    | "monitoring"
    | "dbOps"
    | "shared";

export interface StaffRow {
    readonly name: string;
    readonly roleKey: StaffRoleKey;
    readonly account: string;
}

const row = (name: string, roleKey: StaffRoleKey, account: string): StaffRow => ({
    name,
    roleKey,
    account: `${account}@${M05_HOSPITAL_MAIL_DOMAIN}`,
});

const ROXANNE = row("Roxanne Anindita Natnaree", "sysadmin", "rnatnaree");
const GARETH = row("Gideon Bayu Teoh", "contractor", "gteoh");
const TARA = row("Valerie Kirana Dizon", "servicedesk", "valerie.dizon");
const RUBEN = row("Rafael Surya Bautista", "network", "rafael.bautista");
const DANIEL = row("Dorian Aditya Hoang", "desktop", "hoang.dorian");
const HELENA = row("Seraphina Laksmi Pangestu", "liaison", "spangestu");
const VICTOR = row("Caspian Danendra Yeoh", "infraEngineer", "c.yeoh");
const PRIYA = row("Delphine Prabha Wattanakul", "clinicalAnalyst", "d.wattanakul");
const SAMIR = row("Sebastian Indra Siregar", "sdAnalyst", "sebastians");
const ALINA = row("Isadora Cahya Nguyen", "infraAnalyst", "nguyen.isadora");
const MINH = row("Matteo Candra Dang", "dbSupport", "matteodang");
const JOSHUA = row("Jasper Dharma Aquino", "iam", "jaquino");
const CHEN = row("Cassian Wira Nasution", "endpoint", "cassian.n");
const BIANCA = row("Aurelia Padma Sutedja", "asset", "aurelia.s");
const MARCUS = row("Maxwell Satria Mercado", "endpoint", "mercado.maxwell");
const NADIA = row("Zara Indira Abdullah", "support", "zaraabdullah");
const MEI = row("Celestine Mayang Ong", "ops", "celestine.ong");
const OMAR = row("Orion Bima Ismail", "security", "orion.ismail");
const NOOR = row("Ophelia Kinanti Salleh", "reliability", "osalleh");
const SITI = row("Natalia Sari Dumlao", "appSupport", "n.dumlao");
const LEON = row("Lucian Pranaja Bui", "monitoring", "lucianbui");
const CAMILLE = row("Juliette Anjani Villanueva", "asset", "jvillanueva");
const EVELYN = row("Evangeline Chandra Phan", "dbOps", "evangelinep");
const FARID = row("Felix Jayendra Ramasamy", "sdAnalyst", "f.ramasamy");

export const M05_ECHOLINE_SHARED_MAILBOXES: readonly StaffRow[] = [
    row("Service Desk", "shared", "servicedesk"),
    row("IT Operations", "shared", "it.ops"),
];

export const M05_LIVE_STAFF: readonly StaffRow[] = [
    TARA,
    RUBEN,
    PRIYA,
    MARCUS,
    ALINA,
    JOSHUA,
    MEI,
    NOOR,
    SITI,
    LEON,
    CAMILLE,
    OMAR,
    EVELYN,
    FARID,
];

export interface EcholineCapture {
    readonly path: string;
    readonly date: string;
    readonly lastUpdated: string | null;
    readonly staff: readonly StaffRow[];
}

export const M05_ECHOLINE_CAPTURES: readonly EcholineCapture[] = [
    {
        path: "/s/1d7k/",
        date: "2024-05-14",
        lastUpdated: null,
        staff: [ROXANNE, TARA, RUBEN, DANIEL, HELENA, VICTOR],
    },
    {
        path: "/s/5mw3/",
        date: "2024-10-18",
        lastUpdated: "2024-06-03",
        staff: [ROXANNE, TARA, RUBEN, DANIEL, HELENA, VICTOR, PRIYA, SAMIR],
    },
    {
        path: "/s/9pt6/",
        date: "2025-03-12",
        lastUpdated: "2024-11-04",
        staff: [ROXANNE, TARA, RUBEN, DANIEL, PRIYA, SAMIR, ALINA, MINH],
    },
    {
        path: "/s/3zx8/",
        date: "2025-07-29",
        lastUpdated: "2025-04-07",
        staff: [ROXANNE, TARA, RUBEN, PRIYA, SAMIR, ALINA, MINH, JOSHUA, CHEN],
    },
    {
        path: "/s/8fq2/",
        date: "2025-11-03",
        lastUpdated: "2025-11-03",
        staff: [ROXANNE, GARETH, TARA, RUBEN, PRIYA, ALINA, JOSHUA, CHEN, BIANCA],
    },
    {
        path: "/s/6rn4/",
        date: "2026-01-22",
        lastUpdated: "2025-12-01",
        staff: [ROXANNE, GARETH, TARA, RUBEN, PRIYA, ALINA, JOSHUA, CHEN, BIANCA, MARCUS, NADIA],
    },
    {
        path: "/s/2vb7/",
        date: "2026-03-18",
        lastUpdated: "2026-02-02",
        staff: [ROXANNE, GARETH, TARA, RUBEN, PRIYA, ALINA, JOSHUA, CHEN, BIANCA, MARCUS, NADIA, MEI, OMAR],
    },
    {
        path: "/s/7ha5/",
        date: "2026-06-30",
        lastUpdated: "2026-04-06",
        staff: [ROXANNE, GARETH, TARA, RUBEN, PRIYA, ALINA, JOSHUA, BIANCA, MARCUS, NADIA, MEI, OMAR, NOOR, SITI],
    },
    {
        path: "/s/4ec9/",
        date: "2026-08-18",
        lastUpdated: "2026-08-17",
        staff: [
            TARA,
            RUBEN,
            PRIYA,
            ALINA,
            JOSHUA,
            BIANCA,
            MARCUS,
            NADIA,
            MEI,
            OMAR,
            NOOR,
            SITI,
            LEON,
            CAMILLE,
            EVELYN,
            FARID,
        ],
    },
];

export const M05_ECHOLINE_LATE_PATH = "/s/4ec9/";
export const M05_ECHOLINE_SUBJECT = `${M05_HOSPITAL_MAIL_DOMAIN}${M05_TEAM_PATH}`;
export const M05_ECHOLINE_CHANGE_CAPTURE_REF = "8fq2";

export const m05CaptureRef = (path: string): string => path.replace(/^\/s\//, "").replace(/\/$/, "");

export interface CaptureRow {
    readonly entry: StaffRow;
    readonly status: "listed" | "joined";
    readonly firstCaptured: string;
}

export interface CaptureLeftRow {
    readonly entry: StaffRow;
    readonly lastCaptured: string;
}

export interface CaptureDelta {
    readonly added: number;
    readonly removed: number;
}

export interface CaptureView {
    readonly capture: EcholineCapture;
    readonly position: number;
    readonly total: number;
    readonly previous: EcholineCapture | null;
    readonly next: EcholineCapture | null;
    readonly rows: readonly CaptureRow[];
    readonly left: readonly CaptureLeftRow[];
    readonly isLatest: boolean;
}

const hasAccount = (capture: EcholineCapture, account: string): boolean =>
    capture.staff.some((entry) => entry.account === account);

const firstCaptureDate = (account: string, upToIndex: number): string =>
    (
        M05_ECHOLINE_CAPTURES.slice(0, upToIndex + 1).find((capture) => hasAccount(capture, account)) ??
        M05_ECHOLINE_CAPTURES[upToIndex]
    ).date;

const lastCaptureDate = (account: string, beforeIndex: number): string =>
    (
        [...M05_ECHOLINE_CAPTURES.slice(0, beforeIndex)].reverse().find((capture) => hasAccount(capture, account)) ??
        M05_ECHOLINE_CAPTURES[Math.max(0, beforeIndex - 1)]
    ).date;

export const m05CaptureDelta = (index: number): CaptureDelta | null => {
    const previous = M05_ECHOLINE_CAPTURES[index - 1];
    if (!previous) return null;

    const current = M05_ECHOLINE_CAPTURES[index];

    return {
        added: current.staff.filter((entry) => !hasAccount(previous, entry.account)).length,
        removed: previous.staff.filter((entry) => !hasAccount(current, entry.account)).length,
    };
};

export const m05CaptureView = (index: number): CaptureView => {
    const capture = M05_ECHOLINE_CAPTURES[index];
    const previous = M05_ECHOLINE_CAPTURES[index - 1] ?? null;

    return {
        capture,
        position: index + 1,
        total: M05_ECHOLINE_CAPTURES.length,
        previous,
        next: M05_ECHOLINE_CAPTURES[index + 1] ?? null,
        rows: capture.staff.map((entry) => ({
            entry,
            status: previous && !hasAccount(previous, entry.account) ? "joined" : "listed",
            firstCaptured: firstCaptureDate(entry.account, index),
        })),
        left: previous
            ? previous.staff
                  .filter((entry) => !hasAccount(capture, entry.account))
                  .map((entry) => ({ entry, lastCaptured: lastCaptureDate(entry.account, index) }))
            : [],
        isLatest: index === M05_ECHOLINE_CAPTURES.length - 1,
    };
};
