import type { Shell } from "@hotbunny/hackhub-content-sdk";

export const M02_ROOT_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M02_DEV_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "OPEN", service: "ssh", version: "OpenSSH 7.2" },
    { port: 443, status: "OPEN", service: "https", version: "nginx 1.10 (EOL)" },
];
