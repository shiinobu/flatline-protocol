import { Localization, type TwotterTweetInteraction } from "@hotbunny/hackhub-content-sdk";

import { M01_TWOTTER_KEY } from "../../i18n/m01/twotter.js";
import { M01_DOMAIN, M01_FROSTGATE_DOMAIN, M01_OBSIDIAN_DOMAIN } from "./network.js";

export const M01_TWOTTER_OPS_HANDLE = "cryp7net";
export const M01_TWOTTER_OPS_FIRST_NAME = "Skylar";
export const M01_TWOTTER_OPS_LAST_NAME = "Webb";

export const M01_TWOTTER_CONTACT_HANDLE = "vau1tkeeper";
export const M01_TWOTTER_CONTACT_FIRST_NAME = "Elena";
export const M01_TWOTTER_CONTACT_LAST_NAME = "Cruz";

export const M01_TWOTTER_TRADER_HANDLE = "cryp7ocoin";
export const M01_TWOTTER_TRADER_FIRST_NAME = "Sarah";
export const M01_TWOTTER_TRADER_LAST_NAME = "Reyes";

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
