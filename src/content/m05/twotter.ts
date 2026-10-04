import { Localization } from "@hotbunny/hackhub-content-sdk";

import type { PersonaPost, PersonaSpec } from "../../core/types.js";
import { sealText } from "../../components/text-seal.js";
import { M05_TWOTTER_KEY } from "../../i18n/m05/twotter.js";
import { M01_LEDGERVAULT_PROJECT_LABEL } from "../global/case.js";
import { M05_GRETA_NOTE_PLAINTEXT } from "./sealed.js";
import { M05_GRETA_PASSWORD } from "./network.js";

export const M05_GRETA_HANDLE = "@g.desouza";
export const M05_GARETH_HANDLE = "@g.lim";
export const M05_GRETA_FIRST_NAME = "Greta";
export const M05_GRETA_LAST_NAME = "de Souza";
export const M05_GARETH_FIRST_NAME = "Gareth";
export const M05_GARETH_LAST_NAME = "Lim";
export const M05_GRETA_FULL_NAME = `${M05_GRETA_FIRST_NAME} ${M05_GRETA_LAST_NAME}`;
export const M05_GARETH_FULL_NAME = `${M05_GARETH_FIRST_NAME} ${M05_GARETH_LAST_NAME}`;
export const M05_GRETA_TWOTTER_USERNAME = "g.desouza";
export const M05_GARETH_TWOTTER_USERNAME = "g.lim";
export const M05_GRETA_LYNX_INPUTS: readonly string[] = [M05_GRETA_HANDLE, M05_GRETA_FULL_NAME];

export const M05_GRETA_SEALED_HEX = sealText(M05_GRETA_NOTE_PLAINTEXT, M05_GRETA_PASSWORD);

const post = (key: string, likes: number, vars?: Record<string, string>): PersonaPost => ({
    content: Localization.t(key, vars),
    interaction: { likes, comments: 0, share: 0, views: likes * 9 },
});

const sealedPost = (likes: number): PersonaPost => ({
    content: `${Localization.t(M05_TWOTTER_KEY.GRETA_POST_SEALED)}\n\n${M05_GRETA_SEALED_HEX}`,
    interaction: { likes, comments: 0, share: 0, views: likes * 9 },
});

export const buildM05GretaPersona = (): PersonaSpec => ({
    username: M05_GRETA_TWOTTER_USERNAME,
    firstName: M05_GRETA_FIRST_NAME,
    lastName: M05_GRETA_LAST_NAME,
    bio: Localization.t(M05_TWOTTER_KEY.GRETA_BIO),
    gender: "female",
    tweetIdPrefix: "m05-greta",
    posts: [
        post(M05_TWOTTER_KEY.GRETA_POST_1, 6),
        post(M05_TWOTTER_KEY.GRETA_POST_2, 3),
        post(M05_TWOTTER_KEY.GRETA_POST_3, 2),
        post(M05_TWOTTER_KEY.GRETA_POST_4, 9),
        sealedPost(4),
        post(M05_TWOTTER_KEY.GRETA_POST_6, 5),
        post(M05_TWOTTER_KEY.GRETA_POST_7, 12),
        post(M05_TWOTTER_KEY.GRETA_POST_8, 8),
        post(M05_TWOTTER_KEY.GRETA_POST_9, 7),
        post(M05_TWOTTER_KEY.GRETA_POST_10, 3),
        post(M05_TWOTTER_KEY.GRETA_POST_11, 11, { label: M01_LEDGERVAULT_PROJECT_LABEL }),
        post(M05_TWOTTER_KEY.GRETA_POST_12, 4),
        post(M05_TWOTTER_KEY.GRETA_POST_13, 14),
        post(M05_TWOTTER_KEY.GRETA_POST_14, 21),
        post(M05_TWOTTER_KEY.GRETA_POST_15, 10),
        post(M05_TWOTTER_KEY.GRETA_POST_16, 5),
    ],
});

export const buildM05GarethPersona = (): PersonaSpec => ({
    username: M05_GARETH_TWOTTER_USERNAME,
    firstName: M05_GARETH_FIRST_NAME,
    lastName: M05_GARETH_LAST_NAME,
    bio: Localization.t(M05_TWOTTER_KEY.GARETH_BIO),
    gender: "male",
    tweetIdPrefix: "m05-gareth",
    posts: [
        post(M05_TWOTTER_KEY.GARETH_POST_1, 5),
        post(M05_TWOTTER_KEY.GARETH_POST_2, 3),
        post(M05_TWOTTER_KEY.GARETH_POST_3, 6),
        post(M05_TWOTTER_KEY.GARETH_POST_4, 19),
        post(M05_TWOTTER_KEY.GARETH_POST_5, 5),
    ],
});
