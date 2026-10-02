import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../../core/types.js";
import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import {
    M05_ECHOLINE_DOMAIN,
    M05_ECHOLINE_IP,
    M05_EDGE_DOMAIN,
    M05_EDGE_IP,
    M05_LEAKINDEX_DOMAIN,
    M05_LEAKINDEX_IP,
} from "./network.js";
import { M05_SITE_NMAP_RESULT } from "./scan.js";
import {
    M05_GARETH_HANDLE,
    M05_GRETA_HANDLE,
} from "./twotter.js";

const lynx = (handle: string, lines: readonly string[]): FixtureEntry => ({
    command: "lynx",
    input: handle,
    data: { socialMedia: [handle], additional: [...lines] },
});

export const buildM05Fixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M05_ECHOLINE_DOMAIN, data: M05_ECHOLINE_IP },
    { command: "nmap", input: M05_ECHOLINE_DOMAIN, data: M05_SITE_NMAP_RESULT },
    { command: "nmap", input: M05_ECHOLINE_IP, data: M05_SITE_NMAP_RESULT },
];

export const buildM05ArchiveLeadFixtures = (): FixtureEntry[] => [
    lynx(M05_GRETA_HANDLE, [
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_1),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_2),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_3),
    ]),
    lynx(M05_GARETH_HANDLE, [
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GARETH_1),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GARETH_2),
    ]),
];

export const buildM05EdgeLeadFixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M05_EDGE_DOMAIN, data: M05_EDGE_IP },
    {
        command: "whois",
        input: M05_EDGE_DOMAIN,
        data: {
            ip: M05_EDGE_IP,
            contact: Localization.t(M05_I18N_KEY.OSINT_WHOIS_EDGE_CONTACT),
            status: true,
        },
    },
];

export const buildM05BreachLookupFixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M05_LEAKINDEX_DOMAIN, data: M05_LEAKINDEX_IP },
    { command: "nmap", input: M05_LEAKINDEX_DOMAIN, data: M05_SITE_NMAP_RESULT },
    { command: "nmap", input: M05_LEAKINDEX_IP, data: M05_SITE_NMAP_RESULT },
];

export const M05_STALE_FIXTURES: readonly FixtureRef[] = [];
