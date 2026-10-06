import { Localization, type Shell } from "@hotbunny/hackhub-content-sdk";
import { M01_I18N_KEY } from "../../i18n/m01/core.js";
import type { FixtureEntry, FixtureRef } from "../../core/types.js";

import { M01_IRC_HOST, M01_IRC_PASSWORD } from "./irc.js";
import {
    M01_BLACKWIRE_GATEWAY_IP,
    M01_BLACKWIRE_GATEWAY_PASSWORD,
    M01_BLACKWIRE_IP,
    M01_BROKER_ALIAS,
    M01_BROKER_INFRA_DOMAIN,
    M01_BROKER_INFRA_IP,
    M01_BROKER_LEAD_DOMAIN_RECORDS,
    M01_BROKER_USERNAME,
    M01_DOMAIN,
    M01_DOMAIN_RECORDS,
    M01_ESCROW_IP,
    M01_FIREWALL_IP,
    M01_FROSTGATE_API_IP,
    M01_FROSTGATE_API_PASSWORD,
    M01_FROSTGATE_DOMAIN,
    M01_FROSTGATE_GATEWAY_IP,
    M01_FROSTGATE_GATEWAY_PASSWORD,
    M01_FROSTGATE_IP,
    M01_LEGACY_IP,
    M01_LEGACY_PASSWORD,
    M01_OBSIDIAN_API_IP,
    M01_OBSIDIAN_API_PASSWORD,
    M01_OBSIDIAN_GATEWAY_IP,
    M01_OBSIDIAN_GATEWAY_PASSWORD,
    M01_OBSIDIAN_IP,
    M01_TARGET_IP,
    M01_TARGET_PASSWORD,
    M01_TARGET_SSH_TARGET,
} from "./network.js";
import {
    M01_BLACKWIRE_NMAP_RESULT,
    M01_BROKER_NMAP_RESULT,
    M01_ESCROW_NMAP_RESULT,
    M01_FIREWALL_NMAP_RESULT,
    M01_FROSTGATE_NMAP_RESULT,
    M01_NMAP_RESULT,
    M01_OBSIDIAN_NMAP_RESULT,
} from "./scan.js";
import { M01_TWOTTER_CONTACT_HANDLE, M01_TWOTTER_OPS_HANDLE, M01_TWOTTER_TRADER_HANDLE } from "./twotter.js";

const sshOpen = (): Shell.NmapPort[] => [{ port: 22, status: "OPEN", service: "ssh" }];

const buildNslookupFixtures = (): FixtureEntry[] =>
    M01_DOMAIN_RECORDS.map(
        (record): FixtureEntry => ({ command: "nslookup", input: record.name, data: record.ip }),
    );

const buildNmapFixtures = (): FixtureEntry[] => [
    { command: "nmap", input: M01_BLACKWIRE_IP, data: M01_BLACKWIRE_NMAP_RESULT },
    { command: "nmap", input: M01_LEGACY_IP, data: sshOpen() },
    { command: "nmap", input: M01_TARGET_IP, data: M01_NMAP_RESULT },
    { command: "nmap", input: M01_FIREWALL_IP, data: M01_FIREWALL_NMAP_RESULT },
    { command: "nmap", input: M01_BLACKWIRE_GATEWAY_IP, data: sshOpen() },
    { command: "nmap", input: M01_FROSTGATE_GATEWAY_IP, data: sshOpen() },
    { command: "nmap", input: M01_FROSTGATE_API_IP, data: sshOpen() },
    { command: "nmap", input: M01_OBSIDIAN_GATEWAY_IP, data: sshOpen() },
    { command: "nmap", input: M01_OBSIDIAN_API_IP, data: sshOpen() },
    { command: "nmap", input: M01_FROSTGATE_IP, data: M01_FROSTGATE_NMAP_RESULT },
    { command: "nmap", input: M01_OBSIDIAN_IP, data: M01_OBSIDIAN_NMAP_RESULT },
    { command: "nmap", input: M01_ESCROW_IP, data: M01_ESCROW_NMAP_RESULT },
    { command: "nmap", input: M01_BROKER_INFRA_IP, data: M01_BROKER_NMAP_RESULT },
];

const buildLynxBrokerFixtures = (): FixtureEntry[] => [
    {
        command: "lynx",
        input: M01_DOMAIN,
        data: {
            ips: [M01_BLACKWIRE_IP],
            address: [`https://${M01_DOMAIN}/`],
            additional: [Localization.t(M01_I18N_KEY.OSINT_LYNX_BLACKWIRE_DOMAIN)],
        },
    },
    {
        command: "lynx",
        input: M01_BROKER_ALIAS,
        data: {
            additional: [
                Localization.t(M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_1),
                Localization.t(M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_LOCKED_2),
            ],
        },
    },
    {
        command: "lynx",
        input: M01_BROKER_USERNAME,
        data: {
            socialMedia: [`@${M01_TWOTTER_OPS_HANDLE}`],
            additional: [Localization.t(M01_I18N_KEY.OSINT_LYNX_BROKER_USERNAME)],
        },
    },
];

