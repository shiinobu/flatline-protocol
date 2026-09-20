import type { QuestObjectiveDefinition, Shell } from "@hotbunny/hackhub-content-sdk";

import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT } from "./characters.js";

export const M01_TARGET_IP = "203.0.113.90";
export const M01_ROUTER_IP = "77.0.34.201";
export const M01_DOMAIN = "verifiedaccess.mkt";
export const M01_HIDDEN_PATH = "/opn-102/";

export const M01_DECOY_DOMAIN = "shadowline-exchange.mkt";
export const M01_DECOY_IP = "198.51.100.23";

export const M01_LEDGERVAULT_DOMAIN = "x7k2m9vdlq4wnyt3.dark";
export const M01_LEDGERVAULT_IP = "45.76.19.140";

export const M01_BROKER_USERNAME = "opsadmin";
export const M01_BROKER_PASSWORD = "verified_2024!";

export const M01_SESSION_COOKIE_NAME = "session";
export const M01_SESSION_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiJvcHNhZG1pbiIsInJvbGUiOiJvcHMtbGVnYWN5IiwiZmFpbG92ZXJfcHciOiJ2ZXJpZmllZF8yMDI0ISIsImlzcyI6InZlcmlmaWVkYWNjZXNzLm1rdCJ9." +
    "4f3a9c1b7e2d8f6a5c0b3e9d7f1a2c4e";

export const M01_JWT_DECODER_SCRIPT_NAME = "jwt_decoder";

export const M01_SESSION_DECODE_SUBJECT = "jwt_decoder.py — decode complete";
export const M01_SESSION_DECODE_CONTENT = [
    "JWT decoded — payload:",
    "{",
    '  "sub": "opsadmin",',
    '  "role": "ops-legacy",',
    '  "failover_pw": "verified_2024!",',
    '  "iss": "verifiedaccess.mkt"',
    "}",
    "",
    "Signature: HS256, no key rotation on record. Payload trusted as-is.",
].join("\n");

export const M01_LEDGER_FILE_NAME = "sales_ledger";
export const M01_LEDGER_FILE_EXTENSION = "log";
export const M01_BUYER_ALIAS = "A7xC0DEFACE";
export const M01_LEDGER_CONTENT = [
    "TRANSACTION LOG — VERIFIED ACCESS SALES",
    "==========================================",
    "",
    "ROW 0417",
    "Sector: Healthcare",
    "Region: SEA",
    `Buyer: ${M01_BUYER_ALIAS}`,
    "Status: CONFIRMED",
    "Payment: Escrow released",
    "Notes: repeat client, requested rush turnaround on network map.",
].join("\n");

export const M01_OPS_NOTES_FILE_NAME = "ops_notes";
export const M01_OPS_NOTES_FILE_EXTENSION = "txt";
export const M01_OPS_NOTES_CONTENT =
    "Anything ops-related lives in /logs now, not here. Check there if you need details.";

export const M01_IRC_HOST = "relay.blkledger.dark";
export const M01_IRC_PASSWORD = "n0ledger";
export const M01_IRC_USERNAME = M01_BROKER_USERNAME;
export const M01_IRC_CONTACT_USERNAME = "relay0";

export interface M01IrcLine {
    username: string;
    message: string;
}

