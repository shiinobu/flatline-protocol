import type { NetworkFileMap } from "@hotbunny/hackhub-content-sdk";

import type { DeviceSpec, RouterSpec } from "../../core/types.js";

import {
    M02_ADMIN_PASSWORD,
    M02_ADMIN_USERNAME,
    M02_CAMERA_CODENAME,
    M02_CAMERA_IP,
    M02_CAMERA_LAN_IP,
    M02_CLOSER_RIG_CODENAME,
    M02_CLOSER_RIG_IP,
    M02_CLOSER_RIG_RDP_VERSION,
    M02_CLOSER_RIG_ROUTER_IP,
    M02_DECOY_SUBDOMAIN_1_IP,
    M02_DECOY_SUBDOMAIN_1_ROUTER_IP,
    M02_DECOY_SUBDOMAIN_2_IP,
    M02_DECOY_SUBDOMAIN_2_ROUTER_IP,
    M02_DEV_IP,
    M02_DEV_ROUTER_IP,
    M02_FIREWALL_IP,
    M02_FIREWALL_LAN_IP,
    M02_GAME_CONSOLE_CODENAME,
    M02_GAME_CONSOLE_IP,
    M02_GAME_CONSOLE_LAN_IP,
    M02_HOME_NAS_CODENAME,
    M02_HOME_NAS_IP,
    M02_HOME_NAS_LAN_IP,
    M02_HOME_NAS_PASSWORD,
    M02_HOME_NAS_USERNAME,
    M02_PRINTER_IP,
    M02_PRINTER_LAN_IP,
    M02_ROOT_IP,
    M02_SMART_TV_CODENAME,
    M02_SMART_TV_IP,
    M02_SMART_TV_LAN_IP,
    M02_SPLITTER_IP,
    M02_SPLITTER_LAN_IP,
    M02_SQL_INJECTION,
    M02_WIFI_EXTENDER_CODENAME,
    M02_WIFI_EXTENDER_IP,
    M02_WIFI_EXTENDER_LAN_IP,
    M02_WORKSTATION_CODENAME,
    M02_WORKSTATION_IP,
    M02_WORKSTATION_LAN_IP,
    M02_WORKSTATION_RDP_VERSION,
    M02_WORKSTATION_ROUTER_IP,
    M02_WORKSTATION_ROUTER_LAN_IP,
    M02_WORKSTATION_USERNAME,
} from "./network.js";
import {
    M02_AFFILIATE_ENDPOINTS_CONTENT,
    M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION,
    M02_AFFILIATE_ENDPOINTS_FILE_NAME,
    M02_DECOY_NOTES_CONTENT,
    M02_DECOY_README_CONTENT,
    M02_DEPLOY_LOG_CONTENT,
    M02_DEPLOY_LOG_FILE_EXTENSION,
    M02_DEPLOY_LOG_FILE_NAME,
    M02_FINANCIAL_DOC_CONTENT,
    M02_FINANCIAL_DOC_FILE_EXTENSION,
    M02_FINANCIAL_DOC_FILE_NAME,
    M02_QUOTA_REPORT_CONTENT,
    M02_QUOTA_REPORT_FILE_EXTENSION,
    M02_QUOTA_REPORT_FILE_NAME,
    M02_ROUTING_NOTES_CONTENT,
    M02_ROUTING_NOTES_FILE_EXTENSION,
    M02_ROUTING_NOTES_FILE_NAME,
    M02_SYNC_SCRIPT_CONTENT,
    M02_SYNC_SCRIPT_FILE_EXTENSION,
    M02_SYNC_SCRIPT_FILE_NAME,
    M02_WORKSTATION_ERRANDS_CONTENT,
    M02_WORKSTATION_ERRANDS_FILE_EXTENSION,
    M02_WORKSTATION_ERRANDS_FILE_NAME,
    M02_WORKSTATION_UNSENT_CONTENT,
    M02_WORKSTATION_UNSENT_FILE_EXTENSION,
    M02_WORKSTATION_UNSENT_FILE_NAME,
} from "./server-files.js";

