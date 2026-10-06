import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../../core/types.js";
import { M06_I18N_KEY } from "../../i18n/m06/core.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import {
    M06_AGENT_DOMAIN,
    M06_AGENT_IP,
    M06_ECHOLINE_DOMAIN,
    M06_ECHOLINE_IP,
    M06_HOSTTRAIL_DOMAIN,
    M06_HOSTTRAIL_IP,
    M06_INSURER_DOMAIN,
    M06_INSURER_IP,
    M06_INSURER_PORTAL_HOST,
    M06_INSURER_PORTAL_IP,
    M06_REGISTRY_DOMAIN,
    M06_REGISTRY_IP,
    M06_SKN_VPN_HOST,
} from "./network.js";
import { M06_REGISTRY_NMAP_RESULT } from "./scan.js";

export const buildM06Fixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M06_REGISTRY_DOMAIN, data: M06_REGISTRY_IP },
    { command: "nmap", input: M06_REGISTRY_IP, data: M06_REGISTRY_NMAP_RESULT },
    { command: "nmap", input: M06_REGISTRY_DOMAIN, data: M06_REGISTRY_NMAP_RESULT },
];

export const buildM06NomineesFixtures = (): FixtureEntry[] => [
    {
        command: "whois",
        input: M06_AGENT_DOMAIN,
        data: {
            ip: M06_AGENT_IP,
            contact: Localization.t(M06_I18N_KEY.OSINT_WHOIS_AGENT_CONTACT),
            status: true,
        },
    },
    { command: "nslookup", input: M06_AGENT_DOMAIN, data: M06_AGENT_IP },
    { command: "nslookup", input: M06_SKN_VPN_HOST, data: M04_ARCHITECT_VPN_IP },
];

export const buildM06ArchiveFixtures = (): FixtureEntry[] => [
    { command: "nslookup", input: M06_ECHOLINE_DOMAIN, data: M06_ECHOLINE_IP },
    { command: "nmap", input: M06_ECHOLINE_DOMAIN, data: M06_REGISTRY_NMAP_RESULT },
    { command: "nmap", input: M06_ECHOLINE_IP, data: M06_REGISTRY_NMAP_RESULT },
];

export const buildM06InfraFixtures = (): FixtureEntry[] => [
    {
        command: "whois",
        input: M06_INSURER_DOMAIN,
        data: {
            ip: M06_INSURER_IP,
            contact: Localization.t(M06_I18N_KEY.OSINT_WHOIS_INSURER_CONTACT),
            status: true,
        },
    },
    { command: "nslookup", input: M06_INSURER_DOMAIN, data: M06_INSURER_IP },
    { command: "nslookup", input: M06_INSURER_PORTAL_HOST, data: M06_INSURER_PORTAL_IP },
    { command: "nslookup", input: M06_HOSTTRAIL_DOMAIN, data: M06_HOSTTRAIL_IP },
    { command: "nmap", input: M06_HOSTTRAIL_DOMAIN, data: M06_REGISTRY_NMAP_RESULT },
    { command: "nmap", input: M06_HOSTTRAIL_IP, data: M06_REGISTRY_NMAP_RESULT },
];

export const M06_STALE_FIXTURES: readonly FixtureRef[] = [];
