import type { IntroSpec, PersonaSpec } from "../../core/types.js";

import {
    M01_TWOTTER_CONTACT_AVATAR,
    M01_TWOTTER_CONTACT_BANNER,
    M01_TWOTTER_OPS_AVATAR,
    M01_TWOTTER_OPS_BANNER,
    M01_TWOTTER_TRADER_AVATAR,
    M01_TWOTTER_TRADER_BANNER,
} from "./assets.js";
import {
    M01_CUSTODIAN_CONTENT,
    M01_CUSTODIAN_SUBJECT,
    M01_DEAD_DROP_EMAIL,
    M01_TIP_CONTENT,
    M01_TIP_SUBJECT,
    M01_TIPSTER_EMAIL,
} from "./mail.js";
import {
    buildM01TwotterContactPosts,
    buildM01TwotterOpsPosts,
    buildM01TwotterTraderPosts,
    M01_TWOTTER_CONTACT_BIO,
    M01_TWOTTER_CONTACT_FIRST_NAME,
    M01_TWOTTER_CONTACT_HANDLE,
    M01_TWOTTER_CONTACT_LAST_NAME,
    M01_TWOTTER_OPS_BIO,
    M01_TWOTTER_OPS_FIRST_NAME,
    M01_TWOTTER_OPS_HANDLE,
    M01_TWOTTER_OPS_LAST_NAME,
    M01_TWOTTER_TRADER_BIO,
    M01_TWOTTER_TRADER_FIRST_NAME,
    M01_TWOTTER_TRADER_HANDLE,
    M01_TWOTTER_TRADER_LAST_NAME,
} from "./twotter.js";

const buildOpsPersona = (): PersonaSpec => ({
    username: M01_TWOTTER_OPS_HANDLE,
    firstName: M01_TWOTTER_OPS_FIRST_NAME,
    lastName: M01_TWOTTER_OPS_LAST_NAME,
    avatar: M01_TWOTTER_OPS_AVATAR,
    banner: M01_TWOTTER_OPS_BANNER,
    bio: M01_TWOTTER_OPS_BIO(),
    gender: "male",
    tweetIdPrefix: "m01-broker-tweet-",
    posts: buildM01TwotterOpsPosts(),
});

const buildContactPersona = (): PersonaSpec => ({
    username: M01_TWOTTER_CONTACT_HANDLE,
    firstName: M01_TWOTTER_CONTACT_FIRST_NAME,
    lastName: M01_TWOTTER_CONTACT_LAST_NAME,
    avatar: M01_TWOTTER_CONTACT_AVATAR,
    banner: M01_TWOTTER_CONTACT_BANNER,
    bio: M01_TWOTTER_CONTACT_BIO(),
    gender: "female",
    tweetIdPrefix: "m01-contact-tweet-",
    posts: buildM01TwotterContactPosts(),
});

const buildTraderPersona = (): PersonaSpec => ({
    username: M01_TWOTTER_TRADER_HANDLE,
    firstName: M01_TWOTTER_TRADER_FIRST_NAME,
    lastName: M01_TWOTTER_TRADER_LAST_NAME,
    avatar: M01_TWOTTER_TRADER_AVATAR,
    banner: M01_TWOTTER_TRADER_BANNER,
    bio: M01_TWOTTER_TRADER_BIO(),
    gender: "female",
    tweetIdPrefix: "m01-decoy-tweet-",
    posts: buildM01TwotterTraderPosts(),
});

export const M01_INTRO: IntroSpec = {
    personas: () => [buildOpsPersona(), buildContactPersona(), buildTraderPersona()],
    mails: () => [
        { from: M01_DEAD_DROP_EMAIL, subject: M01_CUSTODIAN_SUBJECT(), content: M01_CUSTODIAN_CONTENT() },
        { from: M01_TIPSTER_EMAIL, subject: M01_TIP_SUBJECT(), content: M01_TIP_CONTENT() },
    ],
};
