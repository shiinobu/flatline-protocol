import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry } from "../../core/types.js";
import { M02_I18N_KEY } from "../../i18n/m02/core.js";

import { M02_ADMIN_PASSWORD, M02_DEV_IP, M02_ROOT_DOMAIN, M02_ROOT_IP } from "./network.js";
import { M02_DEV_NMAP_RESULT, M02_ROOT_NMAP_RESULT } from "./scan.js";

export const buildM02Fixtures = (): FixtureEntry[] => [
    {
        command: "whois",
        input: M02_ROOT_DOMAIN,
        data: { domain: M02_ROOT_DOMAIN, contact: Localization.t(M02_I18N_KEY.OSINT_WHOIS_CONTACT), status: true },
    },
    { command: "nmap", input: M02_ROOT_IP, data: M02_ROOT_NMAP_RESULT },
];

export const buildM02SubdomainFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M02_DEV_IP, data: M02_DEV_NMAP_RESULT },
    {
        command: "ssh",
        input: { host: M02_DEV_IP, key: M02_ADMIN_PASSWORD },
        data: { ip: M02_DEV_IP, status: "OPEN" },
    },
];
