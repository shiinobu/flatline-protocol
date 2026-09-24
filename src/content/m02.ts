import type { QuestDialogDefinition, QuestObjectiveDefinition, Shell } from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT, M04_ARCHITECT_VPN_IP } from "./characters.js";
import { M01_CASE_ID } from "./m01.js";

export const M02_ROOT_DOMAIN = "tr4c3404.dev";
export const M02_ROOT_IP = "203.0.113.140";
export const M02_DEV_SUBDOMAIN = "f3a91b7c04d8.tr4c3404.dev";
export const M02_DEV_IP = "139.162.45.98";
export const M02_DEV_ROUTER_IP = "66.0.34.201";

export const M02_DECOY_SUBDOMAIN_1 = "9c71ff0362bb.tr4c3404.dev";
export const M02_DECOY_SUBDOMAIN_1_ROUTER_IP = "85.203.44.12";
export const M02_DECOY_SUBDOMAIN_1_IP = "62.44.187.9";
export const M02_DECOY_SUBDOMAIN_1_README_CONTENT =
    "old staging box, meant to tear this down months ago. nothing here anymore.";

export const M02_DECOY_SUBDOMAIN_2 = "40e9a8d1c256.tr4c3404.dev";
export const M02_DECOY_SUBDOMAIN_2_ROUTER_IP = "78.140.22.63";
export const M02_DECOY_SUBDOMAIN_2_IP = "196.51.88.41";
export const M02_DECOY_SUBDOMAIN_2_NOTES_CONTENT =
    "client demo, contract fell through, never took it down.";

export interface M02EmptySubdomain {
    readonly label: string;
    readonly ip: string;
}

