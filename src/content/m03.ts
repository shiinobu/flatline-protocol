import type { QuestObjectiveDefinition, Shell } from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT } from "./characters.js";
import { M02_SHELL_COMPANY_NAME } from "./m02.js";

export const M03_SKYNET_DOMAIN = "skynet-importexport.biz";
export const M03_SKYNET_IP = "203.0.113.150";

export const M03_PFSENSE_IP = "203.0.113.151";
export const M03_PFSENSE_LAN_IP = "10.50.0.1";
export const M03_SPLITTER_IP = "10.50.0.2";

export const M03_COINDRIFT_IP = "10.50.0.3";
export const M03_COINDRIFT_CODENAME = "Coin-Drift";

export const M03_ACCOMPLICE_IP = "10.50.0.4";
export const M03_ACCOMPLICE_CODENAME = "Faded-Ledger";
export const M03_ACCOMPLICE_USERNAME = "d.reyes";
export const M03_ACCOMPLICE_PASSWORD = "Reyes_Family2024";

export const M03_MX_HOST = "mail.skynet-importexport.biz";

export const M03_FINANCE_EMPLOYEE_HANDLE = "@d.reyes";
export const M03_LEAK_PATTERN = "company name + year, always ends in an exclamation mark";

export const M03_PFSENSE_USERNAME = "admin";
export const M03_PFSENSE_PASSWORD = "SknTrade2024!";

export const M03_FINANCE_USERNAME = "finance_svc";
export const M03_FINANCE_PASSWORD = "internal_only_2024";

export const M03_LEDGER_TABLE = "wire_transfers";
export const M03_PARENT_ENTITY_NAME = "SKN Capital Nominees";

export const M03_SPREADSHEET_FILE_NAME = "q1_reconciliation";
export const M03_SPREADSHEET_FILE_EXTENSION = "xlsx";
export const M03_ACCOMPLICE_NAME = "D. Reyes";
export const M03_SPREADSHEET_CONTENT = [
    "Q1 RECONCILIATION — INTERNAL DRAFT",
    "===================================",
    "",
    `Prepared by: ${M03_ACCOMPLICE_NAME} (Finance)`,
    `Parent entity on file: ${M03_PARENT_ENTITY_NAME}`,
    "Note: batch payouts routed through 'consulting fees' line item again.",
    "Note: told this is normal for the holding company's structure. Hope that's true.",
].join("\n");

export const M03_TIP_SUBJECT = "shell company confirmed — dig into it";
export const M03_TIP_CONTENT = [
    `The financial document you pulled names ${M02_SHELL_COMPANY_NAME}.`,
    "That's the account the ransom payouts actually clear through.",
    "",
    `Public site: ${M03_SKYNET_DOMAIN}`,
    "Follow the money.",
].join("\n");

export const M03_REPORT_SUBJECT = "Shell company laundering confirmed — parent entity named";
export const M03_REPORT_TEMPLATE_ID = "flatline.m03.report";
export const M03_REPORT_TEMPLATE_LABEL = "Mission 3 Findings";
export const M03_REPORT_TEMPLATE_CONTENT = [
    "Shell company: {{shellCompany}}",
    "Parent entity: {{parentEntity}}",
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
].join("\n");
export const M03_REPORT_BODY = [
    `Shell company: ${M02_SHELL_COMPANY_NAME}`,
    `Parent entity: ${M03_PARENT_ENTITY_NAME}`,
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
].join("\n");

export const M03_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M03_SKYNET_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M03_OBJECTIVE_IDS = {
    reviewLead: "m03.objective.00",
    scanPublicSite: "m03.objective.01",
    reconPublicSite: "m03.objective.02",
    mapEmailFormat: "m03.objective.03",
    findPasswordLeak: "m03.objective.04",
    crackPfsenseLogin: "m03.objective.05",
    pivotViaNat: "m03.objective.06",
    captureInternalTraffic: "m03.objective.07",
    dumpFinanceLedger: "m03.objective.08",
    bonusExploreShare: "m03.objective.09",
    revertNatRule: "m03.objective.10",
    reportFindings: "m03.objective.11",
} as const;

export const M03_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M03_OBJECTIVE_IDS.reviewLead,
        description: "Review the lead on the shell company",
    },
    {
        name: M03_OBJECTIVE_IDS.scanPublicSite,
        description: "Scan the shell company's public site",
        unlocksAfter: [M03_OBJECTIVE_IDS.reviewLead],
    },
    {
        name: M03_OBJECTIVE_IDS.reconPublicSite,
        description: "Run OSINT on the shell company's domain",
        unlocksAfter: [M03_OBJECTIVE_IDS.scanPublicSite],
    },
    {
        name: M03_OBJECTIVE_IDS.mapEmailFormat,
        description: "Map the company's mail infrastructure",
        unlocksAfter: [M03_OBJECTIVE_IDS.reconPublicSite],
    },
    {
        name: M03_OBJECTIVE_IDS.findPasswordLeak,
        description: "A finance employee has been careless about what they post publicly — see what turns up.",
        unlocksAfter: [M03_OBJECTIVE_IDS.mapEmailFormat],
    },
    {
        name: M03_OBJECTIVE_IDS.crackPfsenseLogin,
        description: "Brute-force the company's pfSense admin login",
        unlocksAfter: [M03_OBJECTIVE_IDS.findPasswordLeak],
    },
    {
        name: M03_OBJECTIVE_IDS.pivotViaNat,
        description: "Add a temporary NAT rule to pivot into the finance VLAN",
        unlocksAfter: [M03_OBJECTIVE_IDS.crackPfsenseLogin],
    },
    {
        name: M03_OBJECTIVE_IDS.captureInternalTraffic,
        description: "Capture internal traffic on the finance VLAN",
        unlocksAfter: [M03_OBJECTIVE_IDS.pivotViaNat],
    },
    {
        name: M03_OBJECTIVE_IDS.dumpFinanceLedger,
        description: "Dump the internal wire-transfer ledger",
        unlocksAfter: [M03_OBJECTIVE_IDS.captureInternalTraffic],
    },
    {
        name: M03_OBJECTIVE_IDS.bonusExploreShare,
        description: "There's a chance something else worth seeing sits on the same shared drive.",
        unlocksAfter: [M03_OBJECTIVE_IDS.captureInternalTraffic],
    },
    {
        name: M03_OBJECTIVE_IDS.revertNatRule,
        description: "Revert the NAT rule before leaving",
        unlocksAfter: [M03_OBJECTIVE_IDS.dumpFinanceLedger],
    },
    {
        name: M03_OBJECTIVE_IDS.reportFindings,
        description: "Send your findings to the dead drop",
        unlocksAfter: [M03_OBJECTIVE_IDS.revertNatRule],
    },
];

export const M03_REWARDS = {
    money: 550,
    xp: 120,
} as const;
