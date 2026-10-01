import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../../core/types.js";
import { M03_I18N_KEY } from "../../i18n/m03/core.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import {
    M03_ACCOMPLICE_CODENAME,
    M03_COINDRIFT_CODENAME,
    M03_COMPANY_SHORT_NAME,
    M03_DECOY_EMPLOYEE_HANDLE,
    M03_DECOY_HOST_CODENAME,
    M03_FINANCE_EMPLOYEE_HANDLE,
    M03_LEDGER_DOMAIN,
    M03_MX_HOST,
    M03_PFSENSE_HYDRA_TARGET,
    M03_PFSENSE_HYDRA_USERS,
    M03_PFSENSE_IP,
    M03_PFSENSE_PASSWORD,
    M03_PFSENSE_USERNAME,
    M03_POLICY_YEAR,
    M03_REMOTE_PORTAL_DOMAIN,
    M03_SKYNET_DOMAIN,
    M03_SKYNET_IP,
    M03_VAULTLINE_CODENAME,
} from "./network.js";
import { M03_PFSENSE_NMAP_RESULT, M03_SKYNET_NMAP_RESULT, M03_VPN_GEOIP } from "./scan.js";
import {
    M03_OKAFOR_FIRST_NAME,
    M03_OKAFOR_LAST_NAME,
    M03_TWOTTER_FIRST_NAME,
    M03_TWOTTER_LAST_NAME,
} from "./twotter.js";

const t = (key: string, vars?: Record<string, string | number>): string => Localization.t(key, vars);

const buildSkynetLynx = (): string[] => [
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_BRAND, { shortName: M03_COMPANY_SHORT_NAME }),
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_STAFF, {
        handle: M03_FINANCE_EMPLOYEE_HANDLE,
        name: `${M03_TWOTTER_FIRST_NAME} ${M03_TWOTTER_LAST_NAME}`,
    }),
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_ALSO, {
        handle: M03_DECOY_EMPLOYEE_HANDLE,
        name: `${M03_OKAFOR_FIRST_NAME} ${M03_OKAFOR_LAST_NAME}`,
    }),
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_PORTAL, { portal: M03_REMOTE_PORTAL_DOMAIN }),
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_NOTICE, {
        coinDrift: M03_COINDRIFT_CODENAME,
        ledgerDomain: M03_LEDGER_DOMAIN,
        fadedLedger: M03_ACCOMPLICE_CODENAME,
        splitBill: M03_DECOY_HOST_CODENAME,
        vaultLine: M03_VAULTLINE_CODENAME,
    }),
    t(M03_I18N_KEY.OSINT_LYNX_SKYNET_POLICY, { year: M03_POLICY_YEAR }),
];

export const buildM03Fixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M03_SKYNET_IP, data: M03_SKYNET_NMAP_RESULT },
    {
        command: "lynx",
        input: M03_SKYNET_DOMAIN,
        data: {
            ips: [M03_SKYNET_IP],
            address: [`https://${M03_SKYNET_DOMAIN}/`],
            additional: buildSkynetLynx(),
        },
    },
    { command: "mxlookup", input: M03_SKYNET_DOMAIN, data: M03_MX_HOST },
    {
        command: "lynx",
        input: M03_FINANCE_EMPLOYEE_HANDLE,
        data: {
            socialMedia: [M03_FINANCE_EMPLOYEE_HANDLE],
            additional: [
                t(M03_I18N_KEY.OSINT_LYNX_FINANCE_1),
                t(M03_I18N_KEY.OSINT_LYNX_FINANCE_2),
                t(M03_I18N_KEY.OSINT_LYNX_FINANCE_3),
            ],
        },
    },
    {
        command: "lynx",
        input: M03_DECOY_EMPLOYEE_HANDLE,
        data: {
            socialMedia: [M03_DECOY_EMPLOYEE_HANDLE],
            additional: [
                t(M03_I18N_KEY.OSINT_LYNX_DECOY_1),
                t(M03_I18N_KEY.OSINT_LYNX_DECOY_2),
                t(M03_I18N_KEY.OSINT_LYNX_DECOY_3),
            ],
        },
    },
    { command: "geoip", input: M04_ARCHITECT_VPN_IP, data: M03_VPN_GEOIP },
    {
        command: "whois",
        input: M04_ARCHITECT_VPN_IP,
        data: { ip: M04_ARCHITECT_VPN_IP, contact: t(M03_I18N_KEY.OSINT_WHOIS_VPN_CONTACT), status: true },
    },
];

export const buildM03GatewayLeadFixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M03_REMOTE_PORTAL_DOMAIN, data: M03_PFSENSE_IP },
    { command: "nmap", input: M03_PFSENSE_IP, data: M03_PFSENSE_NMAP_RESULT },
    ...M03_PFSENSE_HYDRA_USERS.map(
        (user): FixtureEntry => ({
            command: "hydra",
            input: { user, target: M03_PFSENSE_HYDRA_TARGET },
            data: { credentials: { username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD } },
        }),
    ),
];

export const M03_STALE_FIXTURES: readonly FixtureRef[] = [
    { command: "hydra", input: { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP } },
];