export const M02_EMPTY_SUBDOMAINS: M02EmptySubdomain[] = [
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
export const M02_WORKSTATION_IP = "71.192.14.230";
export const M02_WORKSTATION_LAN_IP = "192.168.1.9";
export const M02_WORKSTATION_CODENAME = "Stale-Fork";
export const M02_PRINTER_IP = "41.203.118.6";
export const M02_PRINTER_LAN_IP = "192.168.1.4";

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

export const M02_WIFI_EXTENDER_IP = "45.89.127.53";
export const M02_WIFI_EXTENDER_LAN_IP = "192.168.1.5";
export const M02_WIFI_EXTENDER_CODENAME = "Ghost-Relay";

export const M02_GAME_CONSOLE_IP = "103.224.182.19";
export const M02_GAME_CONSOLE_LAN_IP = "192.168.1.10";
export const M02_GAME_CONSOLE_CODENAME = "Dead-Pixel";

export const M02_CLOSER_RIG_IP = "62.171.45.90";
export const M02_CLOSER_RIG_ROUTER_IP = "109.94.27.183";
export const M02_CLOSER_RIG_HANDLE = "Qu0taCl0ser";
export const M02_CLOSER_RIG_CODENAME = "Closer-Rig";

export const M02_ADMIN_PATH = "/admin/";

export const M02_DB_USER = "panel_svc";
export const M02_DB_PASSWORD = "svc_internal_only";

export const M02_ADMIN_USERNAME = "root";
export const M02_ADMIN_HASH = "2f660d2a2ebe2a2d21f92d9a2ac95ac0";
export const M02_ADMIN_PASSWORD = "Zx8kTq21mR";

export const M02_AFFILIATE_TABLE = "affiliates";
export const M02_ADMINS_TABLE = "admins";

export const M02_DEPLOY_LOG_FILE_NAME = "deploy";
export const M02_DEPLOY_LOG_FILE_EXTENSION = "log";
export const M02_DEPLOY_LOG_CONTENT = [
    "DEPLOY LOG — build-affiliate-panel",
    "===================================",
    "",
    "2026-08-14 02:14 UTC — pushed payload_v9 to affiliate mirror.",
    `2026-08-14 02:41 UTC — client ${M01_CASE_ID} confirmed lock, ransom note delivered.`,
    "2026-08-14 09:02 UTC — client escrow released, payout queued.",
    "2026-08-14 09:15 UTC — payout paperwork archived to the home workstation per usual, don't leave it on the panel server.",
].join("\n");

export const M02_DIALOG: QuestDialogDefinition = {
    default: [
        {
            speaker: "GHOSTWIRE",
            text: `${M01_CASE_ID}. August 14th, 2026.`,
            timeout: 1800,
        },
        {
            speaker: "GHOSTWIRE",
            text: "Same case. Same day my sibling never came out of surgery.",
            timeout: 1800,
        },
        {
            speaker: "GHOSTWIRE",
            text: "This is the log. This is the person who actually deployed it.",
            isEnd: true,
        },
    ],
    aftermath: [
        {
            speaker: "GHOSTWIRE",
            text: "Got everything. Didn't expect it to feel like this.",
            timeout: 1800,
        },
        {
            speaker: "GHOSTWIRE",
            text: "He builds it. Someone else profits off it. Somewhere there's someone who owns them both.",
            timeout: 1800,
        },
        {
            speaker: "GHOSTWIRE",
            text: "One name was never going to be enough.",
            isEnd: true,
        },
    ],
};

export const M02_SYNC_SCRIPT_FILE_NAME = "sync-home";
export const M02_SYNC_SCRIPT_FILE_EXTENSION = "txt";
export const M02_SYNC_SCRIPT_CONTENT = [
    "#!/bin/bash",
    "# quick and dirty until the new archive box is up -- don't ask",
    "# NAS is still on the factory admin login, never got around to it",
    `rsync -az ./payouts/ tr4c3404@${M02_WORKSTATION_ROUTER_IP}:/home/tr4c3404/incoming/`,
    `ssh tr4c3404@${M02_WORKSTATION_ROUTER_IP} 'echo synced >> ~/incoming/.log'`,
].join("\n");

export const M02_FINANCIAL_DOC_FILE_NAME = "wire_authorization";
export const M02_FINANCIAL_DOC_FILE_EXTENSION = "pdf";
export const M02_SHELL_COMPANY_NAME = "Skynet Import-Export Co.";
export const M02_FINANCIAL_DOC_CONTENT = [
    "WIRE AUTHORIZATION — INTERNAL",
    "==============================",
    "",
    `Beneficiary: ${M02_SHELL_COMPANY_NAME}`,
    "Purpose: consulting services (logistics)",
    "Amount: escrow release, ransom payout batch",
    "Authorized by: dev ops",
].join("\n");

export const M02_WORKSTATION_ERRANDS_FILE_NAME = "errands";
export const M02_WORKSTATION_ERRANDS_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_ERRANDS_CONTENT = [
    "- pick up dry cleaning",
    "- dog needs the vet thursday",
    "- pay internet bill (autopay keeps failing??)",
    "- ask about the fence quote",
].join("\n");

export const M02_WORKSTATION_UNSENT_FILE_NAME = "unsent";
export const M02_WORKSTATION_UNSENT_FILE_EXTENSION = "txt";
export const M02_WORKSTATION_UNSENT_CONTENT = [
    "hey sorry been slammed with work this week, can we do dinner sunday",
    "instead? tell mom I said hi",
].join("\n");

export const M02_AFFILIATE_ENDPOINTS_FILE_NAME = "affiliate_endpoints";
export const M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION = "txt";
export const M02_AFFILIATE_ENDPOINTS_CONTENT = [
    "old panel notes -- backup, don't need this after the migration but",
    "never got around to deleting it",
    "",
    `fin-na op checks in through the usual box, ${M02_CLOSER_RIG_IP} last I`,
    "checked. ping first, don't just show up unannounced.",
].join("\n");

export const M02_QUOTA_REPORT_FILE_NAME = "quota_report";
export const M02_QUOTA_REPORT_FILE_EXTENSION = "txt";
export const M02_QUOTA_REPORT_CONTENT = [
    "AFFILIATE PERFORMANCE — Q3 SUMMARY",
    "===================================",
    "",
    "Closes this quarter: 4",
    "Close rate: 94%",
    "Avg time-to-lock: 11 days",
    "",
    "Top account: FIN-NA-0091 -- closed 6 days ahead of forecast, escrow",
    "released same week. Bonus tier unlocked, nice work team (well, me).",
    "",
    "Reminder to self: keep response time under 24h on new leads or panel",
    "flags you for review. Nobody wants that conversation again.",
].join("\n");

export const M02_ROUTING_NOTES_FILE_NAME = "routing_notes";
export const M02_ROUTING_NOTES_FILE_EXTENSION = "txt";
export const M02_ROUTING_NOTES_CONTENT = [
    "ROUTING NOTES -- DO NOT SEND IN CHAT AGAIN",
    "",
    "Architect's cut goes out same day as settlement, not next-day like",
    "before -- they flagged it twice already.",
    "",
    `Confirm via the usual channel: ${M04_ARCHITECT_VPN_IP}. Don't ask questions,`,
    "just confirm and move on.",
].join("\n");

export const M02_TIP_SUBJECT = "re: your last report";
export const M02_TIP_CONTENT = [
    "Good work on the buyer alias.",
    "",
    "Whatever else was sitting in that vault wasn't just backup copies. Go",
    "back through it -- there's a name in there that hasn't led anywhere yet.",
    "",
    "Send what you find the same way as before.",
].join("\n");

export const M02_CASE_MATCH_RANSOM_AMOUNT = 2850000;
export const M02_CASE_MATCH_SETTLED_AT = "2026-08-14";
export const M02_VICTIM_CASE_ID_EU = "LOG-EU-2209";
export const M02_VICTIM_CASE_ID_NA = "FIN-NA-0091";

export const M02_REPORT_SUBJECT = "Toolkit developer confirmed — shell company named";
export const M02_REPORT_TEMPLATE_ID = "flatline.m02.report";
export const M02_REPORT_TEMPLATE_LABEL = "Mission 2 Findings";
export const M02_REPORT_TEMPLATE_CONTENT = [
    "Developer: {{developer_url}}",
    "Shell company: {{shellCompany}}",
    `Case match: ${M01_CASE_ID} -- ransom $${M02_CASE_MATCH_RANSOM_AMOUNT.toLocaleString("en-US")}, settled ${M02_CASE_MATCH_SETTLED_AT}`,
    `Pattern: not isolated -- Q3 closes: 4, other confirmed victims (${M02_VICTIM_CASE_ID_NA}, ${M02_VICTIM_CASE_ID_EU})`,
    "Unresolved: a routing note ties payouts to a second signer above the shell company -- source and identity unconfirmed.",
    "",
    "Confirmed via affiliate panel dump, deployment logs and workstation extraction.",
    `Attached: ${M02_FINANCIAL_DOC_FILE_NAME}.${M02_FINANCIAL_DOC_FILE_EXTENSION}`,
].join("\n");
export const M02_REPORT_BODY = [
    `Developer: ${M02_DEV_SUBDOMAIN}`,
    `Shell company: ${M02_SHELL_COMPANY_NAME}`,
    `Case match: ${M01_CASE_ID} -- ransom $${M02_CASE_MATCH_RANSOM_AMOUNT.toLocaleString("en-US")}, settled ${M02_CASE_MATCH_SETTLED_AT}`,
    `Pattern: not isolated -- Q3 closes: 4, other confirmed victims (${M02_VICTIM_CASE_ID_NA}, ${M02_VICTIM_CASE_ID_EU})`,
    "Unresolved: a routing note ties payouts to a second signer above the shell company -- source and identity unconfirmed.",
    "",
    "Confirmed via affiliate panel dump, deployment logs and workstation extraction.",
    `Attached: ${M02_FINANCIAL_DOC_FILE_NAME}.${M02_FINANCIAL_DOC_FILE_EXTENSION}`,
].join("\n");

export const M02_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M02_ROOT_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M02_DEV_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "OPEN", service: "ssh", version: "OpenSSH 7.2" },
    { port: 443, status: "OPEN", service: "https", version: "nginx 1.10 (EOL)" },
];

export const M02_OBJECTIVE_IDS = {
    reportFindings: "m02.objective.07",
} as const;

export const M02_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M02_OBJECTIVE_IDS.reportFindings,
        description:
            "Trace the toolkit developer behind the affiliate panel -- breach it from the root domain down to the dev server, dig up a lead to the developer's home network, and pull the financial document that names the shell company -- then report what you find to the dead drop.",
    },
];

export const M02_REWARDS = {
    money: 400,
    xp: 90,
} as const;