const folder = (name: string, files: NetworkFileMap[]): NetworkFileMap => ({
    name,
    isFolder: true,
    children: files,
});

const webDatabasePorts = (): NonNullable<DeviceSpec["ports"]> => [
    { external: 22, internal: 22, active: true, service: "ssh" },
    { external: 443, internal: 443, active: true, service: "https" },
    { external: 3306, internal: 3306, active: true, service: "mysql", version: "mariadb" },
];

const buildRootRouter = (): RouterSpec => ({
    kind: "router",
    ip: M02_ROOT_IP,
    users: [],
    ports: [
        { external: 80, internal: 80, active: false, service: "http" },
        { external: 443, internal: 443, active: true, service: "https" },
    ],
    children: [],
});

const buildDevRouter = (): RouterSpec => ({
    kind: "router",
    ip: M02_DEV_ROUTER_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: M02_DEV_IP,
            users: [{ username: M02_ADMIN_USERNAME, password: M02_ADMIN_PASSWORD }],
            ports: webDatabasePorts(),
            rootFiles: [
                folder("logs", [
                    {
                        name: M02_DEPLOY_LOG_FILE_NAME,
                        extension: M02_DEPLOY_LOG_FILE_EXTENSION,
                        data: M02_DEPLOY_LOG_CONTENT(),
                    },
                ]),
                folder("etc", [
                    {
                        name: M02_SYNC_SCRIPT_FILE_NAME,
                        extension: M02_SYNC_SCRIPT_FILE_EXTENSION,
                        data: M02_SYNC_SCRIPT_CONTENT(),
                    },
                ]),
            ],
            vulnerabilities: [...M02_SQL_INJECTION],
        },
    ],
});

const buildDecoyRouter = (routerIp: string, deviceIp: string, fileName: string, content: string): RouterSpec => ({
    kind: "router",
    ip: routerIp,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: deviceIp,
            users: [],
            ports: webDatabasePorts(),
            rootFiles: [folder("etc", [{ name: fileName, extension: "txt", data: content }])],
            vulnerabilities: [...M02_SQL_INJECTION],
        },
    ],
});

const buildCloserRigRouter = (): RouterSpec => ({
    kind: "router",
    ip: M02_CLOSER_RIG_ROUTER_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: M02_CLOSER_RIG_IP,
            name: M02_CLOSER_RIG_CODENAME,
            users: [{ username: "closer", online: true }],
            ports: [
                {
                    external: 3389,
                    internal: 3389,
                    active: true,
                    service: "rdp",
                    version: M02_CLOSER_RIG_RDP_VERSION,
                },
            ],
            rootFiles: [
                folder("etc", [
                    {
                        name: M02_QUOTA_REPORT_FILE_NAME,
                        extension: M02_QUOTA_REPORT_FILE_EXTENSION,
                        data: M02_QUOTA_REPORT_CONTENT(),
                    },
                    {
                        name: M02_ROUTING_NOTES_FILE_NAME,
                        extension: M02_ROUTING_NOTES_FILE_EXTENSION,
                        data: M02_ROUTING_NOTES_CONTENT(),
                    },
                ]),
            ],
            vulnerabilities: [{ type: "RCE", version: M02_CLOSER_RIG_RDP_VERSION }],
        },
    ],
});

