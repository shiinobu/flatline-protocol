import type { NetworkVulnerability } from "@hotbunny/hackhub-content-sdk";

import type { DomainSpec } from "../../core/types.js";

export const M02_ROOT_DOMAIN = "tr4c3404.dev";
export const M02_ROOT_IP = "203.0.113.140";
export const M02_ADMIN_PATH = "/admin/";

export const M02_DEV_SUBDOMAIN = "f3a91b7c04d8.tr4c3404.dev";
export const M02_DEV_IP = "139.162.45.98";
export const M02_DEV_ROUTER_IP = "66.0.34.201";

export const M02_DECOY_SUBDOMAIN_1 = "9c71ff0362bb.tr4c3404.dev";
export const M02_DECOY_SUBDOMAIN_1_ROUTER_IP = "85.203.44.12";
export const M02_DECOY_SUBDOMAIN_1_IP = "62.44.187.9";

export const M02_DECOY_SUBDOMAIN_2 = "40e9a8d1c256.tr4c3404.dev";
export const M02_DECOY_SUBDOMAIN_2_ROUTER_IP = "78.140.22.63";
export const M02_DECOY_SUBDOMAIN_2_IP = "196.51.88.41";

export interface M02EmptySubdomain {
    readonly label: string;
    readonly ip: string;
}

export const M02_EMPTY_SUBDOMAINS: readonly M02EmptySubdomain[] = [
    { label: "0a06a6f0a053", ip: "192.0.2.1" },
    { label: "0d51b011d25c", ip: "192.0.2.2" },
    { label: "125883da80c0", ip: "192.0.2.7" },
    { label: "214a870024a0", ip: "192.0.2.8" },
    { label: "2d9604185836", ip: "192.0.2.11" },
    { label: "2db9e6d972c3", ip: "192.0.2.20" },
    { label: "2f1334dbe46e", ip: "192.0.2.22" },
    { label: "3f72f5c2f5d5", ip: "192.0.2.26" },
    { label: "6138bc919a84", ip: "192.0.2.35" },
    { label: "664ee66f3f60", ip: "192.0.2.64" },
    { label: "66c5f4e17f3c", ip: "192.0.2.78" },
    { label: "72f22272fbaa", ip: "192.0.2.83" },
    { label: "73b0430b66b4", ip: "192.0.2.84" },
    { label: "75fd4fa46333", ip: "192.0.2.99" },
    { label: "770db916b2f1", ip: "192.0.2.100" },
    { label: "779a82193316", ip: "192.0.2.105" },
    { label: "7a28e15d1786", ip: "192.0.2.110" },
    { label: "90affa6785e4", ip: "192.0.2.112" },
    { label: "95fd4a33d706", ip: "192.0.2.120" },
    { label: "964b198a7a97", ip: "192.0.2.129" },
    { label: "974db67ee3c9", ip: "192.0.2.132" },
    { label: "9a59444099a3", ip: "192.0.2.137" },
    { label: "ae2527252d5e", ip: "192.0.2.153" },
    { label: "b13969b5cabf", ip: "192.0.2.155" },
    { label: "b2e00732f43e", ip: "192.0.2.159" },
    { label: "b583f97bb10a", ip: "192.0.2.185" },
    { label: "c1e5e8c77046", ip: "192.0.2.199" },
    { label: "cce9531d006c", ip: "192.0.2.202" },
    { label: "d245e5d854b7", ip: "192.0.2.204" },
    { label: "d277c633421a", ip: "192.0.2.205" },
    { label: "d5c14fb12afe", ip: "192.0.2.209" },
    { label: "d9ba27d6b748", ip: "192.0.2.214" },
    { label: "db55f24bc491", ip: "192.0.2.215" },
    { label: "df8673e40596", ip: "192.0.2.216" },
    { label: "e3ae94c31d5e", ip: "192.0.2.229" },
    { label: "eea99a2f2eb9", ip: "192.0.2.231" },
    { label: "fc24ae0ec696", ip: "192.0.2.232" },
];

