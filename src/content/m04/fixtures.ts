import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../../core/types.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import {
    M04_NIGHT_SHIFT_IP,
    M04_PAPER_MOTH_IP,
    M04_PAPER_MOTH_PASSWORD,
    M04_QUIET_MIRROR_IP,
    M04_QUIET_MIRROR_PASSWORD,
    M04_R1_HYDRA_TARGET,
    M04_R1_HYDRA_USERS,
    M04_R1_IP,
    M04_R1_PANEL_USERNAME,
    M04_STATIC_HOP_IP,
    M04_STATIC_HOP_PASSWORD,
} from "./network.js";
import {
    M04_NIGHT_SHIFT_NMAP_RESULT,
    M04_PAPER_MOTH_NMAP_RESULT,
    M04_QUIET_MIRROR_NMAP_OPEN,
    M04_R1_NMAP_RESULT,
    M04_STATIC_HOP_NMAP_CLOSED,
    M04_STATIC_HOP_NMAP_OPEN,
    M04_UNKNOWN_GEOIP,
} from "./scan.js";

export const buildM04Fixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M04_R1_IP, data: M04_R1_NMAP_RESULT },
    { command: "nmap", input: M04_STATIC_HOP_IP, data: M04_STATIC_HOP_NMAP_CLOSED },
    { command: "nmap", input: M04_PAPER_MOTH_IP, data: M04_PAPER_MOTH_NMAP_RESULT },
    {
        command: "ssh",
        input: { host: M04_PAPER_MOTH_IP, key: M04_PAPER_MOTH_PASSWORD },
        data: { ip: M04_PAPER_MOTH_IP, status: "OPEN" },
    },
];

export const buildM04RelayLeadFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M04_R1_IP, data: M04_R1_NMAP_RESULT },
    { command: "geoip", input: M04_STATIC_HOP_IP, data: M04_UNKNOWN_GEOIP },
    {
        command: "whois",
        input: M04_STATIC_HOP_IP,
        data: {
            ip: M04_STATIC_HOP_IP,
            contact: Localization.t(M04_I18N_KEY.OSINT_WHOIS_RELAY_CONTACT),
            status: true,
        },
    },
];

export const buildM04RouterCrackFixtures = (): FixtureEntry[] =>
    M04_R1_HYDRA_USERS.map((user): FixtureEntry => ({
        command: "hydra",
        input: { user, target: M04_R1_HYDRA_TARGET },
        data: { credentials: { username: M04_R1_PANEL_USERNAME, password: M04_STATIC_HOP_PASSWORD } },
    }));

export const buildM04StaticHopOpenFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M04_STATIC_HOP_IP, data: M04_STATIC_HOP_NMAP_OPEN },
    {
        command: "ssh",
        input: { host: M04_STATIC_HOP_IP, key: M04_STATIC_HOP_PASSWORD },
        data: { ip: M04_STATIC_HOP_IP, status: "OPEN" },
    },
];

export const buildM04QuietMirrorOpenFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M04_QUIET_MIRROR_IP, data: M04_QUIET_MIRROR_NMAP_OPEN },
    {
        command: "ssh",
        input: { host: M04_QUIET_MIRROR_IP, key: M04_QUIET_MIRROR_PASSWORD },
        data: { ip: M04_QUIET_MIRROR_IP, status: "OPEN" },
    },
];

export const buildM04ControlFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M04_NIGHT_SHIFT_IP, data: M04_NIGHT_SHIFT_NMAP_RESULT },
    { command: "geoip", input: M04_NIGHT_SHIFT_IP, data: M04_UNKNOWN_GEOIP },
    {
        command: "whois",
        input: M04_NIGHT_SHIFT_IP,
        data: {
            ip: M04_NIGHT_SHIFT_IP,
            contact: Localization.t(M04_I18N_KEY.OSINT_WHOIS_CONTROL_CONTACT),
            status: true,
        },
    },
];

export const M04_STALE_FIXTURES: readonly FixtureRef[] = [];
