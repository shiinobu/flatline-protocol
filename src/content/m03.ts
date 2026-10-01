import type {
    QuestObjectiveDefinition,
    Shell,
    TwotterTweetInteraction,
} from "@hotbunny/hackhub-content-sdk";

import { DEAD_DROP_CONTACT, M04_ARCHITECT_VPN_IP } from "./global/characters.js";
import {
    RANSOM_BATCHES,
    RANSOM_BATCHES_Q3,
    RANSOM_BATCH_HOSPITAL,
    RANSOM_POSTING_TIMES,
    RANSOM_SPLIT_PERCENT,
    formatUsd,
    formatUsdShare,
    splitRansom,
    totalRansom,
    type RansomBatch,
} from "./global/finance.js";
import { M02_SHELL_COMPANY_NAME } from "./global/entities.js";
import { M01_CASE_ID } from "./global/case.js";

export const M03_ARCHITECT_VPN_LEAD = M04_ARCHITECT_VPN_IP;

export const M03_SKYNET_DOMAIN = "skynet-importexport.biz";
export const M03_SKYNET_IP = "203.0.113.150";
export const M03_MX_HOST = "mail.skynet-importexport.biz";

export const M03_REMOTE_PORTAL_DOMAIN = "remote.skynet-importexport.biz";
export const M03_LEDGER_DOMAIN = "ledger.skynet-importexport.biz";

export const M03_LEGACY_PFSENSE_IP = "203.0.113.151";

export const M03_PFSENSE_IP = "77.83.142.6";
export const M03_PFSENSE_LAN_IP = "192.168.1.1";

export const M03_SPLITTER_IP = "91.207.174.33";
export const M03_SPLITTER_LAN_IP = "192.168.1.2";

export const M03_COINDRIFT_IP = "185.107.56.214";
export const M03_COINDRIFT_LAN_IP = "192.168.1.3";
export const M03_COINDRIFT_CODENAME = "Coin-Drift";

export const M03_ACCOMPLICE_IP = "62.210.183.77";
export const M03_ACCOMPLICE_LAN_IP = "192.168.1.4";
export const M03_ACCOMPLICE_CODENAME = "Faded-Ledger";
export const M03_ACCOMPLICE_USERNAME = "d.reyes";
export const M03_ACCOMPLICE_PASSWORD = "Reyes_Family2024";

export const M03_DECOY_HOST_IP = "146.185.239.12";
export const M03_DECOY_HOST_LAN_IP = "192.168.1.5";
export const M03_DECOY_HOST_CODENAME = "Split-Bill";
export const M03_DECOY_HOST_USERNAME = "guest";
export const M03_DECOY_HOST_PASSWORD = "guest";
export const M03_DECOY_HOST_README_CONTENT =
    "decommissioned expense-split box. archived Q4 last year. nothing current on here.";

export const M03_VAULTLINE_IP = "79.124.62.90";
export const M03_VAULTLINE_LAN_IP = "192.168.1.6";
export const M03_VAULTLINE_CODENAME = "Vault-Line";
export const M03_VAULTLINE_RDP_VERSION = "FreeRDP 7.1.9";

export interface M03ForwardTarget {
    readonly ip: string;
    readonly lanIp: string;
    readonly internal: number;
    readonly service: string;
    readonly version?: string;
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
    },
];

export const M03_SITE_ACCESS_NOTICE =
    "Staff access: the gateway forwards nothing to the finance VLAN until IT adds a rule. " +
    `Hosts on the request form: ${M03_COINDRIFT_CODENAME} (database 3306, share 445, ledger portal ${M03_LEDGER_DOMAIN}), ` +
    `${M03_ACCOMPLICE_CODENAME} (ssh 22, share 445), ${M03_DECOY_HOST_CODENAME} (share 445), ` +
    `${M03_VAULTLINE_CODENAME} (tunnel gateway, RDP 3389).`;

export const M03_COMPANY_SHORT_NAME = "Skynet";
export const M03_POLICY_YEAR = "2024";

export const M03_FINANCE_EMPLOYEE_HANDLE = "@d.reyes";
export const M03_DECOY_EMPLOYEE_HANDLE = "@m.okafor";