const buildHomeDevices = (): DeviceSpec[] => [
    {
        kind: "firewall",
        ip: M02_FIREWALL_IP,
        lanIp: M02_FIREWALL_LAN_IP,
        isIpHidden: true,
        users: [{ username: M02_ADMIN_USERNAME, password: M02_ADMIN_PASSWORD }],
        ports: [{ external: 80, internal: 80, active: true, service: "http" }],
        rules: [{ allowed: false, port: 3389 }],
    },
    {
        kind: "printer",
        ip: M02_PRINTER_IP,
        lanIp: M02_PRINTER_LAN_IP,
        users: [],
        ports: [{ external: 9100, internal: 9100, active: false, service: "printer" }],
    },
    {
        kind: "device",
        ip: M02_WIFI_EXTENDER_IP,
        lanIp: M02_WIFI_EXTENDER_LAN_IP,
        name: M02_WIFI_EXTENDER_CODENAME,
        users: [],
        ports: [{ external: 23, internal: 23, active: true, service: "telnet" }],
    },
    {
        kind: "device",
        ip: M02_HOME_NAS_IP,
        lanIp: M02_HOME_NAS_LAN_IP,
        name: M02_HOME_NAS_CODENAME,
        users: [
            {
                username: M02_HOME_NAS_USERNAME,
                password: M02_HOME_NAS_PASSWORD,
                files: [
                    {
                        name: M02_AFFILIATE_ENDPOINTS_FILE_NAME,
                        extension: M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION,
                        data: M02_AFFILIATE_ENDPOINTS_CONTENT(),
                    },
                ],
            },
        ],
        ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
    },
    {
        kind: "device",
        ip: M02_SMART_TV_IP,
        lanIp: M02_SMART_TV_LAN_IP,
        name: M02_SMART_TV_CODENAME,
        users: [],
        ports: [{ external: 8008, internal: 8008, active: true, service: "http" }],
    },
    {
        kind: "device",
        ip: M02_CAMERA_IP,
        lanIp: M02_CAMERA_LAN_IP,
        name: M02_CAMERA_CODENAME,
        users: [],
        ports: [{ external: 554, internal: 554, active: true, service: "rtsp" }],
    },
    {
        kind: "device",
        ip: M02_WORKSTATION_IP,
        lanIp: M02_WORKSTATION_LAN_IP,
        name: M02_WORKSTATION_CODENAME,
        users: [
            {
                username: M02_WORKSTATION_USERNAME,
                online: true,
                files: [
                    {
                        name: M02_FINANCIAL_DOC_FILE_NAME,
                        extension: M02_FINANCIAL_DOC_FILE_EXTENSION,
                        data: M02_FINANCIAL_DOC_CONTENT(),
                    },
                    {
                        name: M02_WORKSTATION_ERRANDS_FILE_NAME,
                        extension: M02_WORKSTATION_ERRANDS_FILE_EXTENSION,
                        data: M02_WORKSTATION_ERRANDS_CONTENT(),
                    },
                    {
                        name: M02_WORKSTATION_UNSENT_FILE_NAME,
                        extension: M02_WORKSTATION_UNSENT_FILE_EXTENSION,
                        data: M02_WORKSTATION_UNSENT_CONTENT(),
                    },
                ],
            },
        ],
        ports: [
            {
                external: 3389,
                internal: 3389,
                active: false,
                service: "rdp",
                version: M02_WORKSTATION_RDP_VERSION,
            },
        ],
        vulnerabilities: [{ type: "RCE", version: M02_WORKSTATION_RDP_VERSION }],
    },
    {
        kind: "device",
        ip: M02_GAME_CONSOLE_IP,
        lanIp: M02_GAME_CONSOLE_LAN_IP,
        name: M02_GAME_CONSOLE_CODENAME,
        users: [],
        ports: [],
    },
];

const buildWorkstationRouter = (): RouterSpec => ({
    kind: "router",
    ip: M02_WORKSTATION_ROUTER_IP,
    lanIp: M02_WORKSTATION_ROUTER_LAN_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "splitter",
            ip: M02_SPLITTER_IP,
            lanIp: M02_SPLITTER_LAN_IP,
            users: [],
            children: buildHomeDevices(),
        },
    ],
});

export const buildM02Topology = (): readonly RouterSpec[] => [
    buildRootRouter(),
    buildDevRouter(),
    buildDecoyRouter(
        M02_DECOY_SUBDOMAIN_1_ROUTER_IP,
        M02_DECOY_SUBDOMAIN_1_IP,
        "README",
        M02_DECOY_README_CONTENT(),
    ),
    buildDecoyRouter(
        M02_DECOY_SUBDOMAIN_2_ROUTER_IP,
        M02_DECOY_SUBDOMAIN_2_IP,
        "notes",
        M02_DECOY_NOTES_CONTENT(),
    ),
    buildCloserRigRouter(),
    buildWorkstationRouter(),
];
