import type { DeviceSpec, RouterSpec } from "../../core/types.js";

import {
    M03_ACCOMPLICE_CODENAME,
    M03_ACCOMPLICE_IP,
    M03_ACCOMPLICE_LAN_IP,
    M03_ACCOMPLICE_PASSWORD,
    M03_ACCOMPLICE_USERNAME,
    M03_COINDRIFT_CODENAME,
    M03_COINDRIFT_IP,
    M03_COINDRIFT_LAN_IP,
    M03_DECOY_HOST_CODENAME,
    M03_DECOY_HOST_IP,
    M03_DECOY_HOST_LAN_IP,
    M03_DECOY_HOST_PASSWORD,
    M03_DECOY_HOST_USERNAME,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
    M03_PFSENSE_IP,
    M03_PFSENSE_LAN_IP,
    M03_PFSENSE_PASSWORD,
    M03_PFSENSE_USERNAME,
    M03_SKYNET_IP,
    M03_SPLITTER_IP,
    M03_SPLITTER_LAN_IP,
    M03_SQL_INJECTION,
    M03_VAULTLINE_CODENAME,
    M03_VAULTLINE_IP,
    M03_VAULTLINE_LAN_IP,
    M03_VAULTLINE_RDP_VERSION,
} from "./network.js";
import {
    M03_DECOY_README_CONTENT,
    M03_REYES_NOTE_CONTENT,
    M03_REYES_NOTE_FILE_EXTENSION,
    M03_REYES_NOTE_FILE_NAME,
    M03_SPREADSHEET_CONTENT,
    M03_SPREADSHEET_FILE_EXTENSION,
    M03_SPREADSHEET_FILE_NAME,
    M03_VPN_CONFIG_CONTENT,
    M03_VPN_CONFIG_FILE_EXTENSION,
    M03_VPN_CONFIG_FILE_NAME,
} from "./server-files.js";

const buildFinanceDevices = (): DeviceSpec[] => [
    {
        kind: "device",
        ip: M03_COINDRIFT_IP,
        lanIp: M03_COINDRIFT_LAN_IP,
        name: M03_COINDRIFT_CODENAME,
        users: [{ username: M03_FINANCE_USERNAME, password: M03_FINANCE_PASSWORD }],
        vulnerabilities: [...M03_SQL_INJECTION],
    },
    {
        kind: "device",
        ip: M03_ACCOMPLICE_IP,
        lanIp: M03_ACCOMPLICE_LAN_IP,
        name: M03_ACCOMPLICE_CODENAME,
        users: [
            {
                username: M03_ACCOMPLICE_USERNAME,
                password: M03_ACCOMPLICE_PASSWORD,
                files: [
                    {
                        name: M03_SPREADSHEET_FILE_NAME,
                        extension: M03_SPREADSHEET_FILE_EXTENSION,
                        data: M03_SPREADSHEET_CONTENT(),
                    },
                    {
                        name: M03_REYES_NOTE_FILE_NAME,
                        extension: M03_REYES_NOTE_FILE_EXTENSION,
                        data: M03_REYES_NOTE_CONTENT(),
                    },
                ],
            },
        ],
    },
    {
        kind: "device",
        ip: M03_DECOY_HOST_IP,
        lanIp: M03_DECOY_HOST_LAN_IP,
        name: M03_DECOY_HOST_CODENAME,
        users: [
            {
                username: M03_DECOY_HOST_USERNAME,
                password: M03_DECOY_HOST_PASSWORD,
                files: [{ name: "readme", extension: "txt", data: M03_DECOY_README_CONTENT() }],
            },
        ],
    },
    {
        kind: "device",
        ip: M03_VAULTLINE_IP,
        lanIp: M03_VAULTLINE_LAN_IP,
        name: M03_VAULTLINE_CODENAME,
        users: [{ username: "svc-vpn", online: true }, { username: "root" }],
        rootFiles: [
            {
                name: M03_VPN_CONFIG_FILE_NAME,
                extension: M03_VPN_CONFIG_FILE_EXTENSION,
                data: M03_VPN_CONFIG_CONTENT(),
            },
        ],
        vulnerabilities: [{ type: "RCE", version: M03_VAULTLINE_RDP_VERSION }],
    },
];

const buildSkynetRouter = (): RouterSpec => ({
    kind: "router",
    ip: M03_SKYNET_IP,
    users: [],
    ports: [
        { external: 80, internal: 80, active: false, service: "http" },
        { external: 443, internal: 443, active: true, service: "https" },
    ],
    children: [],
});

const buildGatewayRouter = (): RouterSpec => ({
    kind: "router",
    ip: M03_PFSENSE_IP,
    lanIp: M03_PFSENSE_LAN_IP,
    users: [{ username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD }],
    ports: [{ external: 80, internal: 80, active: true, service: "http" }],
    children: [
        {
            kind: "splitter",
            ip: M03_SPLITTER_IP,
            lanIp: M03_SPLITTER_LAN_IP,
            users: [],
            children: buildFinanceDevices(),
        },
    ],
});

export const buildM03Topology = (): readonly RouterSpec[] => [buildSkynetRouter(), buildGatewayRouter()];