export const M02_WORKSTATION_ROUTER_IP = "24.187.92.14";
export const M02_WORKSTATION_ROUTER_LAN_IP = "192.168.1.1";
export const M02_SPLITTER_IP = "88.212.67.19";
export const M02_SPLITTER_LAN_IP = "192.168.1.2";
export const M02_FIREWALL_IP = "156.38.94.201";
export const M02_FIREWALL_LAN_IP = "192.168.1.3";
export const M02_PRINTER_IP = "41.203.118.6";
export const M02_PRINTER_LAN_IP = "192.168.1.4";
export const M02_WIFI_EXTENDER_IP = "45.89.127.53";
export const M02_WIFI_EXTENDER_LAN_IP = "192.168.1.5";
export const M02_WIFI_EXTENDER_CODENAME = "Ghost-Relay";
export const M02_HOME_NAS_IP = "178.62.193.44";
export const M02_HOME_NAS_LAN_IP = "192.168.1.6";
export const M02_HOME_NAS_CODENAME = "Rust-Bucket";
export const M02_HOME_NAS_USERNAME = "admin";
export const M02_HOME_NAS_PASSWORD = "admin";
export const M02_SMART_TV_IP = "92.118.36.71";
export const M02_SMART_TV_LAN_IP = "192.168.1.7";
export const M02_SMART_TV_CODENAME = "Glass-Eye";
export const M02_CAMERA_IP = "154.16.94.28";
export const M02_CAMERA_LAN_IP = "192.168.1.8";
export const M02_CAMERA_CODENAME = "Night-Owl";
export const M02_WORKSTATION_IP = "71.192.14.230";
export const M02_WORKSTATION_LAN_IP = "192.168.1.9";
export const M02_WORKSTATION_CODENAME = "Stale-Fork";
export const M02_WORKSTATION_USERNAME = "tr4c3404";
export const M02_WORKSTATION_RDP_VERSION = "FreeRDP 7.1.9";
export const M02_GAME_CONSOLE_IP = "103.224.182.19";
export const M02_GAME_CONSOLE_LAN_IP = "192.168.1.10";
export const M02_GAME_CONSOLE_CODENAME = "Dead-Pixel";

export const M02_CLOSER_RIG_IP = "62.171.45.90";
export const M02_CLOSER_RIG_ROUTER_IP = "109.94.27.183";
export const M02_CLOSER_RIG_CODENAME = "Closer-Rig";
export const M02_CLOSER_RIG_RDP_VERSION = "FreeRDP 2.7.3";

export const M02_ADMIN_USERNAME = "root";
export const M02_ADMIN_HASH = "2f660d2a2ebe2a2d21f92d9a2ac95ac0";
export const M02_ADMIN_PASSWORD = "Zx8kTq21mR";

export const M02_ROUTER_IPS: readonly string[] = [
    M02_ROOT_IP,
    M02_DEV_ROUTER_IP,
    M02_DECOY_SUBDOMAIN_1_ROUTER_IP,
    M02_DECOY_SUBDOMAIN_2_ROUTER_IP,
    M02_CLOSER_RIG_ROUTER_IP,
    M02_WORKSTATION_ROUTER_IP,
];

export const M02_SQL_INJECTION: readonly NetworkVulnerability[] = [{ type: "SQL_INJECTION" }];

export const M02_DOMAIN_RECORDS: readonly DomainSpec[] = [
    { name: M02_ROOT_DOMAIN, ip: M02_ROOT_IP, needsSubnet: false },
];

const emptySubdomainRecord = ({ label, ip }: M02EmptySubdomain): DomainSpec => ({
    name: `${label}.${M02_ROOT_DOMAIN}`,
    ip,
    needsSubnet: true,
});

const byName = (a: DomainSpec, b: DomainSpec): number => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

export const M02_SUBDOMAIN_RECORDS: readonly DomainSpec[] = [
    { name: M02_DEV_SUBDOMAIN, ip: M02_DEV_IP, needsSubnet: false, vulnerabilities: M02_SQL_INJECTION },
    {
        name: M02_DECOY_SUBDOMAIN_1,
        ip: M02_DECOY_SUBDOMAIN_1_IP,
        needsSubnet: false,
        vulnerabilities: M02_SQL_INJECTION,
    },
    {
        name: M02_DECOY_SUBDOMAIN_2,
        ip: M02_DECOY_SUBDOMAIN_2_IP,
        needsSubnet: false,
        vulnerabilities: M02_SQL_INJECTION,
    },
    ...M02_EMPTY_SUBDOMAINS.map(emptySubdomainRecord),
].sort(byName);
