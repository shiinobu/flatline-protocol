import type { DomainSpec } from "../../core/types.js";

export const M04_R1_IP = "193.164.228.17";
export const M04_R1_LAN_IP = "192.168.1.1";
export const M04_STATIC_HOP_IP = "141.77.202.84";
export const M04_STATIC_HOP_LAN_IP = "192.168.1.2";
export const M04_STATIC_HOP_CODENAME = "Static-Hop";
export const M04_STATIC_HOP_USERNAME = "svc";
export const M04_STATIC_HOP_PASSWORD = "relay-swap-07";
export const M04_R1_PANEL_USERNAME = M04_STATIC_HOP_USERNAME;
export const M04_R1_COMMON_USER = "admin";

export const M04_R2_IP = "87.121.52.196";
export const M04_R2_LAN_IP = "192.168.1.1";
export const M04_QUIET_MIRROR_IP = "45.155.204.31";
export const M04_QUIET_MIRROR_LAN_IP = "192.168.1.2";
export const M04_QUIET_MIRROR_CODENAME = "Quiet-Mirror";
export const M04_QUIET_MIRROR_USERNAME = "ops";
export const M04_QUIET_MIRROR_PASSWORD = "mirror.night.9";

export const M04_R3_IP = "176.97.210.63";
export const M04_R3_LAN_IP = "192.168.1.1";
export const M04_PAPER_MOTH_IP = "194.26.192.118";
export const M04_PAPER_MOTH_LAN_IP = "192.168.1.2";
export const M04_PAPER_MOTH_CODENAME = "Paper-Moth";
export const M04_PAPER_MOTH_USERNAME = "admin";
export const M04_PAPER_MOTH_PASSWORD = "admin";

export const M04_R4_IP = "91.222.174.46";
export const M04_R4_LAN_IP = "192.168.1.1";
export const M04_NIGHT_SHIFT_IP = "203.0.113.159";
export const M04_NIGHT_SHIFT_LAN_IP = "192.168.1.2";
export const M04_NIGHT_SHIFT_CODENAME = "Night-Shift";

export const M04_INTRUDER_IP = "62.197.136.44";
export const M04_HUNTER_TAG = "SENTRY";
export const M04_HUNTER_EMAIL = "sentry@darknull.io";
export const M04_WATCHDOG_EMAIL = "watchdog@architect-c2.dark";

export const M04_SSH_PORT = 22;
export const M04_HTTP_PORT = 80;
export const M04_HTTPS_PORT = 443;

export const M04_BEACON_INTERVAL_SECONDS = 60;

export const M04_ROUTER_IPS: readonly string[] = [M04_R1_IP, M04_R2_IP, M04_R3_IP, M04_R4_IP];

export const M04_DOMAIN_RECORDS: readonly DomainSpec[] = [];

export const M04_R1_HYDRA_TARGET = `${M04_R1_IP}:${M04_HTTP_PORT}`;
export const M04_HYDRA_DEFAULT_USER = "guest";
export const M04_R1_HYDRA_USERS: readonly string[] = [
    M04_HYDRA_DEFAULT_USER,
    M04_R1_COMMON_USER,
    M04_R1_PANEL_USERNAME,
];
