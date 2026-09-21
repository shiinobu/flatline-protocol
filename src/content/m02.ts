import type { QuestDialogDefinition, QuestObjectiveDefinition, Shell } from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT } from "./characters.js";
import { M01_BUYER_ALIAS } from "./m01.js";

export const M02_ROOT_DOMAIN = "tr4c3404.dev";
export const M02_ROOT_IP = "203.0.113.140";
export const M02_DEV_SUBDOMAIN = "devbox.tr4c3404.dev";
export const M02_DEV_IP = "203.0.113.141";
export const M02_DEV_ROUTER_IP = "66.0.34.201";

export const M02_WORKSTATION_WIFI_IP = "66.0.34.202";
export const M02_WORKSTATION_WIFI_SSID = "TP-Link_8F21";
export const M02_WORKSTATION_WIFI_PASSWORD = "homebase2021";
export const M02_WORKSTATION_IP = "203.0.113.142";
export const M02_WORKSTATION_LAN_IP = "192.168.0.2";
export const M02_WORKSTATION_CODENAME = "Stale-Fork";

export const M02_ADMIN_PATH = "/admin/";

export const M02_DB_USER = "panel_svc";
export const M02_DB_PASSWORD = "svc_internal_only";

export const M02_ADMIN_USERNAME = "root";
export const M02_ADMIN_HASH = "f5b8e356551c3c860a671c107e24c2a9";
export const M02_ADMIN_PASSWORD = "buildfast_2024!";

export const M02_AFFILIATE_TABLE = "affiliates";
export const M02_ADMINS_TABLE = "admins";

export const M02_DEPLOY_LOG_FILE_NAME = "deploy";
export const M02_DEPLOY_LOG_FILE_EXTENSION = "log";
export const M02_DEPLOY_LOG_CONTENT = [
    "DEPLOY LOG — build-affiliate-panel",
    "===================================",
    "",
    "2026-08-14 02:14 UTC — pushed payload_v9 to affiliate mirror.",
    "2026-08-14 02:41 UTC — client MED-SEA-0417 confirmed lock, ransom note delivered.",
    "2026-08-14 09:02 UTC — client escrow released, payout queued.",
    "2026-08-14 09:15 UTC — payout paperwork archived to the home workstation per usual, don't leave it on the panel server.",
].join("\n");

export const M02_DEPLOY_LOG_DIALOG: QuestDialogDefinition = {
    default: [
        {
            speaker: "GHOSTWIRE",
            text: "MED-SEA-0417. August 14th, 2026.",
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
};

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

export const M02_TIP_SUBJECT = "re: your last report";
export const M02_TIP_CONTENT = [
    `Good work on ${M01_BUYER_ALIAS}. That alias traces back to a toolkit developer`,
    "who also runs an affiliate panel for the ransomware itself.",
    "",
    "You've already got a lead on this from the vault -- check what else",
    "was archived there.",
    "",
    "Whatever you find, send it the same way as before.",
].join("\n");

export const M02_REPORT_SUBJECT = "Toolkit developer confirmed — shell company named";
export const M02_REPORT_TEMPLATE_ID = "flatline.m02.report";
export const M02_REPORT_TEMPLATE_LABEL = "Mission 2 Findings";
export const M02_REPORT_TEMPLATE_CONTENT = [
    "Developer: {{developer}}",
    "Shell company: {{shellCompany}}",
    "",
    "Confirmed via affiliate panel dump, deployment logs and workstation extraction.",
].join("\n");
export const M02_REPORT_BODY = [
    `Developer: ${M02_DEV_SUBDOMAIN}`,
    `Shell company: ${M02_SHELL_COMPANY_NAME}`,
    "",
    "Confirmed via affiliate panel dump, deployment logs and workstation extraction.",
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
    reviewLead: "m02.objective.00",
    reconRootDomain: "m02.objective.01",
    breachAffiliatePanel: "m02.objective.02",
    accessDevServer: "m02.objective.03",
    breachWorkstationWifi: "m02.objective.04",
    rootgrabWorkstation: "m02.objective.05",
    downloadFinancialDoc: "m02.objective.06",
    reportFindings: "m02.objective.07",
} as const;

export const M02_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M02_OBJECTIVE_IDS.reviewLead,
        description: "Review the follow-up lead on the buyer alias",
    },
    {
        name: M02_OBJECTIVE_IDS.reconRootDomain,
        description:
            "Trace the root domain past its public face and find where the real work happens.",
        unlocksAfter: [M02_OBJECTIVE_IDS.reviewLead],
    },
    {
        name: M02_OBJECTIVE_IDS.breachAffiliatePanel,
        description:
            "Breach the affiliate panel's database and crack your way into the admin account.",
        unlocksAfter: [M02_OBJECTIVE_IDS.reconRootDomain],
    },
    {
        name: M02_OBJECTIVE_IDS.accessDevServer,
        description:
            "Access the dev server and track down the deployment log — the receipt for the hospital job.",
        unlocksAfter: [M02_OBJECTIVE_IDS.breachAffiliatePanel],
    },
    {
        name: M02_OBJECTIVE_IDS.breachWorkstationWifi,
        description:
            "The deployment log points to a home workstation, off the company's own network entirely. Find the Wi-Fi it sits behind and get onto it.",
        unlocksAfter: [M02_OBJECTIVE_IDS.accessDevServer],
    },
    {
        name: M02_OBJECTIVE_IDS.rootgrabWorkstation,
        description: "Exploit the developer's personal workstation",
        unlocksAfter: [M02_OBJECTIVE_IDS.breachWorkstationWifi],
    },
    {
        name: M02_OBJECTIVE_IDS.downloadFinancialDoc,
        description: "Pull the financial document naming the shell company",
        unlocksAfter: [M02_OBJECTIVE_IDS.rootgrabWorkstation],
    },
    {
        name: M02_OBJECTIVE_IDS.reportFindings,
        description: "Send your findings to the dead drop",
        unlocksAfter: [M02_OBJECTIVE_IDS.downloadFinancialDoc],
    },
];

export const M02_REWARDS = {
    money: 400,
    xp: 90,
} as const;
