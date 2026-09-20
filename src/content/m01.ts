import type { QuestObjectiveDefinition, Shell, TwotterTweetInteraction } from "@hotbunny/hackhub-content-sdk";

import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT } from "./characters.js";

export const M01_ROUTER_IP = "91.198.174.3";
export const M01_ROUTER_LAN_IP = "192.168.1.1";

export const M01_FIREWALL_ROUTER_IP = "45.132.11.1";
export const M01_FIREWALL_ROUTER_LAN_IP = "192.168.2.1";
export const M01_FIREWALL_IP = "45.132.11.87";
export const M01_FIREWALL_LAN_IP = "192.168.2.2";

export const M01_TARGET_IP = "77.91.14.203";
export const M01_TARGET_LAN_IP = "192.168.1.3";

export const M01_FRONT_ROUTER_IP = "198.51.100.1";
export const M01_FRONT_ROUTER_LAN_IP = "192.168.3.1";
export const M01_FRONT_IP = "198.51.100.77";
export const M01_FRONT_LAN_IP = "192.168.3.2";
export const M01_LEGACY_IP = "198.51.100.212";
export const M01_LEGACY_LAN_IP = "192.168.3.3";
export const M01_LEGACY_USERNAME = "admin";
export const M01_LEGACY_PASSWORD = "admin123";
export const M01_LEGACY_CONTENT =
    "this box was supposed to be decommissioned in 2024. nobody ever got around to it. nothing useful left here.";

export const M01_DOMAIN = "blackwire-network.mkt";
export const M01_HIDDEN_PATH = "/listings/med-sea-0417/";
export const M01_GATEWAY_SUBDOMAIN = `gateway.${M01_DOMAIN}`;
export const M01_FAILOVER_SUBDOMAIN = `failover.${M01_DOMAIN}`;

export const M01_DECOY_DOMAIN = "frostgate-exchange.mkt";
export const M01_DECOY_IP = "168.100.9.44";

export const M01_OBSIDIAN_DOMAIN = "obsidian-access.mkt";
export const M01_OBSIDIAN_IP = "5.188.94.117";

export const M01_LEDGERVAULT_DOMAIN = "x7k2m9vdlq4wnyt3.dark";
export const M01_LEDGERVAULT_IP = "185.220.31.6";

export const M01_HOSTING_DOMAIN = "swiftedge.cloud";
export const M01_HOSTING_IP = "172.98.44.19";
export const M01_ESCROW_DOMAIN = "clearescrow.io";
export const M01_ESCROW_IP = "46.29.115.63";
export const M01_ESCROW_APP_IP = "46.29.115.201";
export const M01_HOSPITAL_DOMAIN = "pacificcare-health.org";
export const M01_HOSPITAL_IP = "103.87.62.145";

export interface M01DomainRecord {
    readonly name: string;
    readonly ip: string;
    readonly needsSubnet: boolean;
}

