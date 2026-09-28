import type {
    QuestObjectiveDefinition,
    Shell,
    TwotterTweetInteraction,
} from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT, M04_ARCHITECT_VPN_IP } from "./characters.js";
import { M02_SHELL_COMPANY_NAME } from "./m02.js";
import { M01_CASE_ID } from "./m01.js";

export const M03_ARCHITECT_VPN_LEAD = M04_ARCHITECT_VPN_IP;

export const M03_SKYNET_DOMAIN = "skynet-importexport.biz";
export const M03_SKYNET_IP = "203.0.113.150";
export const M03_MX_HOST = "mail.skynet-importexport.biz";

export const M03_REMOTE_PORTAL_DOMAIN = "remote.skynet-importexport.biz";
export const M03_LEDGER_DOMAIN = "ledger.skynet-importexport.biz";

export const M03_LEGACY_PFSENSE_IP = "203.0.113.151";

export const M03_PFSENSE_IP = "77.83.142.6";
export const M03_PFSENSE_LAN_IP = "10.50.1.1";

export const M03_SPLITTER_IP = "91.207.174.33";
export const M03_SPLITTER_LAN_IP = "10.50.1.2";

export const M03_COINDRIFT_IP = "185.107.56.214";
export const M03_COINDRIFT_LAN_IP = "10.50.1.3";
export const M03_COINDRIFT_CODENAME = "Coin-Drift";

export const M03_ACCOMPLICE_IP = "62.210.183.77";
export const M03_ACCOMPLICE_LAN_IP = "10.50.1.4";
export const M03_ACCOMPLICE_CODENAME = "Faded-Ledger";
export const M03_ACCOMPLICE_USERNAME = "d.reyes";
export const M03_ACCOMPLICE_PASSWORD = "Reyes_Family2024";

export const M03_DECOY_HOST_IP = "146.185.239.12";
export const M03_DECOY_HOST_LAN_IP = "10.50.1.5";
export const M03_DECOY_HOST_CODENAME = "Split-Bill";
export const M03_DECOY_HOST_USERNAME = "guest";
export const M03_DECOY_HOST_PASSWORD = "guest";
export const M03_DECOY_HOST_README_CONTENT =
    "decommissioned expense-split box. archived Q4 last year. nothing current on here.";

export const M03_FINANCE_EMPLOYEE_HANDLE = "@d.reyes";
export const M03_LEAK_PATTERN = "company name + year, always ends in an exclamation mark";

export const M03_DECOY_EMPLOYEE_HANDLE = "@m.okafor";
export const M03_DECOY_EMPLOYEE_NAME = "Marcus Okafor";

export const M03_PFSENSE_USERNAME = "admin";
export const M03_PFSENSE_PASSWORD = "Skynet2024!";

export const M03_FINANCE_USERNAME = "finance_svc";
export const M03_FINANCE_PASSWORD = "internal_only_2024";

export const M03_LEDGER_TABLE = "wire_transfers";
export const M03_ACCESS_TABLE = "helpdesk_resets";
export const M03_LEDGER_AMOUNT = 42000;
export const M03_PARENT_ENTITY_NAME = "SKN Capital Nominees";

export const M03_PAYROLL_SAAS_IP = "45.67.219.8";
export const M03_PAYROLL_SAAS_NAME = "PayStream Payroll Services";

export const M03_TWOTTER_HANDLE = "d.reyes";
export const M03_TWOTTER_FIRST_NAME = "Dana";
export const M03_TWOTTER_LAST_NAME = "Reyes";
export const M03_TWOTTER_BIO =
    "Finance analyst. Numbers all day, home by six (usually). Reyes household, est. a very long time ago.";

export interface M03TwotterPost {
    readonly content: string;
    readonly interaction: TwotterTweetInteraction;
}

