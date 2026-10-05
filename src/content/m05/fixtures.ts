import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../../core/types.js";
import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import {
    M05_CAREERS_DOMAIN,
    M05_CAREERS_IP,
    M05_CIPHER_DOMAIN,
    M05_CIPHER_IP,
    M05_ECHOLINE_DOMAIN,
    M05_ECHOLINE_IP,
    M05_GATEWAY_DOMAIN,
    M05_GATEWAY_IP,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_HOSPITAL_HOME_IP,
    M05_LEAKINDEX_DOMAIN,
    M05_LEAKINDEX_IP,
    M05_NEWS_DOMAIN,
    M05_NEWS_IP,
    M05_PATIENT_DOMAIN,
    M05_PATIENT_IP,
    M05_RDC_DOMAIN,
    M05_RDC_IP,
    M05_STATUS_DOMAIN,
    M05_STATUS_IP,
    M05_WEBMAIL_DOMAIN,
    M05_WEBMAIL_IP,
} from "./network.js";
import { M05_SITE_NMAP_RESULT } from "./scan.js";
import {
    M05_GARETH_FULL_NAME,
    M05_GARETH_HANDLE,
    M05_GRETA_FULL_NAME,
    M05_GRETA_HANDLE,
    M05_GRETA_TWOTTER_USERNAME,
} from "./twotter.js";

const lynx = (input: string, handle: string, lines: readonly string[]): FixtureEntry => ({
    command: "lynx",
    input,
    data: { socialMedia: [handle], additional: [...lines] },
});

const site = (domain: string, ip: string): FixtureEntry[] => [
    { command: "nslookup", input: domain, data: ip },
    { command: "nmap", input: domain, data: M05_SITE_NMAP_RESULT },
    { command: "nmap", input: ip, data: M05_SITE_NMAP_RESULT },
];

const HOSPITAL_WEB: readonly (readonly [string, string])[] = [
    [M05_HOSPITAL_HOME_DOMAIN, M05_HOSPITAL_HOME_IP],
    [M05_NEWS_DOMAIN, M05_NEWS_IP],
    [M05_CAREERS_DOMAIN, M05_CAREERS_IP],
    [M05_STATUS_DOMAIN, M05_STATUS_IP],
    [M05_PATIENT_DOMAIN, M05_PATIENT_IP],
    [M05_WEBMAIL_DOMAIN, M05_WEBMAIL_IP],
    [M05_GATEWAY_DOMAIN, M05_GATEWAY_IP],
];

const TOOL_SITES: readonly (readonly [string, string])[] = [
    [M05_ECHOLINE_DOMAIN, M05_ECHOLINE_IP],
    [M05_LEAKINDEX_DOMAIN, M05_LEAKINDEX_IP],
    [M05_RDC_DOMAIN, M05_RDC_IP],
    [M05_CIPHER_DOMAIN, M05_CIPHER_IP],
];

export const buildM05Fixtures = (): FixtureEntry[] => [
    ...[...HOSPITAL_WEB, ...TOOL_SITES].flatMap(([domain, ip]) => site(domain, ip)),
    {
        command: "whois",
        input: M05_HOSPITAL_HOME_DOMAIN,
        data: {
            ip: M05_HOSPITAL_HOME_IP,
            contact: Localization.t(M05_I18N_KEY.OSINT_WHOIS_HOSPITAL_CONTACT),
            status: true,
        },
    },
];

export const buildM05TeamPageFixtures = (): FixtureEntry[] => {
    const gretaLines = [
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_1),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_2),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GRETA_3),
    ];
    const garethLines = [
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GARETH_1),
        Localization.t(M05_I18N_KEY.OSINT_LYNX_GARETH_2),
    ];

    return [
        lynx(M05_GRETA_HANDLE, M05_GRETA_HANDLE, gretaLines),
        lynx(M05_GRETA_TWOTTER_USERNAME, M05_GRETA_HANDLE, gretaLines),
        lynx(M05_GRETA_FULL_NAME, M05_GRETA_HANDLE, gretaLines),
        lynx(M05_GARETH_HANDLE, M05_GARETH_HANDLE, garethLines),
        lynx(M05_GARETH_FULL_NAME, M05_GARETH_HANDLE, garethLines),
    ];
};

export const M05_STALE_FIXTURES: readonly FixtureRef[] = [];
