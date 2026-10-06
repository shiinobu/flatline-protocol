import type { Shell } from "@hotbunny/hackhub-content-sdk";

export const M03_SKYNET_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M03_PFSENSE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "OPEN", service: "http" },
    { port: 443, status: "CLOSE", service: "https" },
];

export const M03_VPN_GEOIP: Shell.GeoipData = {
    country: "Unknown",
    city: "Unknown",
    latitude: "0.0000",
    longitude: "0.0000",
};