export const M03_TWOTTER_POSTS: M03TwotterPost[] = [
    {
        content:
            "ugh, IT still makes us use the company password format on every internal tool. " +
            "company name + year + '!' -- so secure, so memorable, so definitely never guessed.",
        interaction: { comments: 4, share: 1, likes: 12, views: 340 },
    },
    {
        content:
            "no i will not put my work login on a sticky note. i put it in my head like a NORMAL person. " +
            "(the personal shares are a different story, don't @ me)",
        interaction: { comments: 2, share: 0, likes: 8, views: 210 },
    },
    {
        content:
            "Reyes family movie night. same four names on every password i've ever made since 2024, " +
            "same four people on the couch. worth it.",
        interaction: { comments: 6, share: 0, likes: 33, views: 520 },
    },
    {
        content:
            "new quarter, new 'reconciliation' spreadsheet nobody explains to me. i just tie the numbers " +
            "and try not to think about the consulting-fee line.",
        interaction: { comments: 3, share: 1, likes: 9, views: 280 },
    },
    {
        content:
            "asked my manager where the parent company actually files. got 'you don't need to worry about " +
            "the holding structure.' cool cool cool.",
        interaction: { comments: 7, share: 2, likes: 18, views: 610 },
    },
    {
        content:
            "some weeks import/export feels like a lot of paperwork for not a lot of imports. or exports. " +
            "probably nothing.",
        interaction: { comments: 5, share: 0, likes: 14, views: 430 },
    },
    {
        content: "note to self: stop tweeting about work. starting tomorrow. definitely tomorrow.",
        interaction: { comments: 1, share: 0, likes: 6, views: 190 },
    },
];

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
    "Note: this is one line item, not the whole batch -- the rest is split across transfers we haven't pulled yet.",
    "Note: told this is normal for the holding company's structure. Hope that's true.",
    `Note: batch ref lines up with the memo on ${M01_CASE_ID} -- healthcare sector, if intake notes are right.`,
    "Note: dated Aug 16, 2026 -- two days after the wire authorization on file.",
].join("\n");

export const M03_REYES_NOTE_FILE_NAME = "do_not_open_at_work";
export const M03_REYES_NOTE_FILE_EXTENSION = "txt";
export const M03_REYES_NOTE_CONTENT = [
    "things i am not supposed to have noticed:",
    "",
    "- the 'consulting fees' line clears the same day money lands, every time",
    "- nobody upstream has a real name, just SKN this and Nominees that",
    "- the finance box phones out to the same address after every batch, always the same one",
    "",
    "i tie the numbers. i don't ask. that's the deal, that's the paycheck, that's the kids' school.",
    "if this is what i think it is i want it on record that i wrote this down first.",
].join("\n");

export const M03_HELPDESK_RESET_NOTE =
    "SMB reset for d.reyes -- back to her personal one. told her AGAIN to use the company format.";

export const M03_CAPTURE_FILE_NAME = "finance_vlan_capture";
export const M03_CAPTURE_FILE_EXTENSION = "log";
export const M03_CAPTURE_FILE_CONTENT = [
    "FINANCE VLAN CAPTURE — session summary (bettercap ARP-spoof + wireshark)",
    "=======================================================================",
    "",
    `Finance server on this segment: ${M03_LEDGER_DOMAIN} (${M03_COINDRIFT_LAN_IP}), mariadb on 3306.`,
    "",
    "Recurring outbound sessions observed on the finance VLAN this window:",
    "",
    `  ${M03_COINDRIFT_LAN_IP}  ->  ${M03_PAYROLL_SAAS_IP}      https   scheduled, business hours`,
    `  ${M03_COINDRIFT_LAN_IP}  ->  ${M04_ARCHITECT_VPN_IP}     tunnel  fires once per payout batch, every capture window`,
    "",
    "Two external endpoints. One of them is ordinary. Check both before trusting either.",
].join("\n");

export const M03_TIP_SUBJECT = "shell company confirmed — dig into it";
export const M03_TIP_CONTENT = [
    `The financial document you pulled names ${M02_SHELL_COMPANY_NAME}.`,
    "That's the account the ransom payouts actually clear through.",
    "",
    `Public site: ${M03_SKYNET_DOMAIN}`,
    "Get inside their finance network, pull the ledger, and watch what the finance box talks to.",
    "",
    "One more thing: whatever you change on their gateway to get in, change it back before you leave.",
    "A rule that's still open when they audit is how people like us get found.",
].join("\n");

