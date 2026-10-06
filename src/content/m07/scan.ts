import type { Shell } from "@hotbunny/hackhub-content-sdk";

import {
    M07_ASHVECTOR_SSH_VERSION,
    M07_C2_CMS_VERSION,
    M07_C2_RDP_VERSION,
    M07_HTTPS_PORT,
    M07_NULLCROWN_SSH_VERSION,
    M07_RDP_PORT,
    M07_SSH_PORT,
} from "./network.js";

export const M07_C2_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M07_HTTPS_PORT, status: "OPEN", service: "https", version: M07_C2_CMS_VERSION },
    { port: M07_RDP_PORT, status: "FILTERED", service: "rdp", version: M07_C2_RDP_VERSION },
];

export const M07_C2_NMAP_RESULT_OPEN: Shell.NmapPort[] = [
    { port: M07_HTTPS_PORT, status: "OPEN", service: "https", version: M07_C2_CMS_VERSION },
    { port: M07_RDP_PORT, status: "OPEN", service: "rdp", version: M07_C2_RDP_VERSION },
];

export const M07_NULLCROWN_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M07_SSH_PORT, status: "OPEN", service: "ssh", version: M07_NULLCROWN_SSH_VERSION },
    { port: M07_HTTPS_PORT, status: "CLOSE", service: "https" },
];

export const M07_ASHVECTOR_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M07_SSH_PORT, status: "OPEN", service: "ssh", version: M07_ASHVECTOR_SSH_VERSION },
    { port: M07_HTTPS_PORT, status: "CLOSE", service: "https" },
];
