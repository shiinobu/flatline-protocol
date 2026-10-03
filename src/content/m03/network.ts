import type { NetworkVulnerability } from "@hotbunny/hackhub-content-sdk";

import type { DomainSpec } from "../../core/types.js";

export const M03_SKYNET_DOMAIN = "skynet-importexport.biz";
export const M03_SKYNET_IP = "203.0.113.150";
export const M03_MX_HOST = "mail.skynet-importexport.biz";
export const M03_REMOTE_PORTAL_DOMAIN = "remote.skynet-importexport.biz";
export const M03_LEDGER_DOMAIN = "ledger.skynet-importexport.biz";

export const M03_PFSENSE_IP = "77.83.142.6";
export const M03_PFSENSE_LAN_IP = "192.168.1.1";
export const M03_COMPANY_SHORT_NAME = "Skynet";
export const M03_POLICY_YEAR = "2024";
export const M03_HYDRA_DEFAULT_USER = "guest";
export const M03_PFSENSE_USERNAME = "admin";
export const M03_PFSENSE_PASSWORD = `${M03_COMPANY_SHORT_NAME}${M03_POLICY_YEAR}!`;
export const M03_PFSENSE_HYDRA_TARGET = `${M03_PFSENSE_IP}:80`;
export const M03_PFSENSE_HYDRA_USERS: readonly string[] = [M03_HYDRA_DEFAULT_USER, M03_PFSENSE_USERNAME];

export const M03_SPLITTER_IP = "91.207.174.33";
export const M03_SPLITTER_LAN_IP = "192.168.1.2";

export const M03_COINDRIFT_IP = "185.107.56.214";
export const M03_COINDRIFT_LAN_IP = "192.168.1.3";
export const M03_COINDRIFT_CODENAME = "Coin-Drift";
export const M03_FINANCE_USERNAME = "finance_svc";
export const M03_FINANCE_PASSWORD = "internal_only_2024";

export const M03_ACCOMPLICE_IP = "62.210.183.77";
export const M03_ACCOMPLICE_LAN_IP = "192.168.1.4";
export const M03_ACCOMPLICE_CODENAME = "Faded-Ledger";
export const M03_ACCOMPLICE_USERNAME = "d.reyes";
export const M03_ACCOMPLICE_PASSWORD = "Reyes_Family2024";
export const M03_ACCOMPLICE_NAME = "D. Reyes";

export const M03_DECOY_HOST_IP = "146.185.239.12";
export const M03_DECOY_HOST_LAN_IP = "192.168.1.5";
export const M03_DECOY_HOST_CODENAME = "Split-Bill";
export const M03_DECOY_HOST_USERNAME = "guest";
export const M03_DECOY_HOST_PASSWORD = "guest";

export const M03_VAULTLINE_IP = "79.124.62.90";
export const M03_VAULTLINE_LAN_IP = "192.168.1.6";
export const M03_VAULTLINE_CODENAME = "Vault-Line";
export const M03_INTERNAL_HOST_COUNT = 4;
export const M03_INTERNAL_NETWORK_FACT = `${M03_INTERNAL_HOST_COUNT} hosts behind the gateway`;
export const M03_VAULTLINE_RDP_VERSION = "FreeRDP 7.1.9";
export const M03_VPN_PEER_LABEL = "SKN-CENTRAL";

export const M03_FINANCE_EMPLOYEE_HANDLE = "@d.reyes";
export const M03_DECOY_EMPLOYEE_HANDLE = "@m.okafor";

export const M03_ROUTER_IPS: readonly string[] = [M03_SKYNET_IP, M03_PFSENSE_IP];

export interface M03ForwardTarget {
    readonly ip: string;
    readonly lanIp: string;
    readonly internal: number;
    readonly service: string;
    readonly version?: string;
    readonly gatedBy?: "ledgerDumped";
}

export const M03_FORWARD_TARGETS: readonly M03ForwardTarget[] = [
    { ip: M03_COINDRIFT_IP, lanIp: M03_COINDRIFT_LAN_IP, internal: 445, service: "smb" },
    { ip: M03_COINDRIFT_IP, lanIp: M03_COINDRIFT_LAN_IP, internal: 3306, service: "mysql", version: "mariadb" },
    { ip: M03_ACCOMPLICE_IP, lanIp: M03_ACCOMPLICE_LAN_IP, internal: 445, service: "smb" },
    { ip: M03_ACCOMPLICE_IP, lanIp: M03_ACCOMPLICE_LAN_IP, internal: 22, service: "ssh" },
    { ip: M03_DECOY_HOST_IP, lanIp: M03_DECOY_HOST_LAN_IP, internal: 445, service: "smb" },
    {
        ip: M03_VAULTLINE_IP,
        lanIp: M03_VAULTLINE_LAN_IP,
        internal: 3389,
        service: "rdp",
        version: M03_VAULTLINE_RDP_VERSION,
        gatedBy: "ledgerDumped",
    },
];

export const M03_SQL_INJECTION: readonly NetworkVulnerability[] = [{ type: "SQL_INJECTION" }];

export const M03_DOMAIN_RECORDS: readonly DomainSpec[] = [
    { name: M03_SKYNET_DOMAIN, ip: M03_SKYNET_IP, needsSubnet: false },
];

export const M03_GATEWAY_LEAD_DOMAIN_RECORDS: readonly DomainSpec[] = [
    { name: M03_REMOTE_PORTAL_DOMAIN, ip: M03_PFSENSE_IP, needsSubnet: false },
    {
        name: M03_LEDGER_DOMAIN,
        ip: M03_COINDRIFT_IP,
        needsSubnet: false,
        vulnerabilities: M03_SQL_INJECTION,
    },
];