export const M01_IRC_CONVERSATION: M01IrcLine[] = [
    { username: M01_IRC_USERNAME, message: "heads up, new build client wants it fast this time" },
    { username: M01_IRC_USERNAME, message: "don't drop the ball like last quarter" },
    { username: M01_IRC_CONTACT_USERNAME, message: "which one, the SEA hospital thing?" },
    { username: M01_IRC_USERNAME, message: "yeah. buyer's already confirmed — A7xC0DEFACE" },
    { username: M01_IRC_CONTACT_USERNAME, message: "escrow's clean on our side" },
    { username: M01_IRC_USERNAME, message: "good. keep it off the main listing once it clears" },
    { username: M01_IRC_CONTACT_USERNAME, message: "already flagged it no longer listed like the others" },
    { username: M01_IRC_USERNAME, message: "smart. don't want another leak like last time" },
    { username: M01_IRC_CONTACT_USERNAME, message: "speaking of, that admin portal still running the old session auth?" },
    { username: M01_IRC_USERNAME, message: "yeah, haven't touched it. works fine, nobody's noticed" },
    { username: M01_IRC_CONTACT_USERNAME, message: "you sure? plain cookie like that is asking for trouble" },
    { username: M01_IRC_USERNAME, message: "it's fine. just get the payment sorted before client gets impatient" },
    { username: M01_IRC_CONTACT_USERNAME, message: "copy. will confirm once escrow releases" },
    { username: M01_IRC_USERNAME, message: "good. this one needs to go clean" },
];

export const M01_IRC_NOTES_FILE_NAME = "ops-relay";
export const M01_IRC_NOTES_FILE_EXTENSION = "log";
export const M01_IRC_NOTES_CONTENT = [
    "Team standup moved to IRC if servers act up: relay.blkledger.dark",
    "Ask around for the channel key if you're new -- not posting it here again.",
    "key: n0ledger",
].join("\n");
export const M01_IRC_NOTES_ENCRYPTED =
    "VGVhbSBzdGFuZHVwIG1vdmVkIHRvIElSQyBpZiBzZXJ2ZXJzIGFjdCB1cDogcmVsYXkuYmxrbGVkZ2VyLmRhcmsKQXNrIGFyb3VuZCBmb3IgdGhlIGNoYW5uZWwga2V5IGlmIHlvdSdyZSBuZXcgLS0gbm90IHBvc3RpbmcgaXQgaGVyZSBhZ2Fpbi4Ka2V5OiBuMGxlZGdlcg==";
export const M01_IRC_NOTES_FILE_CONTENT = [
    "[ENCRYPTED]",
    M01_IRC_NOTES_ENCRYPTED,
].join("\n");

export const M01_DUMMY_TODO_CONTENT =
    "renew SSL cert, rotate backup keys, patch kernel this weekend";
export const M01_DUMMY_README_CONTENT =
    "standard ops box. don't touch prod configs without asking first.";
export const M01_DUMMY_AUTH_LOG_CONTENT = [
    "Failed password for invalid user admin from 91.203.44.12",
    "Accepted password for opsadmin from 10.0.0.4",
    "Failed password for root from 185.220.101.3",
].join("\n");
export const M01_DUMMY_CRON_LOG_CONTENT = [
    "backup.sh completed successfully",
    "cert-renew.sh: no action needed",
    `vault-sync.sh completed successfully -- nightly backup mirrored to ${M01_LEDGERVAULT_DOMAIN}`,
].join("\n");
export const M01_DUMMY_SYSTEM_LOG_CONTENT = [
    "disk usage at 62%",
    "service nginx restarted",
].join("\n");

export const M01_TIP_SUBJECT = "you should look into this";
export const M01_TIP_CONTENT = [
    "Found this while digging through some leaked broker listings.",
    "Two domains came up together. Only one of them is real.",
    "",
    `Primary lead: ${M01_DOMAIN}`,
    `Also mentioned, probably nothing: ${M01_DECOY_DOMAIN}`,
    "",
    "Be careful. Whoever runs this isn't small-time.",
].join("\n");

export const M01_CASE_ID = "CASE-A7X-0417";
export const M01_NETWORK_MAP_CONTENT = [
    "NETWORK MAP -- internal reference, do not distribute",
    "target: hospital network, SEA region (see ROW 0417)",
    "entry point: verifiedaccess.mkt / opn-102 listing",
    "primary access: 203.0.113.90 (opsadmin)",
    "notes: buyer requested rush delivery, map finalized ahead of schedule",
].join("\n");

