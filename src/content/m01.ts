import { Localization, type QuestObjectiveDefinition, type Shell, type TwotterTweetInteraction } from "@hotbunny/hackhub-content-sdk";

import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT } from "./characters.js";
import { M01_I18N_KEY } from "./m01-i18n.js";
import { M01_TWOTTER_KEY } from "./m01-twotter-i18n.js";

const modAsset = (relativePath: string): string => `mod-asset://flatline-protocol/${relativePath.replace(/^\.\//, "")}`;

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
export const M01_LEGACY_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_LEGACY_CONTENT);

export const M01_DOMAIN = "blackwire-network.mkt";
export const M01_BLACKWIRE_GATEWAY_IP = "198.51.100.245";
export const M01_BLACKWIRE_GATEWAY_LAN_IP = "192.168.3.4";
export const M01_BLACKWIRE_GATEWAY_USERNAME = "netops";
export const M01_BLACKWIRE_GATEWAY_PASSWORD = "netops2022";
export const M01_BLACKWIRE_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_BLACKWIRE_GATEWAY_CONTENT);

export const M01_BROKER_ALIAS = "X7xS3NTRY9";
export const M01_LEDGERVAULT_PROJECT = "Q3-2026-SEA";

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
export const M01_FROSTGATE_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_FROSTGATE_GATEWAY_CONTENT);
export const M01_FROSTGATE_API_IP = "91.243.67.235";
export const M01_FROSTGATE_API_LAN_IP = "192.168.4.4";
export const M01_FROSTGATE_API_USERNAME = "apiadmin";
export const M01_FROSTGATE_API_PASSWORD = "apiadmin99";
export const M01_FROSTGATE_API_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_FROSTGATE_API_CONTENT);

export const M01_OBSIDIAN_DOMAIN = "obsidian-access.mkt";
export const M01_OBSIDIAN_ROUTER_IP = "5.188.94.1";
export const M01_OBSIDIAN_ROUTER_LAN_IP = "192.168.5.1";
export const M01_OBSIDIAN_IP = "5.188.94.130";
export const M01_OBSIDIAN_LAN_IP = "192.168.5.2";
export const M01_OBSIDIAN_GATEWAY_IP = "5.188.94.140";
export const M01_OBSIDIAN_GATEWAY_LAN_IP = "192.168.5.3";
export const M01_OBSIDIAN_GATEWAY_USERNAME = "mirror";
export const M01_OBSIDIAN_GATEWAY_PASSWORD = "mirror2023";
export const M01_OBSIDIAN_GATEWAY_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_OBSIDIAN_GATEWAY_CONTENT);
export const M01_OBSIDIAN_API_IP = "5.188.94.155";
export const M01_OBSIDIAN_API_LAN_IP = "192.168.5.4";
export const M01_OBSIDIAN_API_USERNAME = "apisvc";
export const M01_OBSIDIAN_API_PASSWORD = "svc2024api";
export const M01_OBSIDIAN_API_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.DEVICE_OBSIDIAN_API_CONTENT);

export const M01_LEDGERVAULT_DOMAIN = "x7k2m9vdlq4wnyt3.dark";
export const M01_LEDGERVAULT_IP = "185.220.31.6";