export const M01_DOMAIN_RECORDS: M01DomainRecord[] = [
    { name: M01_DOMAIN, ip: M01_FRONT_IP, needsSubnet: false },
    { name: `www.${M01_DOMAIN}`, ip: "198.51.100.78", needsSubnet: true },
    { name: M01_GATEWAY_SUBDOMAIN, ip: M01_TARGET_IP, needsSubnet: false },
    { name: `mail.${M01_DOMAIN}`, ip: "198.51.100.140", needsSubnet: true },
    { name: `api.${M01_DOMAIN}`, ip: "198.51.100.63", needsSubnet: true },
    { name: `status.${M01_DOMAIN}`, ip: "198.51.100.201", needsSubnet: true },
    { name: `legacy.${M01_DOMAIN}`, ip: M01_LEGACY_IP, needsSubnet: false },
    { name: M01_FAILOVER_SUBDOMAIN, ip: M01_FIREWALL_IP, needsSubnet: false },

    { name: M01_DECOY_DOMAIN, ip: M01_DECOY_IP, needsSubnet: true },
    { name: `www.${M01_DECOY_DOMAIN}`, ip: "91.243.67.18", needsSubnet: true },
    { name: `trade.${M01_DECOY_DOMAIN}`, ip: "91.243.67.94", needsSubnet: true },
    { name: `api.${M01_DECOY_DOMAIN}`, ip: "91.243.67.152", needsSubnet: true },
    { name: `support.${M01_DECOY_DOMAIN}`, ip: "91.243.67.7", needsSubnet: true },
    { name: `status.${M01_DECOY_DOMAIN}`, ip: "91.243.67.230", needsSubnet: true },
    { name: `gateway.${M01_DECOY_DOMAIN}`, ip: "91.243.67.61", needsSubnet: true },
    { name: `wallet.${M01_DECOY_DOMAIN}`, ip: "91.243.67.183", needsSubnet: true },

    { name: M01_HOSTING_DOMAIN, ip: M01_HOSTING_IP, needsSubnet: true },
    { name: `www.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.140", needsSubnet: true },
    { name: `cdn1.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.203", needsSubnet: true },
    { name: `cdn2.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.66", needsSubnet: true },
    { name: `status.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.11", needsSubnet: true },
    { name: `api.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.178", needsSubnet: true },
    { name: `billing.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.92", needsSubnet: true },
    { name: `gateway.${M01_HOSTING_DOMAIN}`, ip: "172.98.44.235", needsSubnet: true },

    { name: M01_ESCROW_DOMAIN, ip: M01_ESCROW_IP, needsSubnet: true },
    { name: `www.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.14", needsSubnet: true },
    { name: `app.${M01_ESCROW_DOMAIN}`, ip: M01_ESCROW_APP_IP, needsSubnet: true },
    { name: `api.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.98", needsSubnet: true },
    { name: `support.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.177", needsSubnet: true },
    { name: `status.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.42", needsSubnet: true },
    { name: `gateway.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.220", needsSubnet: true },
    { name: `partners.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.6", needsSubnet: true },

    { name: M01_HOSPITAL_DOMAIN, ip: M01_HOSPITAL_IP, needsSubnet: true },
    { name: `www.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.9", needsSubnet: true },
    { name: `patientportal.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.188", needsSubnet: true },
    { name: `careers.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.71", needsSubnet: true },
    { name: `news.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.130", needsSubnet: true },
    { name: `mail.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.54", needsSubnet: true },
    { name: `status.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.216", needsSubnet: true },
    { name: `gateway.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.97", needsSubnet: true },

    { name: M01_OBSIDIAN_DOMAIN, ip: M01_OBSIDIAN_IP, needsSubnet: true },
    { name: `www.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.203", needsSubnet: true },
    { name: `gateway.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.48", needsSubnet: true },
];

export const M01_BROKER_USERNAME = "opsadmin";

export const M01_FIREWALL_USERNAME = "failsafe";
export const M01_FIREWALL_PASSWORD = "Gr1dLock#42";

export const M01_TARGET_USERNAME = "root_4ae9c";
export const M01_TARGET_PASSWORD = "Tn8$rWq3yK1z";

export const M01_TWOTTER_BROKER_HANDLE = "cryp7net";
export const M01_TWOTTER_BROKER_FIRST_NAME = "Ops";
export const M01_TWOTTER_BROKER_LAST_NAME = "Admin";
export const M01_TWOTTER_BROKER_AVATAR =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iIzBmMTcyMCIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjU5IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZGRjOTciIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41NSIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iNDgiIHI9IjIwIiBmaWxsPSIjM2RkYzk3Ii8+PHBhdGggZD0iTTI2IDEwNCBhMzggMzggMCAwIDEgNzYgMCB6IiBmaWxsPSIjM2RkYzk3Ii8+PC9zdmc+";
export const M01_TWOTTER_BROKER_BANNER =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZE9wcyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMjQgMCBIMCBWMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE3MjUxZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvd09wcyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzNkZGM5NyIgc3RvcC1vcGFjaXR5PSIwLjIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzZGRjOTciIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMGYxNzIwIi8+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JpZE9wcykiLz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnbG93T3BzKSIvPjxnIHN0cm9rZT0iIzNkZGM5NyIgb3BhY2l0eT0iMC4zIj48bGluZSB4MT0iMCIgeTE9IjM2IiB4Mj0iNjAwIiB5Mj0iMzYiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIwIiB5MT0iNzQiIHgyPSI2MDAiIHkyPSI3NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjAiIHkxPSIxMjgiIHgyPSI2MDAiIHkyPSIxMjgiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIwIiB5MT0iMTY4IiB4Mj0iNjAwIiB5Mj0iMTY4IiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PGcgZmlsbD0iIzNkZGM5NyIgb3BhY2l0eT0iMC43Ij48Y2lyY2xlIGN4PSI2MCIgY3k9Ijc0IiByPSIyLjQiLz48Y2lyY2xlIGN4PSIxMjgiIGN5PSI3NCIgcj0iMi40Ii8+PGNpcmNsZSBjeD0iMTc2IiBjeT0iNzQiIHI9IjIuNCIvPjxjaXJjbGUgY3g9IjI2MCIgY3k9IjEyOCIgcj0iMi40Ii8+PGNpcmNsZSBjeD0iMzIwIiBjeT0iMTI4IiByPSIyLjQiLz48L2c+PGcgc3Ryb2tlPSIjM2RkYzk3IiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNTUiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0yMCAyMCBoMTggTTIwIDIwIHYxOCIvPjxwYXRoIGQ9Ik01ODAgMTgwIGgtMTggTTU4MCAxODAgdi0xOCIvPjwvZz48L3N2Zz4=";
export const M01_TWOTTER_CONTACT_HANDLE = "vau1tkeeper";
export const M01_TWOTTER_CONTACT_FIRST_NAME = "Vault";
export const M01_TWOTTER_CONTACT_LAST_NAME = "Keeper";
export const M01_TWOTTER_CONTACT_AVATAR =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iIzBmMTcyMCIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjU5IiBmaWxsPSJub25lIiBzdHJva2U9IiNlM2IyM2MiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41NSIvPjxwYXRoIGQ9Ik00OCA1NiB2LTExIGExNiAxNiAwIDAgMSAzMiAwIHYxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTNiMjNjIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjM3IiB5PSI1NiIgd2lkdGg9IjU0IiBoZWlnaHQ9IjQwIiByeD0iNyIgZmlsbD0iIzI0MWQwZiIgc3Ryb2tlPSIjZTNiMjNjIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSI2NCIgY3k9IjczIiByPSI2LjUiIGZpbGw9IiNlM2IyM2MiLz48cmVjdCB4PSI2MSIgeT0iNzciIHdpZHRoPSI2IiBoZWlnaHQ9IjEzIiByeD0iMyIgZmlsbD0iI2UzYjIzYyIvPjwvc3ZnPg==";
export const M01_TWOTTER_CONTACT_BANNER =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9Imdsb3dWYXVsdCIgY3g9IjgyJSIgY3k9IjUwJSIgcj0iNjUlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlM2IyM2MiIHN0b3Atb3BhY2l0eT0iMC4yIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZTNiMjNjIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzBmMTcyMCIvPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dsb3dWYXVsdCkiLz48Y2lyY2xlIGN4PSI0OTIiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlM2IyM2MiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iNDkyIiBjeT0iMTAwIiByPSI1NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTNiMjNjIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iNDkyIiBjeT0iMTAwIiByPSI4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTNiMjNjIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMiIvPjxsaW5lIHgxPSI0OTIiIHkxPSI3MCIgeDI9IjQ5MiIgeTI9IjEzMCIgc3Ryb2tlPSIjZTNiMjNjIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuNDUiLz48bGluZSB4MT0iNDYyIiB5MT0iMTAwIiB4Mj0iNTIyIiB5Mj0iMTAwIiBzdHJva2U9IiNlM2IyM2MiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC40NSIvPjxnIHN0cm9rZT0iI2UzYjIzYyIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9IjAuMzUiPjxsaW5lIHgxPSI0OTIiIHkxPSI0NSIgeDI9IjQ5MiIgeTI9IjUyIi8+PGxpbmUgeDE9IjUyNCIgeTE9IjU3IiB4Mj0iNTE5IiB5Mj0iNjIiLz48bGluZSB4MT0iNTM3IiB5MT0iMTAwIiB4Mj0iNTMwIiB5Mj0iMTAwIi8+PGxpbmUgeDE9IjUyNCIgeTE9IjE0MyIgeDI9IjUxOSIgeTI9IjEzOCIvPjxsaW5lIHgxPSI0OTIiIHkxPSIxNTUiIHgyPSI0OTIiIHkyPSIxNDgiLz48bGluZSB4MT0iNDYwIiB5MT0iMTQzIiB4Mj0iNDY1IiB5Mj0iMTM4Ii8+PGxpbmUgeDE9IjQ0NyIgeTE9IjEwMCIgeDI9IjQ1NCIgeTI9IjEwMCIvPjxsaW5lIHgxPSI0NjAiIHkxPSI1NyIgeDI9IjQ2NSIgeTI9IjYyIi8+PC9nPjxjaXJjbGUgY3g9IjcwIiBjeT0iNTUiIHI9IjE0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlM2IyM2MiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjIyIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI1NSIgcj0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UzYjIzYyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjE1Ii8+PGcgZmlsbD0iI2UzYjIzYyIgb3BhY2l0eT0iMC4zIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIyLjUiLz48Y2lyY2xlIGN4PSI1ODQiIGN5PSIxNiIgcj0iMi41Ii8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxODQiIHI9IjIuNSIvPjxjaXJjbGUgY3g9IjU4NCIgY3k9IjE4NCIgcj0iMi41Ii8+PC9nPjwvc3ZnPg==";
export const M01_TWOTTER_DECOY_HANDLE = "cryp7ocoin";
export const M01_TWOTTER_DECOY_AVATAR =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2NCIgZmlsbD0iIzBmMTcyMCIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjU5IiBmaWxsPSJub25lIiBzdHJva2U9IiNjNjVlZTAiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC41NSIvPjxsaW5lIHgxPSI0MiIgeTE9IjQwIiB4Mj0iNDIiIHkyPSI4OCIgc3Ryb2tlPSIjYzY1ZWUwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjM2IiB5PSI1MCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjI0IiByeD0iMiIgZmlsbD0iI2M2NWVlMCIvPjxsaW5lIHgxPSI2NCIgeTE9IjMwIiB4Mj0iNjQiIHkyPSI5OCIgc3Ryb2tlPSIjYzY1ZWUwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjU4IiB5PSI0NCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjM4IiByeD0iMiIgZmlsbD0iI2M2NWVlMCIvPjxsaW5lIHgxPSI4NiIgeTE9IjQ4IiB4Mj0iODYiIHkyPSI4MiIgc3Ryb2tlPSIjYzY1ZWUwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjgwIiB5PSI1NiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iI2M2NWVlMCIvPjwvc3ZnPg==";
export const M01_TWOTTER_DECOY_BANNER =
    "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZENvaW4iIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTI0IDAgSDAgVjI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyMzFhMmIiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48bGluZWFyR3JhZGllbnQgaWQ9ImZpbGxDb2luIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYzY1ZWUwIiBzdG9wLW9wYWNpdHk9IjAuMyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2M2NWVlMCIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMwZjE3MjAiLz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmlkQ29pbikiLz48cGF0aCBkPSJNMCAxNTAgTDYwIDEzMCBMMTIwIDE0NSBMMTgwIDkwIEwyNDAgMTEwIEwzMDAgNjAgTDM2MCA4MCBMNDIwIDQ1IEw0ODAgNjUgTDU0MCAzMCBMNjAwIDUwIFYyMDAgSDAgWiIgZmlsbD0idXJsKCNmaWxsQ29pbikiLz48cGF0aCBkPSJNMCAxNTAgTDYwIDEzMCBMMTIwIDE0NSBMMTgwIDkwIEwyNDAgMTEwIEwzMDAgNjAgTDM2MCA4MCBMNDIwIDQ1IEw0ODAgNjUgTDU0MCAzMCBMNjAwIDUwIiBmaWxsPSJub25lIiBzdHJva2U9IiNjNjVlZTAiIHN0cm9rZS13aWR0aD0iMi41Ii8+PGcgZmlsbD0iI2M2NWVlMCI+PGNpcmNsZSBjeD0iMTgwIiBjeT0iOTAiIHI9IjMiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSI2MCIgcj0iMyIvPjxjaXJjbGUgY3g9IjQyMCIgY3k9IjQ1IiByPSIzIi8+PGNpcmNsZSBjeD0iNTQwIiBjeT0iMzAiIHI9IjMiLz48L2c+PGxpbmUgeDE9IjAiIHkxPSIxNzAiIHgyPSI2MDAiIHkyPSIxNzAiIHN0cm9rZT0iI2M2NWVlMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjI1Ii8+PC9zdmc+";

export const M01_KIMAI_SCRIPT_NAME = "kimai";
export const M01_JWT_DECODER_SCRIPT_NAME = "jwt_decoder";

export const M01_LEDGER_FILE_NAME = "sales_ledger";
export const M01_LEDGER_FILE_EXTENSION = "log";
export const M01_BUYER_ALIAS = "A7xC0DEFACE";
export const M01_LEDGER_CONTENT = [
    "TRANSACTION LOG — VERIFIED ACCESS SALES",
    "==========================================",
    "",
    "ROW 0417",
    "Sector: Healthcare",
    "Region: SEA",
    `Buyer: ${M01_BUYER_ALIAS}`,
    "Status: CONFIRMED",
    "Payment: Escrow released",
    "Notes: repeat client, requested rush turnaround on network map.",
].join("\n");

export const M01_OPS_NOTES_FILE_NAME = "ops_notes";
export const M01_OPS_NOTES_FILE_EXTENSION = "txt";
export const M01_OPS_NOTES_CONTENT =
    "Anything ops-related lives in /logs now, not here. Check there if you need details.";

export const M01_IRC_HOST = "relay.blkledger.dark";
export const M01_IRC_PASSWORD = "n0ledger";
export const M01_IRC_USERNAME = "opsadmin";
export const M01_IRC_CONTACT_USERNAME = "relay0";

export interface M01TwotterPost {
    readonly content: string;
    readonly interaction: TwotterTweetInteraction;
}

export const M01_TWOTTER_BROKER_BIO = "IT ops. keep the lights on. DMs closed.";
export const M01_TWOTTER_BROKER_POSTS: M01TwotterPost[] = [
    { content: "3am again. why do servers only decide to break at 3am", interaction: { comments: 2, share: 0, likes: 6, views: 180 } },
    { content: "gym first, work after. trying something different today", interaction: { comments: 0, share: 0, likes: 3, views: 90 } },
    { content: `main mirror is behaving again -- ${M01_DECOY_DOMAIN} is still the fallback if it isn't`, interaction: { comments: 1, share: 2, likes: 9, views: 310 } },
    { content: `${M01_OBSIDIAN_DOMAIN} is back too. same index, same listings, nothing changed`, interaction: { comments: 1, share: 1, likes: 10, views: 290 } },
    { content: "swiftedge support queue is getting ridiculous this week", interaction: { comments: 3, share: 0, likes: 5, views: 140 } },
    { content: "coffee. then more coffee. then maybe work", interaction: { comments: 1, share: 0, likes: 11, views: 260 } },
    { content: "obsidian panel finally stopped throwing 502s. about time", interaction: { comments: 2, share: 1, likes: 7, views: 200 } },
    { content: "spent half the night keeping obsidian-access alive. again", interaction: { comments: 1, share: 0, likes: 8, views: 175 } },
    { content: `put a few new lots up over at ${M01_DOMAIN}. don't ask what they are`, interaction: { comments: 0, share: 0, likes: 0, views: 21 } },
    { content: "backups finished early for once. suspicious, honestly", interaction: { comments: 0, share: 0, likes: 4, views: 120 } },
    { content: "frostgate keeps throwing money at ads like there's no tomorrow", interaction: { comments: 4, share: 1, likes: 14, views: 340 } },
    { content: `@${M01_TWOTTER_CONTACT_HANDLE} beat me to sending the payout notice again, how does that keep happening`, interaction: { comments: 3, share: 0, likes: 9, views: 210 } },
    { content: "it's fine. it's always fine until it isn't", interaction: { comments: 2, share: 0, likes: 7, views: 195 } },
    { content: `numbers looked good this round, nice work @${M01_TWOTTER_CONTACT_HANDLE}`, interaction: { comments: 1, share: 0, likes: 6, views: 160 } },
    { content: "harsh but fair, spreadsheets and me just don't get along", interaction: { comments: 2, share: 1, likes: 10, views: 230 } },
    { content: `you'd have to actually understand what i do first, @${M01_TWOTTER_CONTACT_HANDLE}`, interaction: { comments: 3, share: 0, likes: 8, views: 205 } },
];

export const M01_TWOTTER_CONTACT_BIO = "figures guy. don't ask what kind.";
export const M01_TWOTTER_CONTACT_POSTS: M01TwotterPost[] = [
    { content: "clearescrow payout finally cleared, only took 9 days this time", interaction: { comments: 3, share: 1, likes: 22, views: 480 } },
    { content: "anyone else's timeline just ads now", interaction: { comments: 8, share: 2, likes: 35, views: 610 } },
    { content: `found this randomly, no idea what it even is -- ${M01_LEDGERVAULT_DOMAIN} -- probably nothing`, interaction: { comments: 1, share: 0, likes: 4, views: 150 } },
    { content: "donated to the pacificcare drive again this year", interaction: { comments: 5, share: 3, likes: 41, views: 520 } },
    { content: `obsidian renewed the subscription again -- ${M01_OBSIDIAN_DOMAIN} still worth it honestly`, interaction: { comments: 6, share: 4, likes: 52, views: 890 } },
    { content: "if one more person asks me for an obsidian invite i'm turning dms off too", interaction: { comments: 14, share: 5, likes: 78, views: 1200 } },
    { content: "vault numbers looked clean this quarter, whatever that means to you", interaction: { comments: 2, share: 0, likes: 19, views: 430 } },
    { content: `${M01_OBSIDIAN_DOMAIN} down for ten minutes earlier and everyone lost their minds`, interaction: { comments: 22, share: 9, likes: 66, views: 1450 } },
    { content: "figures don't lie. people just don't like reading them", interaction: { comments: 6, share: 2, likes: 44, views: 700 } },
    { content: "escrow, obsidian, repeat. every week the same thing", interaction: { comments: 3, share: 1, likes: 30, views: 610 } },
    { content: "spreadsheet o'clock", interaction: { comments: 1, share: 0, likes: 15, views: 350 } },
    { content: "obsidian's new tier is actually decent for once", interaction: { comments: 9, share: 6, likes: 60, views: 980 } },
    { content: `maybe if your uptime wasn't garbage i wouldn't have to, @${M01_TWOTTER_BROKER_HANDLE}`, interaction: { comments: 6, share: 1, likes: 30, views: 560 } },
    { content: "that's not reassuring at all lol", interaction: { comments: 4, share: 1, likes: 25, views: 480 } },
    { content: `@${M01_TWOTTER_BROKER_HANDLE} they always look good. you're just bad at reading spreadsheets`, interaction: { comments: 7, share: 2, likes: 38, views: 640 } },
    { content: "one of these days i'm billing you for tech support too", interaction: { comments: 5, share: 1, likes: 27, views: 510 } },
    { content: `i understand it well enough to know when it's down lmao @${M01_TWOTTER_BROKER_HANDLE}`, interaction: { comments: 8, share: 2, likes: 42, views: 700 } },
];

export const M01_TWOTTER_DECOY_BIO = "day trader. not financial advice.";
export const M01_TWOTTER_DECOY_POSTS: M01TwotterPost[] = [
    { content: "crypto's up again, told you all", interaction: { comments: 30, share: 40, likes: 210, views: 3200 } },
    { content: "portfolio review stream tonight 8pm", interaction: { comments: 45, share: 60, likes: 260, views: 4100 } },
    { content: "nobody reads bios anyway lol", interaction: { comments: 25, share: 15, likes: 180, views: 2600 } },
    { content: `finally moved everything over to ${M01_DECOY_DOMAIN}, fees are so much better`, interaction: { comments: 52, share: 90, likes: 340, views: 5200 } },
    { content: "frostgate up 4% today, told you to get in early", interaction: { comments: 60, share: 110, likes: 410, views: 6100 } },
    { content: "giveaway livestream tomorrow, frostgate's sponsoring again", interaction: { comments: 88, share: 200, likes: 560, views: 8800 } },
    { content: "everyone sleeping on frostgate's new staking pool smh", interaction: { comments: 40, share: 70, likes: 300, views: 4700 } },
    { content: `${M01_DECOY_DOMAIN} support actually responds now, upgrade era fr`, interaction: { comments: 35, share: 55, likes: 250, views: 3900 } },
    { content: "red candles today but frostgate volume still insane", interaction: { comments: 48, share: 80, likes: 320, views: 5300 } },
    { content: "not financial advice but frostgate's referral bonus is actually good rn", interaction: { comments: 70, share: 180, likes: 480, views: 7200 } },
    { content: "day 47 of telling you frostgate is undervalued", interaction: { comments: 38, share: 65, likes: 270, views: 4400 } },
    { content: "portfolio's green, mood's green", interaction: { comments: 20, share: 25, likes: 190, views: 3000 } },
    { content: "charts don't lie, timing does", interaction: { comments: 18, share: 20, likes: 175, views: 2900 } },
];

export interface M01IrcLine {
    username: string;
    message: string;
}

export const M01_IRC_CONVERSATION: M01IrcLine[] = [
    { username: M01_IRC_USERNAME, message: "heads up, new build client wants it fast this time" },
    { username: M01_IRC_USERNAME, message: "don't drop the ball like last quarter" },
    { username: M01_IRC_CONTACT_USERNAME, message: "which one, the SEA hospital thing?" },
    { username: M01_IRC_USERNAME, message: "yeah. buyer's already confirmed — A7xC0DEFACE" },
    { username: M01_IRC_CONTACT_USERNAME, message: "escrow's clean on our side" },
    { username: M01_IRC_USERNAME, message: "good. keep it off the main listing once it clears" },
    { username: M01_IRC_CONTACT_USERNAME, message: "already flagged it no longer listed like the others" },
    { username: M01_IRC_USERNAME, message: "smart. don't want another leak like last time" },
    { username: M01_IRC_CONTACT_USERNAME, message: "speaking of, that admin portal still running the old session auth?" },
    { username: M01_IRC_USERNAME, message: "yeah, haven't touched it. works fine, nobody's noticed" },
    { username: M01_IRC_CONTACT_USERNAME, message: "you sure? plain cookie like that is asking for trouble" },
    { username: M01_IRC_USERNAME, message: "it's fine. just get the payment sorted before client gets impatient" },
    { username: M01_IRC_CONTACT_USERNAME, message: "copy. will confirm once escrow releases" },
    { username: M01_IRC_USERNAME, message: "good. this one needs to go clean" },
];

export const M01_IRC_NOTES_FILE_NAME = "ops-relay";
export const M01_IRC_NOTES_FILE_EXTENSION = "log";
export const M01_IRC_NOTES_CONTENT = [
    "Team standup moved to IRC if servers act up: relay.blkledger.dark",
    "Ask around for the channel key if you're new -- not posting it here again.",
    "key: n0ledger",
].join("\n");
export const M01_IRC_NOTES_ENCRYPTED =
    "VGVhbSBzdGFuZHVwIG1vdmVkIHRvIElSQyBpZiBzZXJ2ZXJzIGFjdCB1cDogcmVsYXkuYmxrbGVkZ2VyLmRhcmsKQXNrIGFyb3VuZCBmb3IgdGhlIGNoYW5uZWwga2V5IGlmIHlvdSdyZSBuZXcgLS0gbm90IHBvc3RpbmcgaXQgaGVyZSBhZ2Fpbi4Ka2V5OiBuMGxlZGdlcg==";
export const M01_IRC_NOTES_FILE_CONTENT = [
    "[ENCRYPTED]",
    M01_IRC_NOTES_ENCRYPTED,
].join("\n");

export const M01_DUMMY_TODO_CONTENT =
    "renew SSL cert, rotate backup keys, patch kernel this weekend";
export const M01_DUMMY_README_CONTENT =
    "standard ops box. don't touch prod configs without asking first.";
export const M01_DUMMY_AUTH_LOG_CONTENT = [
    "Failed password for invalid user admin from 91.203.44.12",
    "Accepted password for opsadmin from 10.0.0.4",
    "Failed password for root from 185.220.101.3",
].join("\n");
export const M01_DUMMY_CRON_LOG_CONTENT = [
    "backup.sh completed successfully",
    "cert-renew.sh: no action needed",
    `vault-sync.sh completed successfully -- nightly backup mirrored to ${M01_LEDGERVAULT_DOMAIN}`,
].join("\n");
export const M01_DUMMY_SYSTEM_LOG_CONTENT = [
    "disk usage at 62%",
    "service nginx restarted",
].join("\n");

export const M01_TIP_SUBJECT = "you should look into this";
export const M01_TIP_CONTENT = [
    "Found this while digging through leaked broker chatter.",
    "One name keeps coming up -- an ops guy who isn't exactly careful about what he posts online.",
    "",
    "Search around for a handle close to \"opsadmin\". Start there.",
    "",
    "Be careful. Whoever runs this isn't small-time.",
].join("\n");

export const M01_CASE_ID = "CASE-A7X-0417";
export const M01_NETWORK_MAP_CONTENT = [
    "NETWORK MAP -- internal reference, do not distribute",
    "target: hospital network, SEA region (see ROW 0417)",
    `entry point: ${M01_DOMAIN} / med-sea-0417 listing`,
    `primary access: ${M01_TARGET_IP} (opsadmin)`,
    "notes: buyer requested rush delivery, map finalized ahead of schedule",
].join("\n");

export const M01_BROKER_LISTING_URL = `${M01_DOMAIN}${M01_HIDDEN_PATH.replace(/\/$/, "")}`;

export const M01_REPORT_SUBJECT = "Broker identified — buyer alias attached";
export const M01_REPORT_TEMPLATE_ID = "flatline.m01.report";
export const M01_REPORT_TEMPLATE_LABEL = "Mission 1 Findings";
export const M01_REPORT_TEMPLATE_CONTENT = [
    "FINDINGS",
    "--------",
    "Broker: {{broker}}",
    "Buyer: {{buyer}}",
    "Case: {{caseId}}",
    "",
    "Source: compromised sales ledger + IRC chatter.",
].join("\n");
export const M01_REPORT_BODY = [
    "FINDINGS",
    "--------",
    `Broker: ${M01_BROKER_LISTING_URL}`,
    `Buyer: ${M01_BUYER_ALIAS}`,
    `Case: ${M01_CASE_ID}`,
    "",
    "Source: compromised sales ledger + IRC chatter.",
].join("\n");

export const M01_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M01_TIPSTER_EMAIL = ANONYMOUS_TIPSTER.email;

export const M01_CUSTODIAN_SUBJECT = "standing instructions";
export const M01_CUSTODIAN_CONTENT = [
    "Everything you find goes here. No exceptions, no other channel.",
    "I'll reach out if there's a problem. Otherwise, don't expect a reply.",
].join("\n");

export const M01_FRONT_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "FILTERED", service: "ssh" },
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_FIREWALL_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "OPEN", service: "http" },
];

export const M01_OBJECTIVE_IDS = {
    accessListing: "m01.objective.00",
    accessBackend: "m01.objective.01",
    confirmViaChat: "m01.objective.02",
    reportFindings: "m01.objective.03",
} as const;

export const M01_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M01_OBJECTIVE_IDS.accessListing,
        description: "Track down the broker's real storefront and find the hidden listing for the hospital sale",
    },
    {
        name: M01_OBJECTIVE_IDS.accessBackend,
        description: "Get past whatever's guarding the storefront and into the broker's real backend server",
        unlocksAfter: [M01_OBJECTIVE_IDS.accessListing],
    },
    {
        name: M01_OBJECTIVE_IDS.confirmViaChat,
        description: "Confirm what you've found through the broker's own private channel",
        unlocksAfter: [M01_OBJECTIVE_IDS.accessBackend],
    },
    {
        name: M01_OBJECTIVE_IDS.reportFindings,
        description: "Send your findings to the dead drop",
        unlocksAfter: [M01_OBJECTIVE_IDS.confirmViaChat],
    },
];

export const M01_REWARDS = {
    money: 250,
    xp: 60,
} as const;