export const M03_HYDRA_DEFAULT_USER = "guest";
export const M03_PFSENSE_USERNAME = "admin";
export const M03_PFSENSE_PASSWORD = `${M03_COMPANY_SHORT_NAME}${M03_POLICY_YEAR}!`;

export const M03_FINANCE_USERNAME = "finance_svc";
export const M03_FINANCE_PASSWORD = "internal_only_2024";

export const M03_LEDGER_TABLE = "wire_transfers";
export const M03_ACCESS_TABLE = "helpdesk_resets";
export const M03_PARENT_ENTITY_NAME = "SKN Capital Nominees";
export const M03_VPN_PEER_LABEL = "SKN-CENTRAL";

export const M03_LEDGER_ESCROW_PARTY = "ClearEscrow Settlement";
export const M03_LEDGER_PANEL_PARTY = "TR4C3404 Consulting";
export const M03_LEDGER_BROKER_PARTY = "X7xSentry9 Brokerage";

export interface M03LedgerRow {
    readonly id: number;
    readonly postedAt: string;
    readonly direction: "IN" | "OUT";
    readonly party: string;
    readonly amount: number;
    readonly balance: number;
    readonly memo: string;
}

interface M03LedgerLeg {
    readonly postedAt: string;
    readonly direction: "IN" | "OUT";
    readonly party: string;
    readonly amount: number;
    readonly memo: string;
}

const buildM03BatchLegs = (batch: RansomBatch): readonly M03LedgerLeg[] => {
    const split = splitRansom(batch.gross);
    const tag = `${batch.ref} ${batch.caseRef}`;
    const at = (time: string): string => `${batch.settledAt} ${time} UTC`;

    return [
        {
            postedAt: at(RANSOM_POSTING_TIMES.received),
            direction: "IN",
            party: M03_LEDGER_ESCROW_PARTY,
            amount: batch.gross,
            memo: `${tag} escrow release`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.parent),
            direction: "OUT",
            party: M03_PARENT_ENTITY_NAME,
            amount: split.parent,
            memo: `${tag} management fee`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.panel),
            direction: "OUT",
            party: M03_LEDGER_PANEL_PARTY,
            amount: split.panel,
            memo: `${tag} consulting fees (logistics)`,
        },
        {
            postedAt: at(RANSOM_POSTING_TIMES.broker),
            direction: "OUT",
            party: M03_LEDGER_BROKER_PARTY,
            amount: split.broker,
            memo: `${tag} customs brokerage`,
        },
    ];
};

export const buildM03LedgerRows = (): readonly M03LedgerRow[] =>
    RANSOM_BATCHES.flatMap(buildM03BatchLegs).reduce<readonly M03LedgerRow[]>((rows, leg) => {
        const previousBalance = rows[rows.length - 1]?.balance ?? 0;
        const signedAmount = leg.direction === "IN" ? leg.amount : -leg.amount;

        return [
            ...rows,
            {
                id: rows.length + 1,
                postedAt: leg.postedAt,
                direction: leg.direction,
                party: leg.party,
                amount: leg.amount,
                balance: previousBalance + signedAmount,
                memo: leg.memo,
            },
        ];
    }, []);

export interface M03TwotterPost {
    readonly content: string;
    readonly interaction: TwotterTweetInteraction;
}

export const M03_TWOTTER_HANDLE = "d.reyes";
export const M03_TWOTTER_FIRST_NAME = "Dana";
export const M03_TWOTTER_LAST_NAME = "Reyes";
export const M03_TWOTTER_BIO =
    "Finance analyst. Numbers all day, home by six (usually). Reyes household, est. a very long time ago.";
