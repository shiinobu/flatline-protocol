import type { NetworkFileMap } from "@hotbunny/hackhub-content-sdk";
import type { RouterSpec } from "../../core/types.js";

import {
    M01_IRC_NOTES_ENCRYPTED,
    M01_IRC_NOTES_FILE_CONTENT,
    M01_IRC_NOTES_FILE_EXTENSION,
    M01_IRC_NOTES_FILE_NAME,
} from "./irc.js";
import { M01_STORY_DAY } from "./quest.js";
import {
    M01_BLACKWIRE_GATEWAY_IP,
    M01_BLACKWIRE_GATEWAY_LAN_IP,
    M01_BLACKWIRE_GATEWAY_PASSWORD,
    M01_BLACKWIRE_GATEWAY_USERNAME,
    M01_BLACKWIRE_IP,
    M01_BLACKWIRE_LAN_IP,
    M01_BLACKWIRE_ROUTER_IP,
    M01_BLACKWIRE_ROUTER_LAN_IP,
    M01_BROKER_ALIAS,
    M01_FIREWALL_IP,
    M01_FIREWALL_LAN_IP,
    M01_FIREWALL_PASSWORD,
    M01_FIREWALL_ROUTER_IP,
    M01_FIREWALL_ROUTER_LAN_IP,
    M01_FIREWALL_USERNAME,
    M01_FROSTGATE_API_IP,
    M01_FROSTGATE_API_LAN_IP,
    M01_FROSTGATE_API_PASSWORD,
    M01_FROSTGATE_API_USERNAME,
    M01_FROSTGATE_GATEWAY_IP,
    M01_FROSTGATE_GATEWAY_LAN_IP,
    M01_FROSTGATE_GATEWAY_PASSWORD,
    M01_FROSTGATE_GATEWAY_USERNAME,
    M01_FROSTGATE_IP,
    M01_FROSTGATE_LAN_IP,
    M01_FROSTGATE_ROUTER_IP,
    M01_FROSTGATE_ROUTER_LAN_IP,
    M01_LEGACY_IP,
    M01_LEGACY_LAN_IP,
    M01_LEGACY_PASSWORD,
    M01_LEGACY_USERNAME,
    M01_OBSIDIAN_API_IP,
    M01_OBSIDIAN_API_LAN_IP,
    M01_OBSIDIAN_API_PASSWORD,
    M01_OBSIDIAN_API_USERNAME,
    M01_OBSIDIAN_GATEWAY_IP,
    M01_OBSIDIAN_GATEWAY_LAN_IP,
    M01_OBSIDIAN_GATEWAY_PASSWORD,
    M01_OBSIDIAN_GATEWAY_USERNAME,
    M01_OBSIDIAN_IP,
    M01_OBSIDIAN_LAN_IP,
    M01_OBSIDIAN_ROUTER_IP,
    M01_OBSIDIAN_ROUTER_LAN_IP,
    M01_ROUTER_IP,
    M01_ROUTER_LAN_IP,
    M01_TARGET_IP,
    M01_TARGET_LAN_IP,
    M01_TARGET_PASSWORD,
} from "./network.js";
import {
    buildM01LedgerContent,
    M01_BLACKWIRE_GATEWAY_CONTENT,
    M01_DUMMY_AUTH_LOG_CONTENT,
    M01_DUMMY_CRON_LOG_CONTENT,
    M01_DUMMY_README_CONTENT,
    M01_DUMMY_SYSTEM_LOG_CONTENT,
    M01_DUMMY_TODO_CONTENT,
    M01_FROSTGATE_API_CONTENT,
    M01_FROSTGATE_GATEWAY_CONTENT,
    M01_LEDGER_FILE_EXTENSION,
    M01_LEDGER_FILE_NAME,
    M01_LEGACY_CONTENT,
    M01_OBSIDIAN_API_CONTENT,
    M01_OBSIDIAN_GATEWAY_CONTENT,
    M01_OPS_NOTES_CONTENT,
    M01_OPS_NOTES_FILE_EXTENSION,
    M01_OPS_NOTES_FILE_NAME,
} from "./server-files.js";

const buildFirewallNetwork = (): RouterSpec => ({
    ip: M01_FIREWALL_ROUTER_IP,
    lanIp: M01_FIREWALL_ROUTER_LAN_IP,
    kind: "router",
    users: [],
    ports: [],
    children: [
        {
            ip: M01_FIREWALL_IP,
            lanIp: M01_FIREWALL_LAN_IP,
            kind: "firewall",
            isIpHidden: true,
            users: [
                {
                    username: M01_FIREWALL_USERNAME,
                    password: M01_FIREWALL_PASSWORD,
                },
            ],
            ports: [{ external: 80, internal: 80, active: true, service: "http" }],
            rules: [{ allowed: false, port: 22 }],
        },
    ],
});

