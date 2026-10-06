export const M01_ROUTER_IP = "91.198.174.3";
export const M01_ROUTER_LAN_IP = "192.168.1.1";

export const M01_FIREWALL_ROUTER_IP = "45.132.11.1";
export const M01_FIREWALL_ROUTER_LAN_IP = "192.168.2.1";
export const M01_FIREWALL_IP = "45.132.11.87";
export const M01_FIREWALL_LAN_IP = "192.168.2.2";

export const M01_TARGET_IP = "77.91.14.203";
export const M01_TARGET_LAN_IP = "192.168.1.3";

export const M01_BLACKWIRE_ROUTER_IP = "198.51.100.230";
export const M01_BLACKWIRE_ROUTER_LAN_IP = "192.168.3.1";
export const M01_BLACKWIRE_IP = "198.51.100.77";
export const M01_BLACKWIRE_LAN_IP = "192.168.3.2";
export const M01_LEGACY_IP = "198.51.100.212";
export const M01_LEGACY_LAN_IP = "192.168.3.3";
export const M01_LEGACY_USERNAME = "admin";
export const M01_LEGACY_PASSWORD = "admin123";

export const M01_DOMAIN = "blackwire-network.mkt";
export const M01_BLACKWIRE_GATEWAY_IP = "198.51.100.245";
export const M01_BLACKWIRE_GATEWAY_LAN_IP = "192.168.3.4";
export const M01_BLACKWIRE_GATEWAY_USERNAME = "netops";
export const M01_BLACKWIRE_GATEWAY_PASSWORD = "netops2022";

export const M01_BROKER_ALIAS = "X7xS3NTRY9";

export const M01_BROKER_INFRA_DOMAIN = "x7xsentry9.tech";
export const M01_BROKER_INFRA_IP = "194.36.108.20";
export const M01_BROKER_BACKEND_SUBDOMAIN = `be7.${M01_BROKER_INFRA_DOMAIN}`;
export const M01_BROKER_FIREWALL_SUBDOMAIN = `fw7.${M01_BROKER_INFRA_DOMAIN}`;

export const M01_FROSTGATE_DOMAIN = "frostgate-exchange.mkt";
export const M01_FROSTGATE_ROUTER_IP = "91.243.67.1";
export const M01_FROSTGATE_ROUTER_LAN_IP = "192.168.4.1";
export const M01_FROSTGATE_IP = "91.243.67.210";
export const M01_FROSTGATE_LAN_IP = "192.168.4.2";
export const M01_FROSTGATE_GATEWAY_IP = "91.243.67.220";
export const M01_FROSTGATE_GATEWAY_LAN_IP = "192.168.4.3";
export const M01_FROSTGATE_GATEWAY_USERNAME = "support";
export const M01_FROSTGATE_GATEWAY_PASSWORD = "support123";

export const M01_FROSTGATE_API_IP = "91.243.67.235";
export const M01_FROSTGATE_API_LAN_IP = "192.168.4.4";
export const M01_FROSTGATE_API_USERNAME = "apiadmin";
export const M01_FROSTGATE_API_PASSWORD = "apiadmin99";

export const M01_OBSIDIAN_DOMAIN = "obsidian-access.mkt";
export const M01_OBSIDIAN_ROUTER_IP = "5.188.94.1";
export const M01_OBSIDIAN_ROUTER_LAN_IP = "192.168.5.1";
export const M01_OBSIDIAN_IP = "5.188.94.130";
export const M01_OBSIDIAN_LAN_IP = "192.168.5.2";
export const M01_OBSIDIAN_GATEWAY_IP = "5.188.94.140";
export const M01_OBSIDIAN_GATEWAY_LAN_IP = "192.168.5.3";
export const M01_OBSIDIAN_GATEWAY_USERNAME = "mirror";
export const M01_OBSIDIAN_GATEWAY_PASSWORD = "mirror2023";

export const M01_OBSIDIAN_API_IP = "5.188.94.155";
export const M01_OBSIDIAN_API_LAN_IP = "192.168.5.4";
export const M01_OBSIDIAN_API_USERNAME = "apisvc";
export const M01_OBSIDIAN_API_PASSWORD = "svc2024api";

export const M01_LEDGERVAULT_DOMAIN = "x7k2m9vdlq4wnyt3.dark";
export const M01_LEDGERVAULT_IP = "185.220.31.6";

export const M01_ESCROW_DOMAIN = "clearescrow.io";
export const M01_ESCROW_IP = "46.29.115.63";
export const M01_ESCROW_APP_IP = "46.29.115.201";

export interface M01DomainRecord {
    readonly name: string;
    readonly ip: string;
    readonly needsSubnet: boolean;
}

