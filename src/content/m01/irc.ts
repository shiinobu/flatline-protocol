import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M01_I18N_KEY } from "../../i18n/m01/core.js";

export const M01_IRC_HOST = "relay.blkledger.dark";
export const M01_IRC_PASSWORD = "n0ledger";
export const M01_IRC_USERNAME = "defc9";
export const M01_IRC_CONTACT_USERNAME = "t404";

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
export const M01_IRC_NOTES_FILE_CONTENT = "2026-09-16 15:01:00 UTC  [ENCRYPTED]";