const buildBlackwireNetwork = (): RouterSpec => ({
    ip: M01_BLACKWIRE_ROUTER_IP,
    lanIp: M01_BLACKWIRE_ROUTER_LAN_IP,
    kind: "router",
    users: [],
    ports: [],
    children: [
        {
            ip: M01_BLACKWIRE_IP,
            lanIp: M01_BLACKWIRE_LAN_IP,
            kind: "device",
            users: [],
            ports: [{ external: 443, internal: 443, active: true, service: "https" }],
        },
        {
            ip: M01_LEGACY_IP,
            lanIp: M01_LEGACY_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_LEGACY_USERNAME,
                    password: M01_LEGACY_PASSWORD,
                    files: [
                        { name: "decommissioned", extension: "txt", data: M01_LEGACY_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
        {
            ip: M01_BLACKWIRE_GATEWAY_IP,
            lanIp: M01_BLACKWIRE_GATEWAY_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_BLACKWIRE_GATEWAY_USERNAME,
                    password: M01_BLACKWIRE_GATEWAY_PASSWORD,
                    files: [
                        { name: "readme", extension: "txt", data: M01_BLACKWIRE_GATEWAY_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
    ],
});

const buildBrokerRootFiles = (listingCode: string): NetworkFileMap[] => [
    {
        name: "logs",
        isFolder: true,
        children: [
            {
                name: M01_LEDGER_FILE_NAME,
                extension: M01_LEDGER_FILE_EXTENSION,
                data: buildM01LedgerContent(listingCode),
            },
            {
                name: M01_IRC_NOTES_FILE_NAME,
                extension: M01_IRC_NOTES_FILE_EXTENSION,
                data: M01_IRC_NOTES_FILE_CONTENT,
            },
            { name: "auth", extension: "log", data: M01_DUMMY_AUTH_LOG_CONTENT },
            { name: "cron", extension: "log", data: M01_DUMMY_CRON_LOG_CONTENT },
            { name: "system", extension: "log", data: M01_DUMMY_SYSTEM_LOG_CONTENT },
        ],
    },
];

const buildBrokerNetwork = (listingCode: string): RouterSpec => ({
    ip: M01_ROUTER_IP,
    lanIp: M01_ROUTER_LAN_IP,
    kind: "router",
    users: [],
    ports: [],
    children: [
        {
            ip: M01_TARGET_IP,
            lanIp: M01_TARGET_LAN_IP,
            kind: "device",
            isIpHidden: true,
            users: [
                {
                    username: M01_BROKER_ALIAS,
                    password: M01_TARGET_PASSWORD,
                    files: [
                        {
                            name: M01_OPS_NOTES_FILE_NAME,
                            extension: M01_OPS_NOTES_FILE_EXTENSION,
                            data: M01_OPS_NOTES_CONTENT(),
                        },
                        { name: "todo", extension: "txt", data: M01_DUMMY_TODO_CONTENT() },
                        { name: "readme", extension: "txt", data: M01_DUMMY_README_CONTENT() },
                    ],
                },
            ],
            ports: [
                { external: 22, internal: 22, active: false, service: "ssh" },
                { external: 80, internal: 80, active: false, service: "http" },
                { external: 443, internal: 443, active: true, service: "https" },
            ],
            rootFiles: buildBrokerRootFiles(listingCode),
            rootLogDay: M01_STORY_DAY,
            neutralLogs: [M01_LEDGER_FILE_NAME],
            typedLogs: [{ name: M01_IRC_NOTES_FILE_NAME, type: M01_IRC_NOTES_ENCRYPTED }],
        },
    ],
});

const buildFrostgateNetwork = (): RouterSpec => ({
    ip: M01_FROSTGATE_ROUTER_IP,
    lanIp: M01_FROSTGATE_ROUTER_LAN_IP,
    kind: "router",
    users: [],
    ports: [],
    children: [
        {
            ip: M01_FROSTGATE_IP,
            lanIp: M01_FROSTGATE_LAN_IP,
            kind: "device",
            users: [],
            ports: [{ external: 443, internal: 443, active: true, service: "https" }],
        },
        {
            ip: M01_FROSTGATE_GATEWAY_IP,
            lanIp: M01_FROSTGATE_GATEWAY_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_FROSTGATE_GATEWAY_USERNAME,
                    password: M01_FROSTGATE_GATEWAY_PASSWORD,
                    files: [
                        { name: "readme", extension: "txt", data: M01_FROSTGATE_GATEWAY_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
        {
            ip: M01_FROSTGATE_API_IP,
            lanIp: M01_FROSTGATE_API_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_FROSTGATE_API_USERNAME,
                    password: M01_FROSTGATE_API_PASSWORD,
                    files: [
                        { name: "decommissioned", extension: "txt", data: M01_FROSTGATE_API_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
    ],
});

const buildObsidianNetwork = (): RouterSpec => ({
    ip: M01_OBSIDIAN_ROUTER_IP,
    lanIp: M01_OBSIDIAN_ROUTER_LAN_IP,
    kind: "router",
    users: [],
    ports: [],
    children: [
        {
            ip: M01_OBSIDIAN_IP,
            lanIp: M01_OBSIDIAN_LAN_IP,
            kind: "device",
            users: [],
            ports: [{ external: 443, internal: 443, active: true, service: "https" }],
        },
        {
            ip: M01_OBSIDIAN_GATEWAY_IP,
            lanIp: M01_OBSIDIAN_GATEWAY_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_OBSIDIAN_GATEWAY_USERNAME,
                    password: M01_OBSIDIAN_GATEWAY_PASSWORD,
                    files: [
                        { name: "readme", extension: "txt", data: M01_OBSIDIAN_GATEWAY_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
        {
            ip: M01_OBSIDIAN_API_IP,
            lanIp: M01_OBSIDIAN_API_LAN_IP,
            kind: "device",
            users: [
                {
                    username: M01_OBSIDIAN_API_USERNAME,
                    password: M01_OBSIDIAN_API_PASSWORD,
                    files: [
                        { name: "decommissioned", extension: "txt", data: M01_OBSIDIAN_API_CONTENT() },
                    ],
                },
            ],
            ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
        },
    ],
});

export const buildM01Topology = (listingCode: string): RouterSpec[] => [
    buildFirewallNetwork(),
    buildBlackwireNetwork(),
    buildBrokerNetwork(listingCode),
    buildFrostgateNetwork(),
    buildObsidianNetwork(),
];