export const M01_ESCROW_DOMAIN = "clearescrow.io";
export const M01_ESCROW_IP = "46.29.115.63";
export const M01_ESCROW_APP_IP = "46.29.115.201";
export const M01_HOSPITAL_DOMAIN = "pacificcare-health.org";
export const M01_HOSPITAL_IP = "103.87.62.145";

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

    { name: M01_BROKER_INFRA_DOMAIN, ip: M01_BROKER_INFRA_IP, needsSubnet: true },
    { name: M01_BROKER_BACKEND_SUBDOMAIN, ip: M01_TARGET_IP, needsSubnet: false },
    { name: M01_BROKER_FIREWALL_SUBDOMAIN, ip: M01_FIREWALL_IP, needsSubnet: false },

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

    { name: M01_HOSPITAL_DOMAIN, ip: M01_HOSPITAL_IP, needsSubnet: true },
    { name: `www.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.9", needsSubnet: true },
    { name: `patientportal.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.188", needsSubnet: true },
    { name: `careers.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.71", needsSubnet: true },
    { name: `news.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.130", needsSubnet: true },
    { name: `mail.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.54", needsSubnet: true },
    { name: `status.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.216", needsSubnet: true },
    { name: `gateway.${M01_HOSPITAL_DOMAIN}`, ip: "103.87.62.97", needsSubnet: true },

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

export const M01_TWOTTER_OPS_HANDLE = "cryp7net";
export const M01_TWOTTER_OPS_FIRST_NAME = "Skylar";
export const M01_TWOTTER_OPS_LAST_NAME = "Webb";
export const M01_TWOTTER_OPS_AVATAR = modAsset("./assets/twotter-ops-avatar.png");
export const M01_TWOTTER_OPS_BANNER = modAsset("./assets/twotter-ops-banner.png");
export const M01_TWOTTER_CONTACT_HANDLE = "vau1tkeeper";
export const M01_TWOTTER_CONTACT_FIRST_NAME = "Elena";
export const M01_TWOTTER_CONTACT_LAST_NAME = "Cruz";
export const M01_TWOTTER_CONTACT_AVATAR = modAsset("./assets/twotter-contact-avatar.png");
export const M01_TWOTTER_CONTACT_BANNER = modAsset("./assets/twotter-contact-banner.png");
export const M01_TWOTTER_TRADER_HANDLE = "cryp7ocoin";
export const M01_TWOTTER_TRADER_FIRST_NAME = "Sarah";
export const M01_TWOTTER_TRADER_LAST_NAME = "Reyes";
export const M01_TWOTTER_TRADER_AVATAR = modAsset("./assets/twotter-trader-avatar.png");
export const M01_TWOTTER_TRADER_BANNER = modAsset("./assets/twotter-trader-banner.png");

export const M01_KIMAI_SCRIPT_NAME = "kimai";
export const M01_JWT_DECODER_SCRIPT_NAME = "jwt_decoder";

export const M01_LEDGER_FILE_NAME = "sales_ledger";
export const M01_LEDGER_FILE_EXTENSION = "log";
export const M01_BUYER_ALIAS = "TR4C3#404";
export const buildM01LedgerContent = (listingCode: string): string =>
    Localization.t(M01_I18N_KEY.LEDGER_CONTENT, { listingCode, buyer: M01_BUYER_ALIAS });

export const M01_OPS_NOTES_FILE_NAME = "ops_notes";
export const M01_OPS_NOTES_FILE_EXTENSION = "txt";
export const M01_OPS_NOTES_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_OPS_NOTES_CONTENT);

export const M01_IRC_HOST = "relay.blkledger.dark";
export const M01_IRC_PASSWORD = "n0ledger";
export const M01_IRC_USERNAME = "defc9";
export const M01_IRC_CONTACT_USERNAME = "t404";

export interface M01TwotterPost {
    readonly content: string;
    readonly interaction: TwotterTweetInteraction;
}

interface M01TwotterPostSpec {
    readonly key: string;
    readonly vars?: Record<string, string>;
    readonly interaction: TwotterTweetInteraction;
}

export const M01_TWOTTER_OPS_BIO = (): string => Localization.t(M01_TWOTTER_KEY.OPS_BIO);
const M01_TWOTTER_OPS_POST_SPECS: M01TwotterPostSpec[] = [
    { key: M01_TWOTTER_KEY.OPS_POST_01, interaction: { comments: 2, share: 0, likes: 6, views: 180 } },
    { key: M01_TWOTTER_KEY.OPS_POST_02, interaction: { comments: 0, share: 0, likes: 3, views: 90 } },
    { key: M01_TWOTTER_KEY.OPS_POST_03, vars: { domain: M01_FROSTGATE_DOMAIN }, interaction: { comments: 1, share: 2, likes: 9, views: 310 } },
    { key: M01_TWOTTER_KEY.OPS_POST_04, vars: { domain: M01_OBSIDIAN_DOMAIN }, interaction: { comments: 1, share: 1, likes: 10, views: 290 } },
    { key: M01_TWOTTER_KEY.OPS_POST_05, interaction: { comments: 3, share: 0, likes: 5, views: 140 } },
    { key: M01_TWOTTER_KEY.OPS_POST_06, interaction: { comments: 1, share: 0, likes: 11, views: 260 } },
    { key: M01_TWOTTER_KEY.OPS_POST_07, interaction: { comments: 2, share: 1, likes: 7, views: 200 } },
    { key: M01_TWOTTER_KEY.OPS_POST_08, interaction: { comments: 1, share: 0, likes: 8, views: 175 } },
    { key: M01_TWOTTER_KEY.OPS_POST_09, vars: { domain: M01_DOMAIN }, interaction: { comments: 0, share: 0, likes: 0, views: 21 } },
    { key: M01_TWOTTER_KEY.OPS_POST_10, interaction: { comments: 0, share: 0, likes: 4, views: 120 } },
    { key: M01_TWOTTER_KEY.OPS_POST_11, interaction: { comments: 4, share: 1, likes: 14, views: 340 } },
    { key: M01_TWOTTER_KEY.OPS_POST_12, vars: { handle: M01_TWOTTER_CONTACT_HANDLE }, interaction: { comments: 3, share: 0, likes: 9, views: 210 } },
    { key: M01_TWOTTER_KEY.OPS_POST_13, interaction: { comments: 2, share: 0, likes: 7, views: 195 } },
    { key: M01_TWOTTER_KEY.OPS_POST_14, vars: { handle: M01_TWOTTER_CONTACT_HANDLE }, interaction: { comments: 1, share: 0, likes: 6, views: 160 } },
    { key: M01_TWOTTER_KEY.OPS_POST_15, interaction: { comments: 2, share: 1, likes: 10, views: 230 } },
    { key: M01_TWOTTER_KEY.OPS_POST_16, vars: { handle: M01_TWOTTER_CONTACT_HANDLE }, interaction: { comments: 3, share: 0, likes: 8, views: 205 } },
];
export const buildM01TwotterOpsPosts = (): M01TwotterPost[] =>
    M01_TWOTTER_OPS_POST_SPECS.map((spec) => ({ content: Localization.t(spec.key, spec.vars), interaction: spec.interaction }));

export const M01_TWOTTER_CONTACT_BIO = (): string => Localization.t(M01_TWOTTER_KEY.CONTACT_BIO);
const M01_TWOTTER_CONTACT_POST_SPECS: M01TwotterPostSpec[] = [
    { key: M01_TWOTTER_KEY.CONTACT_POST_01, interaction: { comments: 3, share: 1, likes: 22, views: 480 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_02, interaction: { comments: 8, share: 2, likes: 35, views: 610 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_03, interaction: { comments: 1, share: 0, likes: 4, views: 150 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_04, interaction: { comments: 5, share: 3, likes: 41, views: 520 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_05, vars: { domain: M01_OBSIDIAN_DOMAIN }, interaction: { comments: 6, share: 4, likes: 52, views: 890 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_06, interaction: { comments: 14, share: 5, likes: 78, views: 1200 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_07, interaction: { comments: 2, share: 0, likes: 19, views: 430 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_08, vars: { domain: M01_OBSIDIAN_DOMAIN }, interaction: { comments: 22, share: 9, likes: 66, views: 1450 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_09, interaction: { comments: 6, share: 2, likes: 44, views: 700 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_10, interaction: { comments: 3, share: 1, likes: 30, views: 610 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_11, interaction: { comments: 1, share: 0, likes: 15, views: 350 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_12, interaction: { comments: 9, share: 6, likes: 60, views: 980 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_13, vars: { handle: M01_TWOTTER_OPS_HANDLE }, interaction: { comments: 6, share: 1, likes: 30, views: 560 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_14, interaction: { comments: 4, share: 1, likes: 25, views: 480 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_15, vars: { handle: M01_TWOTTER_OPS_HANDLE }, interaction: { comments: 7, share: 2, likes: 38, views: 640 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_16, interaction: { comments: 5, share: 1, likes: 27, views: 510 } },
    { key: M01_TWOTTER_KEY.CONTACT_POST_17, vars: { handle: M01_TWOTTER_OPS_HANDLE }, interaction: { comments: 8, share: 2, likes: 42, views: 700 } },
];
export const buildM01TwotterContactPosts = (): M01TwotterPost[] =>
    M01_TWOTTER_CONTACT_POST_SPECS.map((spec) => ({ content: Localization.t(spec.key, spec.vars), interaction: spec.interaction }));

export const M01_TWOTTER_TRADER_BIO = (): string => Localization.t(M01_TWOTTER_KEY.TRADER_BIO);
const M01_TWOTTER_TRADER_POST_SPECS: M01TwotterPostSpec[] = [
    { key: M01_TWOTTER_KEY.TRADER_POST_01, interaction: { comments: 30, share: 40, likes: 210, views: 3200 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_02, interaction: { comments: 45, share: 60, likes: 260, views: 4100 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_03, interaction: { comments: 25, share: 15, likes: 180, views: 2600 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_04, vars: { domain: M01_FROSTGATE_DOMAIN }, interaction: { comments: 52, share: 90, likes: 340, views: 5200 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_05, interaction: { comments: 60, share: 110, likes: 410, views: 6100 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_06, interaction: { comments: 88, share: 200, likes: 560, views: 8800 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_07, interaction: { comments: 40, share: 70, likes: 300, views: 4700 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_08, vars: { domain: M01_FROSTGATE_DOMAIN }, interaction: { comments: 35, share: 55, likes: 250, views: 3900 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_09, interaction: { comments: 48, share: 80, likes: 320, views: 5300 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_10, interaction: { comments: 70, share: 180, likes: 480, views: 7200 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_11, interaction: { comments: 38, share: 65, likes: 270, views: 4400 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_12, interaction: { comments: 20, share: 25, likes: 190, views: 3000 } },
    { key: M01_TWOTTER_KEY.TRADER_POST_13, interaction: { comments: 18, share: 20, likes: 175, views: 2900 } },
];
export const buildM01TwotterTraderPosts = (): M01TwotterPost[] =>
    M01_TWOTTER_TRADER_POST_SPECS.map((spec) => ({ content: Localization.t(spec.key, spec.vars), interaction: spec.interaction }));

export interface M01IrcLine {
    username: string;
    message: string;
}

export const buildM01IrcConversation = (): M01IrcLine[] => [
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L01) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L02) },
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L03) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L04) },
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L05) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L06) },
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L07) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L08) },
    { username: M01_IRC_USERNAME, message: "x7k2m9vdlq4wnyt3" },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L10) },
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L11) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L12) },
    { username: M01_IRC_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L13) },
    { username: M01_IRC_CONTACT_USERNAME, message: Localization.t(M01_I18N_KEY.IRC_L14) },
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

export const M01_DUMMY_TODO_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_DUMMY_TODO);
export const M01_DUMMY_README_CONTENT = (): string => Localization.t(M01_I18N_KEY.DEVICE_DUMMY_README);
export const M01_DUMMY_AUTH_LOG_CONTENT = [
    "Failed password for invalid user admin from 91.203.44.12",
    "Accepted password for opsadmin from 10.0.0.4",
    "Failed password for root from 185.220.101.3",
].join("\n");
export const M01_DUMMY_CRON_LOG_CONTENT = [
    "backup.sh completed successfully",
    "cert-renew.sh: no action needed",
    "vault-sync.sh completed successfully",
].join("\n");
export const M01_DUMMY_SYSTEM_LOG_CONTENT = [
    "disk usage at 62%",
    "service nginx restarted",
].join("\n");

export const M01_TIP_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_TIP_SUBJECT);
export const M01_TIP_CONTENT = (): string => Localization.t(M01_I18N_KEY.MAIL_TIP_CONTENT);

export const M01_CASE_ID = "CASE-A7X-0417";

export const M01_REPORT_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M01_REPORT_TEMPLATE_ID = "flatline.m01.report";
export const M01_REPORT_TEMPLATE_LABEL = "Mission 1 Findings";
export const M01_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M01_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT);
export const buildM01ReportBody = (listingCode: string): string =>
    Localization.t(M01_I18N_KEY.MAIL_REPORT_BODY, {
        listingCode,
        broker: M01_BROKER_ALIAS,
        buyer: M01_BUYER_ALIAS,
        caseId: M01_CASE_ID,
        project: M01_LEDGERVAULT_PROJECT,
        vaultUrl: M01_LEDGERVAULT_DOMAIN,
    });

export const M01_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M01_TIPSTER_EMAIL = ANONYMOUS_TIPSTER.email;

export const M01_HACKHUB_AUTHOR_NAME = "GHOSTWIRE";
export const M01_HACKHUB_AUTHOR_AVATAR = "./assets/ghostwire-avatar.png";
export const M01_HACKHUB_POST_MEDIA = "./assets/flatline-protocol-ops.png";
export const M01_HACKHUB_POST_CONTENT = (): string => Localization.t(M01_I18N_KEY.HACKHUB_POST_CONTENT);

export const M01_CUSTODIAN_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_CUSTODIAN_SUBJECT);
export const M01_CUSTODIAN_CONTENT = (): string => Localization.t(M01_I18N_KEY.MAIL_CUSTODIAN_CONTENT);

export const M01_BLACKWIRE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 22, status: "FILTERED", service: "ssh", destination: "Firewall" },
    { port: 80, status: "CLOSE", service: "http" },
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_FIREWALL_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 80, status: "OPEN", service: "http" },
];

export const M01_FROSTGATE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_OBSIDIAN_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_ESCROW_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "OPEN", service: "https" },
];

export const M01_BROKER_NMAP_RESULT: Shell.NmapPort[] = [
    { port: 443, status: "CLOSE", service: "https" },
];

export const M01_OBJECTIVE_IDS = {
    reportFindings: "m01.objective.03",
} as const;

export const buildM01Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M01_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M01_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M01_REWARDS = {
    money: 250,
    xp: 60,
} as const;