const buildLynxPublicFixtures = (): FixtureEntry[] => [
    {
        command: "lynx",
        input: M01_TWOTTER_CONTACT_HANDLE,
        data: {
            socialMedia: [`@${M01_TWOTTER_CONTACT_HANDLE}`],
            additional: [Localization.t(M01_I18N_KEY.OSINT_LYNX_TWOTTER_CONTACT)],
        },
    },
    {
        command: "lynx",
        input: M01_TWOTTER_TRADER_HANDLE,
        data: {
            socialMedia: [`@${M01_TWOTTER_TRADER_HANDLE}`],
            additional: [Localization.t(M01_I18N_KEY.OSINT_LYNX_TWOTTER_TRADER)],
        },
    },
    {
        command: "lynx",
        input: M01_FROSTGATE_DOMAIN,
        data: {
            ips: [M01_FROSTGATE_IP],
            address: [`https://${M01_FROSTGATE_DOMAIN}/`],
            additional: [
                Localization.t(M01_I18N_KEY.OSINT_LYNX_FROSTGATE_DOMAIN, { handle: M01_TWOTTER_TRADER_HANDLE }),
            ],
        },
    },
];

const buildLookupFixtures = (): FixtureEntry[] => [
    {
        command: "whois",
        input: M01_FROSTGATE_DOMAIN,
        data: { domain: M01_FROSTGATE_DOMAIN, contact: "Registrar Privacy Service", status: true },
    },
    {
        command: "geoip",
        input: M01_FROSTGATE_IP,
        data: { country: "Iceland", city: "Reykjavik", latitude: "64.1466", longitude: "-21.9426" },
    },
];

const buildAccessFixtures = (): FixtureEntry[] => [
    {
        command: "ssh",
        input: { host: M01_TARGET_IP, key: M01_TARGET_PASSWORD },
        data: { ip: M01_TARGET_IP, status: "OPEN" },
    },
    {
        command: "hydra",
        input: { user: M01_BROKER_ALIAS, target: M01_TARGET_SSH_TARGET },
        data: { credentials: { username: M01_BROKER_ALIAS, password: M01_TARGET_PASSWORD } },
    },
    {
        command: "ssh",
        input: { host: M01_LEGACY_IP, key: M01_LEGACY_PASSWORD },
        data: { ip: M01_LEGACY_IP, status: "OPEN" },
    },
    {
        command: "ssh",
        input: { host: M01_BLACKWIRE_GATEWAY_IP, key: M01_BLACKWIRE_GATEWAY_PASSWORD },
        data: { ip: M01_BLACKWIRE_GATEWAY_IP, status: "OPEN" },
    },
    {
        command: "ssh",
        input: { host: M01_FROSTGATE_GATEWAY_IP, key: M01_FROSTGATE_GATEWAY_PASSWORD },
        data: { ip: M01_FROSTGATE_GATEWAY_IP, status: "OPEN" },
    },
    {
        command: "ssh",
        input: { host: M01_OBSIDIAN_GATEWAY_IP, key: M01_OBSIDIAN_GATEWAY_PASSWORD },
        data: { ip: M01_OBSIDIAN_GATEWAY_IP, status: "OPEN" },
    },
    { command: "weechat", input: { host: M01_IRC_HOST, password: M01_IRC_PASSWORD }, data: true },
];

export const buildM01Fixtures = (): FixtureEntry[] => [
    ...buildNslookupFixtures(),
    ...buildNmapFixtures(),
    ...buildLynxBrokerFixtures(),
    ...buildLynxPublicFixtures(),
    ...buildLookupFixtures(),
    ...buildAccessFixtures(),
];

export const buildM01BrokerLeadFixtures = (): FixtureEntry[] => [
    {
        command: "lynx",
        input: M01_BROKER_ALIAS,
        data: {
            address: [`https://${M01_BROKER_INFRA_DOMAIN}/`],
            additional: [
                Localization.t(M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_1),
                Localization.t(M01_I18N_KEY.OSINT_LYNX_BROKER_ALIAS_UNLOCKED_2),
            ],
        },
    },
    ...M01_BROKER_LEAD_DOMAIN_RECORDS.map(
        (record): FixtureEntry => ({ command: "nslookup", input: record.name, data: record.ip }),
    ),
];

export const M01_STALE_FIXTURES: readonly FixtureRef[] = [
    { command: "ssh", input: { host: M01_FROSTGATE_API_IP, key: M01_FROSTGATE_API_PASSWORD } },
    { command: "ssh", input: { host: M01_OBSIDIAN_API_IP, key: M01_OBSIDIAN_API_PASSWORD } },
];
