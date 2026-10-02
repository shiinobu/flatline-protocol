import type { DomainSpec } from "../../core/types.js";

export const M05_EDGE_DOMAIN = "remote.pacificcare-health.org";
export const M05_EDGE_IP = "198.244.91.37";
export const M05_EDGE_LAN_IP = "192.168.1.1";

export const M05_SPLITTER_IP = "37.120.145.62";
export const M05_SPLITTER_LAN_IP = "192.168.1.2";

export const M05_FIREWALL_IP = "193.29.57.184";
export const M05_FIREWALL_LAN_IP = "192.168.1.3";

export const M05_COLD_CHART_IP = "141.98.252.76";
export const M05_COLD_CHART_LAN_IP = "192.168.1.4";
export const M05_COLD_CHART_CODENAME = "Cold-Chart";

export const M05_BEDSIDE_IP = "80.94.92.118";
export const M05_BEDSIDE_LAN_IP = "192.168.1.5";
export const M05_BEDSIDE_CODENAME = "Bedside-17";
export const M05_BEDSIDE_ASSET_TAG = "PC-IT-017";
export const M05_BEDSIDE_RDP_VERSION = "FreeRDP 6.0.4";
export const M05_BEDSIDE_USERNAME = "it.station";

export const M05_LEAD_APRON_IP = "45.142.193.29";
export const M05_LEAD_APRON_LAN_IP = "192.168.1.6";
export const M05_LEAD_APRON_CODENAME = "Lead-Apron";
export const M05_LEAD_APRON_USERNAME = "pacs";

export const M05_PAY_STATION_IP = "176.113.115.84";
export const M05_PAY_STATION_LAN_IP = "192.168.1.7";
export const M05_PAY_STATION_CODENAME = "Pay-Station";
export const M05_PAY_STATION_USERNAME = "billing";

export const M05_PRINTER_IP = "195.133.40.17";
export const M05_PRINTER_LAN_IP = "192.168.1.8";
export const M05_PRINTER_USERNAME = "admin";

export const M05_GRETA_USERNAME = "g.desouza";
export const M05_GRETA_PASSWORD = "Marigold2019";
export const M05_PAY_STATION_PASSWORD = "billing-desk-04";
export const M05_LEAD_APRON_PASSWORD = "radiology2021";
export const M05_PRINTER_PASSWORD = "printroom01";

export const M05_GRETA_HASH = "a3106b24578d51822fb862154d11b89d";
export const M05_PAY_STATION_HASH = "2d13ee924661ff4007228f5c4d199484";
export const M05_LEAD_APRON_HASH = "89373ed2fcad2cf734d0e7b792800909";
export const M05_PRINTER_HASH = "f19ee082c990c2f01f0d1879b0b5cdfa";

export const M05_HOSPITAL_MAIL_DOMAIN = "pacificcare-health.org";
export const M05_GRETA_WORK_EMAIL = `${M05_GRETA_USERNAME}@${M05_HOSPITAL_MAIL_DOMAIN}`;

export const M05_ECHOLINE_DOMAIN = "echoline.net";
export const M05_ECHOLINE_IP = "185.31.164.22";
export const M05_LEAKINDEX_DOMAIN = "leakindex.net";
export const M05_LEAKINDEX_IP = "91.229.23.105";

export const M05_SNAPSHOT_2025 = "2025-11-03";
export const M05_SNAPSHOT_2026 = "2026-09-02";
export const M05_ECHOLINE_M05_2025_PATH = "/s/8fq2/";
export const M05_ECHOLINE_M05_2026_PATH = "/s/8fq7/";

export const M05_SSH_PORT = 22;
export const M05_RDP_PORT = 3389;
export const M05_HTTP_PORT = 80;
export const M05_HTTPS_PORT = 443;
export const M05_PRINTER_PORT = 9100;

export const M05_ROUTER_IPS: readonly string[] = [M05_EDGE_IP];

export const M05_DOMAIN_RECORDS: readonly DomainSpec[] = [];
export const M05_EDGE_DOMAIN_RECORDS: readonly DomainSpec[] = [
    { name: M05_EDGE_DOMAIN, ip: M05_EDGE_IP, needsSubnet: false },
];