export const M03_REPORT_SUBJECT = "Shell company laundering confirmed — parent entity named";
export const M03_REPORT_TEMPLATE_ID = "flatline.m03.report";
export const M03_REPORT_TEMPLATE_LABEL = "Mission 3 Findings";
export const M03_REPORT_TEMPLATE_CONTENT = [
    "Shell company: {{shellCompany}}",
    "Parent entity: {{parentEntity}}",
    "Recurring endpoint from the finance-VLAN capture: {{vpnLead}}",
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
    "Confirmed: BLACKLEDGER's money moves through {{parentEntity}}.",
    "The capture caught the finance server tunnelling to {{vpnLead}} once per payout batch -- doesn't resolve, doesn't belong to any customer.",
    "Unresolved: \"Nominees\" isn't an operating company -- means someone real still owns it, off every filing we've found.",
    "Same shape as the routing note from the toolkit developer -- someone signs off above the shell layer both times. That endpoint is where they answer.",
].join("\n");
export const M03_REPORT_BODY = [
    `Shell company: ${M02_SHELL_COMPANY_NAME}`,
    `Parent entity: ${M03_PARENT_ENTITY_NAME}`,
    `Recurring endpoint from the finance-VLAN capture: ${M04_ARCHITECT_VPN_IP}`,
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
    `Confirmed: BLACKLEDGER's money moves through ${M03_PARENT_ENTITY_NAME}.`,
    `The capture caught the finance server tunnelling to ${M04_ARCHITECT_VPN_IP} once per payout batch -- doesn't resolve, doesn't belong to any customer.`,
    "Unresolved: \"Nominees\" isn't an operating company -- means someone real still owns it, off every filing we've found.",
    "Same shape as the routing note from the toolkit developer -- someone signs off above the shell layer both times. That endpoint is where they answer.",
].join("\n");

export const M03_LOG_ENTRIES: Record<"default" | "capture" | "reyes" | "aftermath", readonly string[]> = {
    default: [
        "There it is. Money doesn't disappear, it just changes names.",
        `${M02_SHELL_COMPANY_NAME}. ${M03_PARENT_ENTITY_NAME}. Paper walls.`,
    ],
    capture: [
        "Same address on the wire after every batch. Not a customer. Not payroll.",
        "Whoever's on the other end of that tunnel is who I actually came for.",
    ],
    reyes: [
        "Reyes kept a file called do_not_open_at_work. People don't write that unless they already know.",
        "She tied the numbers anyway. Kids, a paycheck. That's how it gets you.",
    ],
    aftermath: [
        "Nominees. Not an owner, a name someone else hides behind.",
        "The money stops at a name. The tunnel doesn't. BLACKLEDGER doesn't end here.",
    ],
};

export const M03_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M03_SKYNET_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M03_PFSENSE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "OPEN", service: "http" },
    { port: 443, status: "CLOSE", service: "https" },
];

export const M03_PAYROLL_GEOIP: Shell.GeoipData = {
    country: "Ireland",
    city: "Dublin",
    latitude: "53.3498",
    longitude: "-6.2603",
};

export const M03_VPN_GEOIP: Shell.GeoipData = {
    country: "Unknown",
    city: "Unknown",
    latitude: "0.0000",
    longitude: "0.0000",
};

export const M03_OBJECTIVE_IDS = {
    investigateShellCompany: "m03.objective.00",
    traceTheMoney: "m03.objective.01",
    reportToDeadDrop: "m03.objective.02",
} as const;

export const M03_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M03_OBJECTIVE_IDS.investigateShellCompany,
        description:
            "Get inside the shell company's finance network -- work the public front for a way in, crack the gateway, and pivot into the internal VLAN.",
    },
    {
        name: M03_OBJECTIVE_IDS.traceTheMoney,
        description:
            "Trace the money -- capture the internal traffic, pull the wire-transfer ledger, and find both the parent entity and whatever the finance box keeps calling home.",
        unlocksAfter: [M03_OBJECTIVE_IDS.investigateShellCompany],
    },
    {
        name: M03_OBJECTIVE_IDS.reportToDeadDrop,
        description:
            "Cover your tracks on the way out, then send what you found to the dead drop.",
        unlocksAfter: [M03_OBJECTIVE_IDS.traceTheMoney],
    },
];

export const M03_REWARDS = {
    money: 550,
    xp: 120,
} as const;