export const M03_TWOTTER_POSTS: M03TwotterPost[] = [
    {
        content:
            "ugh, IT still makes us build every internal login the same dumb way -- the company's short name, " +
            "the year the policy came in, and a '!' on the end. one word, capitalized. 'so secure.'",
        interaction: { comments: 4, share: 1, likes: 12, views: 340 },
    },
    {
        content:
            "no i will not put my work login on a sticky note. i keep it in my head like a NORMAL person. " +
            "(the personal shares are a different story, don't @ me)",
        interaction: { comments: 2, share: 0, likes: 8, views: 210 },
    },
    {
        content:
            "Reyes family movie night. same four names on every password i've ever made for myself, " +
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

export const M03_OKAFOR_HANDLE = "m.okafor";
export const M03_OKAFOR_FIRST_NAME = "Marcus";
export const M03_OKAFOR_LAST_NAME = "Okafor";
export const M03_OKAFOR_BIO = "Operations & facilities @ Skynet Import-Export. If it's got a plug, I've got the key.";
export const M03_OKAFOR_FAKE_WIFI_PASSWORD = "SkynetGuest2019";
export const M03_OKAFOR_POSTS: M03TwotterPost[] = [
    {
        content:
            "people ask who runs this building. i run this building. badge system, server room, the lot. " +
            "IT just signs the forms i tell them to.",
        interaction: { comments: 3, share: 0, likes: 7, views: 240 },
    },
    {
        content:
            "reminder to visitors: guest wifi is still " + M03_OKAFOR_FAKE_WIFI_PASSWORD + ", one word. " +
            "been meaning to rotate it for years. it's fine. probably fine.",
        interaction: { comments: 5, share: 2, likes: 11, views: 520 },
    },
    {
        content:
            "spent the afternoon 'supervising' the finance floor recabling. by supervising i mean i held the " +
            "ladder and had opinions.",
        interaction: { comments: 2, share: 0, likes: 9, views: 300 },
    },
    {
        content:
            "if you have access to everything you have responsibility for nothing. that's a leadership quote. " +
            "i said it. put it on a mug.",
        interaction: { comments: 4, share: 1, likes: 14, views: 410 },
    },
    {
        content:
            "no i can't get you into the finance systems, that's a different team, i just keep the lights on. " +
            "but i COULD if i wanted. probably.",
        interaction: { comments: 6, share: 0, likes: 8, views: 350 },
    },
];

export const M03_SPREADSHEET_FILE_NAME = "q3_reconciliation";
export const M03_SPREADSHEET_FILE_EXTENSION = "xlsx";
export const M03_ACCOMPLICE_NAME = "D. Reyes";

const buildM03ReconciliationBlock = (batch: RansomBatch): readonly string[] => {
    const split = splitRansom(batch.gross);

    return [
        `${batch.ref} / ${batch.caseRef} / settled ${batch.settledAt}`,
        `  deposit ${formatUsd(batch.gross)} (${M03_LEDGER_ESCROW_PARTY})`,
        `  ${RANSOM_SPLIT_PERCENT.parent}% management fee -> ${M03_PARENT_ENTITY_NAME}: ${formatUsd(split.parent)}`,
        `  ${RANSOM_SPLIT_PERCENT.panel}% consulting fees -> ${M03_LEDGER_PANEL_PARTY}: ${formatUsd(split.panel)}`,
        `  ${RANSOM_SPLIT_PERCENT.broker}% customs brokerage -> ${M03_LEDGER_BROKER_PARTY}: ${formatUsd(split.broker)}`,
        `  ${RANSOM_SPLIT_PERCENT.retained}% retained: ${formatUsd(split.retained)}`,
        "",
    ];
};

const M03_Q3_TOTALS = totalRansom(RANSOM_BATCHES_Q3);

export const M03_SPREADSHEET_CONTENT = [
    "Q3 RECONCILIATION — INTERNAL DRAFT",
    "===================================",
    "",
    `Prepared by: ${M03_ACCOMPLICE_NAME} (Finance)`,
    `Parent entity on file: ${M03_PARENT_ENTITY_NAME}`,
    "",
    ...RANSOM_BATCHES_Q3.flatMap(buildM03ReconciliationBlock),
    `Q3 total deposits ${formatUsd(M03_Q3_TOTALS.gross)}: parent ${formatUsd(M03_Q3_TOTALS.parent)}, consulting ${formatUsd(M03_Q3_TOTALS.panel)}, brokerage ${formatUsd(M03_Q3_TOTALS.broker)}, retained ${formatUsd(M03_Q3_TOTALS.retained)}.`,
    "",
    "Note: every deposit is split the same way, same day, to the minute. Nobody bills a percentage of someone else's deposit and calls it consulting.",
    "Note: none of these depositors is a client of ours -- no freight, no customs file, nothing shipped.",
    "Note: told this is normal for the holding company's structure. Hope that's true.",
    `Note: the ${RANSOM_BATCH_HOSPITAL.ref} batch lines up with the memo on ${M01_CASE_ID} -- healthcare sector, if intake notes are right.`,
    "Note: dated Aug 16, 2026 -- two days after the wire authorization on file.",
].join("\n");

export const M03_REYES_NOTE_FILE_NAME = "do_not_open_at_work";
export const M03_REYES_NOTE_FILE_EXTENSION = "txt";
export const M03_REYES_NOTE_CONTENT = [
    "things i am not supposed to have noticed:",
    "",
    "- the 'consulting fees' line clears the same day money lands, every time",
    "- nobody upstream has a real name, just SKN this and Nominees that",
    "- the finance box phones out through the tunnel gateway after every batch, always the same peer",
    "",
    "i tie the numbers. i don't ask. that's the deal, that's the paycheck, that's the kids' school.",
    "if this is what i think it is i want it on record that i wrote this down first.",
].join("\n");

export const M03_HELPDESK_RESET_NOTE =
    "Remote login reset for d.reyes -- back to her personal one. told her AGAIN to use the company format.";

export const M03_VPN_CONFIG_FILE_NAME = "site_to_site_backup";
export const M03_VPN_CONFIG_FILE_EXTENSION = "txt";
export const M03_VPN_CONFIG_CONTENT = [
    "# site-to-site IPsec — config backup (DO NOT DISTRIBUTE)",
    `# host: ${M03_VAULTLINE_CODENAME}`,
    "",
    "[peer]",
    `label      = ${M03_VPN_PEER_LABEL}`,
    `remote_gw  = ${M04_ARCHITECT_VPN_IP}`,
    `owner_note = ${M03_PARENT_ENTITY_NAME} -- do not name in the panel, route only`,
    "schedule   = one push per settlement batch, same day",
    "",
    "[db_export]",
    `# finance ledger replicates out through this box after each batch`,
    `db_host = ${M03_COINDRIFT_LAN_IP}`,
    `db_user = ${M03_FINANCE_USERNAME}`,
    `db_pass = ${M03_FINANCE_PASSWORD}`,
].join("\n");

export const M03_TIP_SUBJECT = "shell company confirmed — dig into it";
export const M03_TIP_CONTENT = [
    `The wire authorization you pulled sends the full ${formatUsd(RANSOM_BATCH_HOSPITAL.gross)} batch to ${M02_SHELL_COMPANY_NAME}.`,
    "That's the account the ransom payouts actually clear through.",
    "",
    `Public site: ${M03_SKYNET_DOMAIN}`,
    "Get inside their finance network, pull the ledger, and find where the money answers to --",
    "there's a box in there that builds a tunnel to somewhere off the map after every batch. Root it.",
    "",
    "One more thing: their remote-access gateway forwards nothing inward, so whatever forwarding rule you write to get in is yours to keep or remove.",
    "A rule that's still open when they audit is how people like us get found.",
].join("\n");

const M03_ALL_TOTALS = totalRansom(RANSOM_BATCHES);

const buildM03FundsLines = (parentEntity: string): readonly string[] => {
    const split = splitRansom(RANSOM_BATCH_HOSPITAL.gross);

    return [
        `Funds: ${formatUsd(RANSOM_BATCH_HOSPITAL.gross)} escrow release on ${RANSOM_BATCH_HOSPITAL.settledAt} (${RANSOM_BATCH_HOSPITAL.ref}), moved out the same morning: ${formatUsdShare(split.parent, RANSOM_SPLIT_PERCENT.parent)} to ${parentEntity}, ${formatUsdShare(split.panel, RANSOM_SPLIT_PERCENT.panel)} to ${M03_LEDGER_PANEL_PARTY} as consulting fees, ${formatUsdShare(split.broker, RANSOM_SPLIT_PERCENT.broker)} to ${M03_LEDGER_BROKER_PARTY} as brokerage, ${formatUsdShare(split.retained, RANSOM_SPLIT_PERCENT.retained)} retained.`,
        `Same split on all ${RANSOM_BATCHES.length} batches on the ledger: ${formatUsd(M03_ALL_TOTALS.gross)} in, ${formatUsd(M03_ALL_TOTALS.parent)} to ${parentEntity}.`,
    ];
};

export const M03_REPORT_SUBJECT = "Shell company laundering confirmed — parent entity named";
export const M03_REPORT_TEMPLATE_ID = "flatline.m03.report";
export const M03_REPORT_TEMPLATE_LABEL = "Mission 3 Findings";
export const M03_REPORT_TEMPLATE_CONTENT = [
    "Shell company: {{shellCompany}}",
    "Parent entity: {{parentEntity}}",
    "Recurring tunnel endpoint (finance VLAN): {{vpnLead}}",
    ...buildM03FundsLines("{{parentEntity}}"),
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
    "Confirmed: BLACKLEDGER's money moves through {{parentEntity}}.",
    `Rooted the finance tunnel gateway (${M03_VAULTLINE_CODENAME}); its site-to-site config peers to {{vpnLead}}, labelled ${M03_VPN_PEER_LABEL}, owner noted as {{parentEntity}}.`,
    "So the money's destination and the tunnel's far end are the same hand.",
    "Unresolved: \"Nominees\" isn't an operating company -- someone real still owns it, off every filing. That endpoint is where they answer.",
].join("\n");
export const M03_REPORT_BODY = [
    `Shell company: ${M02_SHELL_COMPANY_NAME}`,
    `Parent entity: ${M03_PARENT_ENTITY_NAME}`,
    `Recurring tunnel endpoint (finance VLAN): ${M04_ARCHITECT_VPN_IP}`,
    ...buildM03FundsLines(M03_PARENT_ENTITY_NAME),
    "",
    "Confirmed via internal wire-transfer ledger, pivoted through the finance VLAN.",
    `Confirmed: BLACKLEDGER's money moves through ${M03_PARENT_ENTITY_NAME}.`,
    `Rooted the finance tunnel gateway (${M03_VAULTLINE_CODENAME}); its site-to-site config peers to ${M04_ARCHITECT_VPN_IP}, labelled ${M03_VPN_PEER_LABEL}, owner noted as ${M03_PARENT_ENTITY_NAME}.`,
    "So the money's destination and the tunnel's far end are the same hand.",
    "Unresolved: \"Nominees\" isn't an operating company -- someone real still owns it, off every filing. That endpoint is where they answer.",
].join("\n");

export const M03_LOG_ENTRIES: Record<"ledger" | "tunnel" | "root" | "reyes" | "aftermath", readonly string[]> = {
    ledger: [
        "There it is. Money doesn't disappear, it just changes names.",
        `${formatUsd(M03_ALL_TOTALS.parent)} of ${formatUsd(M03_ALL_TOTALS.gross)} ends at ${M03_PARENT_ENTITY_NAME}. Paper walls.`,
    ],
    tunnel: [
        "The gateway's own config names the far end of that tunnel after every batch. Not a customer. Not a vendor.",
        "Whatever's on the far end of that tunnel is who I actually came for.",
    ],
    root: [
        "Got root on the gateway. The tunnel peer's right there in the config, same owner as the money.",
        "The shell company and the address off the map are the same hand. That's the thread into the top.",
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

export const M03_VPN_GEOIP: Shell.GeoipData = {
    country: "Unknown",
    city: "Unknown",
    latitude: "0.0000",
    longitude: "0.0000",
};

export const M03_OBJECTIVE_IDS = {
    reportFindings: "m03.objective.00",
} as const;

export const M03_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M03_OBJECTIVE_IDS.reportFindings,
        description:
            "Trace BLACKLEDGER's money through Skynet Import-Export -- break into the finance network, pull the wire-transfer ledger for the parent entity, root the box that tunnels the money off the map, and report it all to the dead drop.",
    },
];

export const M03_REWARDS = {
    money: 600,
    xp: 140,
} as const;
