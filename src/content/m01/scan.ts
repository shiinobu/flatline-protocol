import type { Shell } from "@hotbunny/hackhub-content-sdk";

export const M01_BLACKWIRE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "FILTERED", service: "ssh", destination: "Firewall" },
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_FIREWALL_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "OPEN", service: "http" },
];

export const M01_FROSTGATE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_OBSIDIAN_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_ESCROW_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_BROKER_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "CLOSE", service: "https" },
];
