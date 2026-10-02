import type { DomainSpec } from "../../core/types.js";
import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";

export { M04_ARCHITECT_VPN_IP };

export const M07_ROUTER_IP = M04_ARCHITECT_VPN_IP;
export const M07_ROUTER_LAN_IP = "192.168.1.1";

export const M07_SPLITTER_IP = "45.76.180.9";
export const M07_SPLITTER_LAN_IP = "192.168.1.2";

export const M07_FIREWALL_IP = "194.60.38.12";
export const M07_FIREWALL_LAN_IP = "192.168.1.3";
export const M07_FIREWALL_LABEL = "ash-gate";
export const M07_FIREWALL_USERNAME = "fw.admin";
export const M07_FIREWALL_PASSWORD = "Ashgate#2022r2";

export const M07_C2_IP = "203.0.113.161";
export const M07_C2_LAN_IP = "192.168.1.4";
export const M07_C2_SERVICE_USERNAME = "svc-cms";
export const M07_C2_CMS_VERSION = "LegacyCMS 2.1";
export const M07_C2_RDP_VERSION = "FreeRDP 5.2.1";

export const M07_NULLCROWN_IP = "185.220.101.42";
export const M07_NULLCROWN_LAN_IP = "192.168.1.5";
export const M07_NULLCROWN_CODENAME = "Null-Crown";
export const M07_NULLCROWN_SSH_VERSION = "OpenSSH 9.6";
export const M07_NULLCROWN_RETIRED_YEAR = "2019";

export const M07_ASHVECTOR_IP = "146.70.44.18";
export const M07_ASHVECTOR_LAN_IP = "192.168.1.6";
export const M07_ASHVECTOR_CODENAME = "Ash-Vector";
export const M07_ASHVECTOR_SSH_VERSION = "OpenSSH 5.3";
export const M07_ASHVECTOR_RETIRED_YEAR = "2022";

export const M07_DEAD_BOX_USERNAME = "admin";
export const M07_DEAD_BOX_PASSWORD = "admin";

export const M07_SSH_PORT = 22;
export const M07_HTTP_PORT = 80;
export const M07_HTTPS_PORT = 443;
export const M07_RDP_PORT = 3389;

export const M07_LEGACY_CMS_PATH = "/legacy-cms/";

export const M07_ROUTER_IPS: readonly string[] = [M07_ROUTER_IP];

export const M07_DOMAIN_RECORDS: readonly DomainSpec[] = [];
