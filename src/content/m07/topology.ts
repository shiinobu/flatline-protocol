import type { LogDay } from "../../components/log-file.js";
import type { DeviceSpec, RouterSpec } from "../../core/types.js";

import {
    M07_ASHVECTOR_IP,
    M07_ASHVECTOR_LAN_IP,
    M07_ASHVECTOR_CODENAME,
    M07_ASHVECTOR_SSH_VERSION,
    M07_C2_CMS_VERSION,
    M07_C2_IP,
    M07_C2_LAN_IP,
    M07_C2_RDP_VERSION,
    M07_C2_SERVICE_USERNAME,
    M07_DEAD_BOX_PASSWORD,
    M07_DEAD_BOX_USERNAME,
    M07_FIREWALL_IP,
    M07_FIREWALL_LAN_IP,
    M07_FIREWALL_PASSWORD,
    M07_FIREWALL_USERNAME,
    M07_HTTP_PORT,
    M07_HTTPS_PORT,
    M07_NULLCROWN_CODENAME,
    M07_NULLCROWN_IP,
    M07_NULLCROWN_LAN_IP,
    M07_NULLCROWN_SSH_VERSION,
    M07_RDP_PORT,
    M07_ROUTER_IP,
    M07_ROUTER_LAN_IP,
    M07_SPLITTER_IP,
    M07_SPLITTER_LAN_IP,
    M07_SSH_PORT,
} from "./network.js";
import {
    M07_ASH_GATE_BACKUP_CONTENT,
    M07_ASH_GATE_BACKUP_FILE_EXTENSION,
    M07_ASH_GATE_BACKUP_FILE_NAME,
    M07_DECOY_CONTENT,
    M07_DECOY_FILE_EXTENSION,
    M07_DECOY_FILE_NAME,
    M07_LEDGER_FILE_CONTENT,
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
    M07_MANIFEST_CONTENT,
    M07_MANIFEST_FILE_EXTENSION,
    M07_MANIFEST_FILE_NAME,
    M07_ORDERS_CONTENT,
    M07_ORDERS_FILE_EXTENSION,
    M07_ORDERS_FILE_NAME,
    M07_SURVEY_CONTENT,
    M07_SURVEY_FILE_EXTENSION,
    M07_SURVEY_FILE_NAME,
} from "./server-files.js";

export const M07_RDP_OPEN_FROM_BUILD = false;

const M07_ROOT_LOG_DAY: LogDay = { year: 2026, month: 10, day: 3 };

const buildFirewall = (): DeviceSpec => ({
    kind: "firewall",
    ip: M07_FIREWALL_IP,
    lanIp: M07_FIREWALL_LAN_IP,
    isIpHidden: true,
    users: [{ username: M07_FIREWALL_USERNAME, password: M07_FIREWALL_PASSWORD }],
    ports: [{ external: M07_HTTP_PORT, internal: M07_HTTP_PORT, active: true, service: "http" }],
    rules: [
        { allowed: false, port: M07_SSH_PORT, destination: M07_C2_LAN_IP },
        { allowed: false, port: M07_RDP_PORT, destination: M07_C2_LAN_IP },
    ],
});

const buildCommandHost = (): DeviceSpec => ({
    kind: "device",
    ip: M07_C2_IP,
    lanIp: M07_C2_LAN_IP,
    users: [{ username: M07_C2_SERVICE_USERNAME, online: true }, { username: "root" }],
    ports: [
        {
            external: M07_HTTPS_PORT,
            internal: M07_HTTPS_PORT,
            active: true,
            service: "https",
            version: M07_C2_CMS_VERSION,
        },
        {
            external: M07_RDP_PORT,
            internal: M07_RDP_PORT,
            active: M07_RDP_OPEN_FROM_BUILD,
            service: "rdp",
            version: M07_C2_RDP_VERSION,
        },
    ],
    rootLogDay: M07_ROOT_LOG_DAY,
    neutralLogs: [M07_ORDERS_FILE_NAME],
    rootFiles: [
        {
            name: M07_MANIFEST_FILE_NAME,
            extension: M07_MANIFEST_FILE_EXTENSION,
            data: M07_MANIFEST_CONTENT(),
        },
        {
            name: M07_ORDERS_FILE_NAME,
            extension: M07_ORDERS_FILE_EXTENSION,
            data: M07_ORDERS_CONTENT(),
        },
        {
            name: M07_SURVEY_FILE_NAME,
            extension: M07_SURVEY_FILE_EXTENSION,
            data: M07_SURVEY_CONTENT(),
        },
        {
            name: M07_LEDGER_FILE_NAME,
            extension: M07_LEDGER_FILE_EXTENSION,
            data: M07_LEDGER_FILE_CONTENT,
        },
    ],
    vulnerabilities: [{ type: "RCE", version: M07_C2_RDP_VERSION }],
});

const buildNullCrown = (): DeviceSpec => ({
    kind: "device",
    ip: M07_NULLCROWN_IP,
    lanIp: M07_NULLCROWN_LAN_IP,
    name: M07_NULLCROWN_CODENAME,
    users: [
        {
            username: M07_DEAD_BOX_USERNAME,
            password: M07_DEAD_BOX_PASSWORD,
            files: [
                {
                    name: M07_DECOY_FILE_NAME,
                    extension: M07_DECOY_FILE_EXTENSION,
                    data: M07_DECOY_CONTENT(),
                },
            ],
        },
    ],
    ports: [
        {
            external: M07_SSH_PORT,
            internal: M07_SSH_PORT,
            active: true,
            service: "ssh",
            version: M07_NULLCROWN_SSH_VERSION,
        },
    ],
});

const buildAshVector = (): DeviceSpec => ({
    kind: "device",
    ip: M07_ASHVECTOR_IP,
    lanIp: M07_ASHVECTOR_LAN_IP,
    name: M07_ASHVECTOR_CODENAME,
    users: [
        {
            username: M07_DEAD_BOX_USERNAME,
            password: M07_DEAD_BOX_PASSWORD,
            files: [
                {
                    name: M07_ASH_GATE_BACKUP_FILE_NAME,
                    extension: M07_ASH_GATE_BACKUP_FILE_EXTENSION,
                    data: M07_ASH_GATE_BACKUP_CONTENT(),
                },
            ],
        },
    ],
    ports: [
        {
            external: M07_SSH_PORT,
            internal: M07_SSH_PORT,
            active: true,
            service: "ssh",
            version: M07_ASHVECTOR_SSH_VERSION,
        },
    ],
});

const buildArchitectRouter = (): RouterSpec => ({
    kind: "router",
    ip: M07_ROUTER_IP,
    lanIp: M07_ROUTER_LAN_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "splitter",
            ip: M07_SPLITTER_IP,
            lanIp: M07_SPLITTER_LAN_IP,
            users: [],
            children: [buildFirewall(), buildCommandHost(), buildNullCrown(), buildAshVector()],
        },
    ],
});

export const buildM07Topology = (): readonly RouterSpec[] => [buildArchitectRouter()];
