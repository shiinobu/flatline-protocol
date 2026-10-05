import { M05_PORTAL_ACCOUNTS } from "./portal-data.js";
import { M05_FOOTHOLD_SOURCE_IP } from "./network.js";

const SIGNIN_SEED = 20260927;
const SIGNIN_DAYS = 88;
const DAY_MS = 86400000;
const HQ_ADDRESS = "103.87.62.145";
const HQ_PLACE = "PacificCare HQ (NAT)";
const VENDOR_ADDRESS = "203.0.113.77";
const VENDOR_PLACE = "VendorCare Support (VCS)";
const UNRESOLVED_PLACE = "Unresolved, no PTR";
const STORM_DATE = "2026-07-09";
const STORM_ATTEMPTS = 36;

const SCANNER_ADDRESSES: readonly string[] = [
    "45.83.64.19",
    "185.234.72.5",
    "91.92.251.40",
    "103.145.12.78",
    "78.153.140.9",
    "212.102.33.61",
    "5.188.206.14",
    "193.32.162.88",
    "37.19.200.51",
    "89.248.165.7",
    "146.70.88.23",
    "62.204.41.16",
];

const STORM_ACCOUNTS: readonly string[] = ["rnatnaree", "admin", "administrator", "valerie.dizon", "rafael.bautista"];

const FOOTHOLD_SESSIONS: readonly (readonly [string, number, number])[] = [
    ["2026-08-11", 0, 41],
    ["2026-08-11", 1, 3],
    ["2026-08-12", 2, 17],
    ["2026-08-13", 1, 58],
    ["2026-08-14", 2, 9],
];

export interface PortalSignin {
    readonly id: string;
    readonly t: string;
    readonly a: string;
    readonly s: string;
    readonly g: string;
    readonly ok: boolean;
}

const pad = (value: number): string => String(value).padStart(2, "0");

const dayStamp = (date: Date): string =>
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const seeded = (seed: number): (() => number) => {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let mixed = state;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
};

type Draft = Omit<PortalSignin, "id">;

export const buildPortalSignins = (): readonly PortalSignin[] => {
    const next = seeded(SIGNIN_SEED);
    const rows: Draft[] = [];
    const add = (day: string, hour: number, minute: number, account: string, source: string, place: string, ok: boolean): void => {
        rows.push({ t: `${day} ${pad(hour)}:${pad(minute)}`, a: account, s: source, g: place, ok });
    };

    const start = Date.UTC(2026, 6, 1);
    for (let index = 0; index < SIGNIN_DAYS; index++) {
        const date = new Date(start + index * DAY_MS);
        const day = dayStamp(date);
        const weekday = date.getUTCDay();

        if (weekday > 0 && weekday < 6) {
            for (const account of M05_PORTAL_ACCOUNTS) {
                if (account.svc || day < (account.from ?? "") || day > (account.to ?? "")) continue;
                if (account.a === "rnatnaree" && day === "2026-08-19") continue;
                if (next() > (account.p ?? 0)) continue;

                const home = next() > 0.74;
                add(day, Math.floor(next() * 9), Math.floor(next() * 60), account.a, home ? (account.home ?? HQ_ADDRESS) : HQ_ADDRESS, home ? (account.geo ?? HQ_PLACE) : HQ_PLACE, true);
            }
        }

        if (day <= "2026-08-14") add(day, 1, 50, "svc-vendor", VENDOR_ADDRESS, VENDOR_PLACE, true);
        if (weekday === 0) add(day, 3, 10, "svc-backup", HQ_ADDRESS, HQ_PLACE, true);
    }

    add("2026-08-19", 7, 55, "rnatnaree", HQ_ADDRESS, HQ_PLACE, true);
    add("2026-08-02", 11, 14, "gteoh", "60.54.118.9", "Residential, Petaling Jaya", true);
    add("2026-07-18", 7, 41, "valerie.dizon", "118.201.54.77", "Hotel, Kuala Lumpur", true);

    for (let attempt = 0; attempt < STORM_ATTEMPTS; attempt++) {
        const source = SCANNER_ADDRESSES[Math.floor(next() * SCANNER_ADDRESSES.length)];
        add(STORM_DATE, 3, 20 + Math.floor((attempt * 35) / STORM_ATTEMPTS), STORM_ACCOUNTS[attempt % STORM_ACCOUNTS.length], source, UNRESOLVED_PLACE, false);
    }

    for (const [day, hour, minute] of FOOTHOLD_SESSIONS) {
        add(day, hour, minute, "rnatnaree", M05_FOOTHOLD_SOURCE_IP, UNRESOLVED_PLACE, true);
    }

    rows.sort((left, right) => (left.t < right.t ? -1 : left.t > right.t ? 1 : 0));

    return rows.map((row, index) => ({ id: `s${String(index + 1).padStart(3, "0")}`, ...row }));
};
