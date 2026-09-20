import type { QuestDialogDefinition, QuestObjectiveDefinition, Shell } from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT } from "./characters.js";
import { M03_PARENT_ENTITY_NAME } from "./m03.js";

export const M04_ARCHITECT_VPN_IP = "203.0.113.160";
export const M04_ROUTER_LAN_IP = "172.16.0.1";

export const M04_FIREWALL_IP = "194.60.38.12";
export const M04_FIREWALL_LAN_IP = "172.16.0.2";

export const M04_SPLITTER_IP = "45.76.180.9";
export const M04_SPLITTER_LAN_IP = "172.16.0.3";

export const M04_C2_IP = "203.0.113.161";
export const M04_C2_LAN_IP = "172.16.0.4";

export const M04_NULLCROWN_IP = "185.220.101.42";
export const M04_NULLCROWN_LAN_IP = "172.16.0.5";
export const M04_NULLCROWN_CODENAME = "Null-Crown";

export const M04_ASHVECTOR_IP = "146.70.44.18";
export const M04_ASHVECTOR_LAN_IP = "172.16.0.6";
export const M04_ASHVECTOR_CODENAME = "Ash-Vector";

export const M04_HONEYPOT_USERNAME = "admin";
export const M04_HONEYPOT_PASSWORD = "admin";
export const M04_HONEYPOT_DECOY_FILE_NAME = "backup_old";
export const M04_HONEYPOT_DECOY_FILE_EXTENSION = "bak";
export const M04_HONEYPOT_DECOY_CONTENT = "cleaned this up months ago, nothing left on this box";

export const M04_HONEYPOT_ALERT_SUBJECT = "SYSTEM ALERT — decoy host touched";
export const M04_HONEYPOT_ALERT_CONTENT = [
    "Someone just poked one of the dead boxes. Real infrastructure doesn't sit that open.",
    "Whoever it is, they're not as careful as they think.",
].join("\n");
export const M04_HONEYPOT_ALERT_FROM = "watchdog@architect-c2.dark";

export const M04_LEGACY_CMS_PATH = "/legacy-cms/";

export const M04_IDENTITY_FILE_NAME = "master_identity_backup";
export const M04_IDENTITY_FILE_EXTENSION = "enc";
export const M04_IDENTITY_FILE_CONTENT = "AES256-CBC::[REDACTED-BINARY-BLOB]";

export const M04_ARCHITECT_REAL_NAME = "Damien Okoro";

export const M04_TIP_SUBJECT = "the VPN IP from the pcap — worth a look";
export const M04_TIP_CONTENT = [
    "One address kept showing up in the finance VLAN capture, every single session.",
    "Not a customer. Not an employee. Somebody who never touches the front door.",
    "",
    `Start here: ${M04_ARCHITECT_VPN_IP}`,
].join("\n");

export const M04_TRAP_WARNING_SUBJECT = "SYSTEM ALERT — unauthorized access detected";
export const M04_TRAP_WARNING_CONTENT = [
    "A read attempt against a protected backup was logged and the file has self-wiped.",
    "Recommend an alternate extraction method next time.",
].join("\n");
export const M04_TRAP_WARNING_FROM = "watchdog@architect-c2.dark";

export const M04_REPORT_SUBJECT = "The Architect identified — your call";
export const M04_REPORT_TEMPLATE_ID = "flatline.m04.report";
export const M04_REPORT_TEMPLATE_LABEL = "Mission 4 Findings";
export const M04_REPORT_TEMPLATE_CONTENT = [
    "The Architect: {{realName}}",
    `Parent entity: ${M03_PARENT_ENTITY_NAME}`,
    "",
    "Decision: {{choice}}",
].join("\n");

export const M04_CHOICE_EXPOSE = "expose";
export const M04_CHOICE_HANDOFF = "handoff";
export const M04_CHOICE_DESTROY = "destroy";
export type M04Choice =
    | typeof M04_CHOICE_EXPOSE
    | typeof M04_CHOICE_HANDOFF
    | typeof M04_CHOICE_DESTROY;

const reportBody = (choice: string): string =>
    [
        `The Architect: ${M04_ARCHITECT_REAL_NAME}`,
        `Parent entity: ${M03_PARENT_ENTITY_NAME}`,
        "",
        `Decision: ${choice}`,
    ].join("\n");

export const M04_REPORT_BODY_EXPOSE = reportBody(M04_CHOICE_EXPOSE);
export const M04_REPORT_BODY_HANDOFF = reportBody(M04_CHOICE_HANDOFF);
export const M04_REPORT_BODY_DESTROY = reportBody(M04_CHOICE_DESTROY);