export const M01_DOMAIN_RECORDS: M01DomainRecord[] = [
    { name: M01_DOMAIN, ip: M01_BLACKWIRE_IP, needsSubnet: false },
    { name: `www.${M01_DOMAIN}`, ip: "198.51.100.78", needsSubnet: true },
    { name: `gateway.${M01_DOMAIN}`, ip: M01_BLACKWIRE_GATEWAY_IP, needsSubnet: false },
    { name: `mail.${M01_DOMAIN}`, ip: "198.51.100.140", needsSubnet: true },
    { name: `api.${M01_DOMAIN}`, ip: "198.51.100.63", needsSubnet: true },
    { name: `status.${M01_DOMAIN}`, ip: "198.51.100.201", needsSubnet: true },
    { name: `legacy.${M01_DOMAIN}`, ip: M01_LEGACY_IP, needsSubnet: false },
    { name: `failover.${M01_DOMAIN}`, ip: "198.51.100.226", needsSubnet: true },

    { name: M01_FROSTGATE_DOMAIN, ip: M01_FROSTGATE_IP, needsSubnet: false },
    { name: `www.${M01_FROSTGATE_DOMAIN}`, ip: "91.243.67.18", needsSubnet: true },
    { name: `trade.${M01_FROSTGATE_DOMAIN}`, ip: "91.243.67.94", needsSubnet: true },
    { name: `api.${M01_FROSTGATE_DOMAIN}`, ip: M01_FROSTGATE_API_IP, needsSubnet: false },
    { name: `support.${M01_FROSTGATE_DOMAIN}`, ip: "91.243.67.7", needsSubnet: true },
    { name: `status.${M01_FROSTGATE_DOMAIN}`, ip: "91.243.67.230", needsSubnet: true },
    { name: `gateway.${M01_FROSTGATE_DOMAIN}`, ip: M01_FROSTGATE_GATEWAY_IP, needsSubnet: false },
    { name: `wallet.${M01_FROSTGATE_DOMAIN}`, ip: "91.243.67.183", needsSubnet: true },

    { name: M01_ESCROW_DOMAIN, ip: M01_ESCROW_IP, needsSubnet: true },
    { name: `www.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.14", needsSubnet: true },
    { name: `app.${M01_ESCROW_DOMAIN}`, ip: M01_ESCROW_APP_IP, needsSubnet: true },
    { name: `api.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.98", needsSubnet: true },
    { name: `support.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.177", needsSubnet: true },
    { name: `status.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.42", needsSubnet: true },
    { name: `gateway.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.220", needsSubnet: true },
    { name: `partners.${M01_ESCROW_DOMAIN}`, ip: "46.29.115.6", needsSubnet: true },

    { name: M01_OBSIDIAN_DOMAIN, ip: M01_OBSIDIAN_IP, needsSubnet: false },
    { name: `www.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.203", needsSubnet: true },
    { name: `gateway.${M01_OBSIDIAN_DOMAIN}`, ip: M01_OBSIDIAN_GATEWAY_IP, needsSubnet: false },
    { name: `mail.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.61", needsSubnet: true },
    { name: `api.${M01_OBSIDIAN_DOMAIN}`, ip: M01_OBSIDIAN_API_IP, needsSubnet: false },
    { name: `status.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.85", needsSubnet: true },
    { name: `support.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.96", needsSubnet: true },
    { name: `billing.${M01_OBSIDIAN_DOMAIN}`, ip: "5.188.94.107", needsSubnet: true },
];

export const M01_BROKER_USERNAME = "opsadmin";

export const M01_FIREWALL_USERNAME = "failsafe";
export const M01_FIREWALL_PASSWORD = "Gr1dLock#42";

export const M01_TARGET_PASSWORD = "Tn8$rWq3yK1z";

export const M01_TARGET_SSH_TARGET = `${M01_TARGET_IP}:22`;

export const M01_BROKER_LEAD_DOMAIN_RECORDS: M01DomainRecord[] = [
    { name: M01_BROKER_INFRA_DOMAIN, ip: M01_BROKER_INFRA_IP, needsSubnet: true },
    { name: M01_BROKER_BACKEND_SUBDOMAIN, ip: M01_TARGET_IP, needsSubnet: false },
    { name: M01_BROKER_FIREWALL_SUBDOMAIN, ip: M01_FIREWALL_IP, needsSubnet: false },
];

export const M01_ROUTER_IPS: readonly string[] = [
    M01_ROUTER_IP,
    M01_FIREWALL_ROUTER_IP,
    M01_BLACKWIRE_ROUTER_IP,
    M01_FROSTGATE_ROUTER_IP,
    M01_OBSIDIAN_ROUTER_IP,
];
