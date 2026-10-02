import type { FixtureEntry, FixtureRef } from "../../core/types.js";

import { M07_HONEYCHECK_DOMAIN, M07_HONEYCHECK_IP } from "./honeycheck.js";
import {
    M07_ASHVECTOR_IP,
    M07_C2_IP,
    M07_DEAD_BOX_PASSWORD,
    M07_HTTPS_PORT,
    M07_HTTP_PORT,
    M07_NULLCROWN_IP,
} from "./network.js";
import {
    M07_ASHVECTOR_NMAP_RESULT,
    M07_C2_NMAP_RESULT,
    M07_C2_NMAP_RESULT_OPEN,
    M07_NULLCROWN_NMAP_RESULT,
} from "./scan.js";

const HONEYCHECK_NMAP = [
    { port: M07_HTTP_PORT, status: "CLOSE" as const, service: "http" },
    { port: M07_HTTPS_PORT, status: "OPEN" as const, service: "https" },
];

export const buildM07Fixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M07_HONEYCHECK_DOMAIN, data: M07_HONEYCHECK_IP },
    { command: "nmap", input: M07_HONEYCHECK_DOMAIN, data: HONEYCHECK_NMAP },
    { command: "nmap", input: M07_HONEYCHECK_IP, data: HONEYCHECK_NMAP },
    { command: "nmap", input: M07_C2_IP, data: M07_C2_NMAP_RESULT },
    { command: "nmap", input: M07_NULLCROWN_IP, data: M07_NULLCROWN_NMAP_RESULT },
    { command: "nmap", input: M07_ASHVECTOR_IP, data: M07_ASHVECTOR_NMAP_RESULT },
    {
        command: "ssh",
        input: { host: M07_NULLCROWN_IP, key: M07_DEAD_BOX_PASSWORD },
        data: { ip: M07_NULLCROWN_IP, status: "OPEN" },
    },
    {
        command: "ssh",
        input: { host: M07_ASHVECTOR_IP, key: M07_DEAD_BOX_PASSWORD },
        data: { ip: M07_ASHVECTOR_IP, status: "OPEN" },
    },
];

export const buildM07CommandHostOpenFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M07_C2_IP, data: M07_C2_NMAP_RESULT_OPEN },
];

export const M07_STALE_FIXTURES: readonly FixtureRef[] = [
    { command: "whois", input: M07_C2_IP },
    { command: "geoip", input: M07_C2_IP },
];