export const M04_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M04_ARCHITECT_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https", version: "LegacyCMS 2.1" },
];

export const M04_DIALOG: QuestDialogDefinition = {
    default: [
        {
            speaker: "the Custodian",
            text: "You have everything. The Architect's real identity, the whole chain, all of it. What now?",
            options: [
                {
                    label: "Publish everything",
                    text: "It goes public. All of it.",
                    switchBranch: "expose",
                },
                {
                    label: "Hand it to law enforcement",
                    text: "I know someone clean. It goes to them.",
                    switchBranch: "handoff",
                },
                {
                    label: "Destroy it myself",
                    text: "No trial. No leak. I end this myself.",
                    switchBranch: "destroy",
                },
            ],
        },
    ],
    expose: [
        {
            speaker: "GHOSTWIRE",
            text: "Everyone should know what BLACKLEDGER did. Let the world decide what happens next.",
            isEnd: true,
        },
    ],
    handoff: [
        {
            speaker: "GHOSTWIRE",
            text: "This goes through the system, clean. My sibling deserved due process. So does this.",
            isEnd: true,
        },
    ],
    destroy: [
        {
            speaker: "GHOSTWIRE",
            text: "No more victims. This ends tonight, and nobody else gets to decide what happens to BLACKLEDGER.",
            isEnd: true,
        },
    ],
};

export const M04_OBJECTIVE_IDS = {
    reviewLead: "m04.objective.00",
    traceVpnIp: "m04.objective.01",
    scanC2Dashboard: "m04.objective.02",
    findHiddenDashboard: "m04.objective.03",
    findFrameworkCve: "m04.objective.04",
    initialShellAccess: "m04.objective.05",
    escalatePrivileges: "m04.objective.06",
    discoverIdentityFile: "m04.objective.07",
    revealBoobyTrap: "m04.objective.08",
    extractSafely: "m04.objective.09",
    finalDecision: "m04.objective.10",
} as const;

export const M04_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M04_OBJECTIVE_IDS.reviewLead,
        description: "Review the lead on the recurring VPN IP",
    },
    {
        name: M04_OBJECTIVE_IDS.traceVpnIp,
        description: "Trace the recurring VPN IP",
        unlocksAfter: [M04_OBJECTIVE_IDS.reviewLead],
    },
    {
        name: M04_OBJECTIVE_IDS.scanC2Dashboard,
        description: "Version-scan the hardened C2 dashboard",
        unlocksAfter: [M04_OBJECTIVE_IDS.traceVpnIp],
    },
    {
        name: M04_OBJECTIVE_IDS.findHiddenDashboard,
        description: "Enumerate hidden paths on the C2 dashboard",
        unlocksAfter: [M04_OBJECTIVE_IDS.scanC2Dashboard],
    },
    {
        name: M04_OBJECTIVE_IDS.findFrameworkCve,
        description: "Find a known CVE in the dashboard's old web framework",
        unlocksAfter: [M04_OBJECTIVE_IDS.findHiddenDashboard],
    },
    {
        name: M04_OBJECTIVE_IDS.initialShellAccess,
        description: "Get an initial shell on the C2 dashboard",
        unlocksAfter: [M04_OBJECTIVE_IDS.findFrameworkCve],
    },
    {
        name: M04_OBJECTIVE_IDS.escalatePrivileges,
        description: "Escalate to a privileged session",
        unlocksAfter: [M04_OBJECTIVE_IDS.initialShellAccess],
    },
    {
        name: M04_OBJECTIVE_IDS.discoverIdentityFile,
        description: "Find the suspicious identity backup file",
        unlocksAfter: [M04_OBJECTIVE_IDS.escalatePrivileges],
    },
    {
        name: M04_OBJECTIVE_IDS.revealBoobyTrap,
        description: "Something about that identity backup doesn't sit right — check what's really on it before you do anything else.",
        unlocksAfter: [M04_OBJECTIVE_IDS.discoverIdentityFile],
    },
    {
        name: M04_OBJECTIVE_IDS.extractSafely,
        description: "Extract the file without triggering the trap",
        unlocksAfter: [M04_OBJECTIVE_IDS.revealBoobyTrap],
    },
    {
        name: M04_OBJECTIVE_IDS.finalDecision,
        description: "Decide what happens to The Architect",
        unlocksAfter: [M04_OBJECTIVE_IDS.extractSafely],
    },
];

export const M04_REWARDS = {
    money: 800,
    xp: 200,
} as const;
