import type { DeviceSpec, RouterSpec } from "../../core/types.js";

import {
    M04_HTTP_PORT,
    M04_HTTPS_PORT,
    M04_NIGHT_SHIFT_CODENAME,
    M04_NIGHT_SHIFT_IP,
    M04_NIGHT_SHIFT_LAN_IP,
    M04_PAPER_MOTH_CODENAME,
    M04_PAPER_MOTH_IP,
    M04_PAPER_MOTH_LAN_IP,
    M04_PAPER_MOTH_PASSWORD,
    M04_PAPER_MOTH_USERNAME,
    M04_QUIET_MIRROR_CODENAME,
    M04_QUIET_MIRROR_IP,
    M04_QUIET_MIRROR_LAN_IP,
    M04_QUIET_MIRROR_PASSWORD,
    M04_QUIET_MIRROR_USERNAME,
    M04_R1_IP,
    M04_R1_LAN_IP,
    M04_R1_PANEL_USERNAME,
    M04_R2_IP,
    M04_R2_LAN_IP,
    M04_R3_IP,
    M04_R3_LAN_IP,
    M04_R4_IP,
    M04_R4_LAN_IP,
    M04_SSH_PORT,
    M04_STATIC_HOP_CODENAME,
    M04_STATIC_HOP_IP,
    M04_STATIC_HOP_LAN_IP,
    M04_STATIC_HOP_PASSWORD,
    M04_STATIC_HOP_USERNAME,
} from "./network.js";

const sshPort = (active: boolean): NonNullable<DeviceSpec["ports"]> => [
    { external: M04_SSH_PORT, internal: M04_SSH_PORT, active, service: "ssh" },
];

const buildRelayRouter = (): RouterSpec => ({
    kind: "router",
    ip: M04_R1_IP,
    lanIp: M04_R1_LAN_IP,
    users: [{ username: M04_R1_PANEL_USERNAME, password: M04_STATIC_HOP_PASSWORD }],
    ports: [{ external: M04_HTTP_PORT, internal: M04_HTTP_PORT, active: true, service: "http" }],
    children: [
        {
            kind: "device",
            ip: M04_STATIC_HOP_IP,
            lanIp: M04_STATIC_HOP_LAN_IP,
            name: M04_STATIC_HOP_CODENAME,
            users: [
                { username: M04_STATIC_HOP_USERNAME, password: M04_STATIC_HOP_PASSWORD },
                { username: "root" },
            ],
            ports: sshPort(false),
        },
    ],
});

const buildMirrorRouter = (): RouterSpec => ({
    kind: "router",
    ip: M04_R2_IP,
    lanIp: M04_R2_LAN_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: M04_QUIET_MIRROR_IP,
            lanIp: M04_QUIET_MIRROR_LAN_IP,
            name: M04_QUIET_MIRROR_CODENAME,
            users: [{ username: M04_QUIET_MIRROR_USERNAME, password: M04_QUIET_MIRROR_PASSWORD }],
            ports: sshPort(false),
        },
    ],
});

const buildHoneypotRouter = (): RouterSpec => ({
    kind: "router",
    ip: M04_R3_IP,
    lanIp: M04_R3_LAN_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: M04_PAPER_MOTH_IP,
            lanIp: M04_PAPER_MOTH_LAN_IP,
            name: M04_PAPER_MOTH_CODENAME,
            users: [{ username: M04_PAPER_MOTH_USERNAME, password: M04_PAPER_MOTH_PASSWORD }],
            ports: sshPort(true),
        },
    ],
});

const buildControlRouter = (): RouterSpec => ({
    kind: "router",
    ip: M04_R4_IP,
    lanIp: M04_R4_LAN_IP,
    users: [],
    ports: [],
    children: [
        {
            kind: "device",
            ip: M04_NIGHT_SHIFT_IP,
            lanIp: M04_NIGHT_SHIFT_LAN_IP,
            name: M04_NIGHT_SHIFT_CODENAME,
            users: [],
            ports: [{ external: M04_HTTPS_PORT, internal: M04_HTTPS_PORT, active: true, service: "https" }],
        },
    ],
});

export const buildM04Topology = (): readonly RouterSpec[] => [
    buildRelayRouter(),
    buildMirrorRouter(),
    buildHoneypotRouter(),
    buildControlRouter(),
];
