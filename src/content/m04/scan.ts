import type { Shell } from "@hotbunny/hackhub-content-sdk";

import { M04_HTTP_PORT, M04_HTTPS_PORT, M04_SSH_PORT } from "./network.js";

export const M04_R1_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M04_HTTP_PORT, status: "OPEN", service: "http" },
    { port: M04_HTTPS_PORT, status: "CLOSE", service: "https" },
];

export const M04_STATIC_HOP_NMAP_CLOSED: Shell.NmapPort[] = [
    { port: M04_SSH_PORT, status: "CLOSE", service: "ssh" },
    { port: M04_HTTPS_PORT, status: "CLOSE", service: "https" },
];

export const M04_PAPER_MOTH_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M04_SSH_PORT, status: "OPEN", service: "ssh", version: "OpenSSH 8.2" },
    { port: M04_HTTPS_PORT, status: "CLOSE", service: "https" },
];

export const M04_NIGHT_SHIFT_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M04_HTTP_PORT, status: "CLOSE", service: "http" },
    { port: M04_HTTPS_PORT, status: "OPEN", service: "https" },
];

export const M04_UNKNOWN_GEOIP: Shell.GeoipData = {
    country: "Unknown",
    city: "Unknown",
    latitude: "0.0000",
    longitude: "0.0000",
};