export const M01_BROKER_LISTING_URL = `${M01_DOMAIN}${M01_HIDDEN_PATH.replace(/\/$/, "")}`;

export const M01_REPORT_SUBJECT = "Broker identified — buyer alias attached";
export const M01_REPORT_TEMPLATE_ID = "flatline.m01.report";
export const M01_REPORT_TEMPLATE_LABEL = "Mission 1 Findings";
export const M01_REPORT_TEMPLATE_CONTENT = [
    "FINDINGS",
    "--------",
    "Broker: {{broker}}",
    "Buyer: {{buyer}}",
    "Case: {{caseId}}",
    "",
    "Source: compromised sales ledger + IRC chatter.",
].join("\n");
export const M01_REPORT_BODY = [
    "FINDINGS",
    "--------",
    `Broker: ${M01_BROKER_LISTING_URL}`,
    `Buyer: ${M01_BUYER_ALIAS}`,
    `Case: ${M01_CASE_ID}`,
    "",
    "Source: compromised sales ledger + IRC chatter.",
].join("\n");

export const M01_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M01_TIPSTER_EMAIL = ANONYMOUS_TIPSTER.email;

export const M01_CUSTODIAN_SUBJECT = "standing instructions";
export const M01_CUSTODIAN_CONTENT = [
    "Everything you find goes here. No exceptions, no other channel.",
    "I'll reach out if there's a problem. Otherwise, don't expect a reply.",
].join("\n");

export const M01_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "OPEN", service: "ssh" },
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_OBJECTIVE_IDS = {
    reviewTip: "m01.objective.00",
    investigateStorefront: "m01.objective.01",
    ruleOutDecoy: "m01.objective.02",
    accessBroker: "m01.objective.03",
    findLedgerEntry: "m01.objective.04",
    decryptFindings: "m01.objective.05",
    confirmViaChat: "m01.objective.06",
    reportFindings: "m01.objective.07",
} as const;

export const M01_OBJECTIVES: QuestObjectiveDefinition[] = [
    {
        name: M01_OBJECTIVE_IDS.reviewTip,
        description: "Review the anonymous tip",
    },
    {
        name: M01_OBJECTIVE_IDS.investigateStorefront,
        description:
            "Track the storefront's domain past its public face and trace what it's not indexing publicly",
        unlocksAfter: [M01_OBJECTIVE_IDS.reviewTip],
    },
    {
        name: M01_OBJECTIVE_IDS.ruleOutDecoy,
        description: "Investigate and confirm the second domain is truly unconnected",
        unlocksAfter: [M01_OBJECTIVE_IDS.reviewTip],
    },
    {
        name: M01_OBJECTIVE_IDS.accessBroker,
        description:
            "Find a way to the access credentials and login into the broker's server via ssh",
        unlocksAfter: [M01_OBJECTIVE_IDS.investigateStorefront],
    },
    {
        name: M01_OBJECTIVE_IDS.findLedgerEntry,
        description: "Find anything suspicious lying around on the broker's server",
        unlocksAfter: [M01_OBJECTIVE_IDS.accessBroker],
    },
    {
        name: M01_OBJECTIVE_IDS.decryptFindings,
        description: "Crack the cipher and see what they tried to hide",
        unlocksAfter: [M01_OBJECTIVE_IDS.findLedgerEntry],
    },
    {
        name: M01_OBJECTIVE_IDS.confirmViaChat,
        description: "Access their IRC channel and confirm what you've found",
        unlocksAfter: [M01_OBJECTIVE_IDS.decryptFindings],
    },
    {
        name: M01_OBJECTIVE_IDS.reportFindings,
        description: "Send your findings to the dead drop",
        unlocksAfter: [M01_OBJECTIVE_IDS.confirmViaChat],
    },
];

export const M01_REWARDS = {
    money: 250,
    xp: 60,
} as const;
