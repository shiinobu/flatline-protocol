import { Localization, type TwotterTweetInteraction } from "@hotbunny/hackhub-content-sdk";

import type { PersonaSpec } from "../../core/types.js";
import { M03_TWOTTER_KEY } from "../../i18n/m03/twotter.js";

export const M03_TWOTTER_HANDLE = "d.reyes";
export const M03_TWOTTER_FIRST_NAME = "Dana";
export const M03_TWOTTER_LAST_NAME = "Reyes";
export const M03_OKAFOR_HANDLE = "m.okafor";
export const M03_OKAFOR_FIRST_NAME = "Marcus";
export const M03_OKAFOR_LAST_NAME = "Okafor";
export const M03_OKAFOR_FAKE_WIFI_PASSWORD = "SkynetGuest2019";

interface PostSource {
    readonly key: string;
    readonly interaction: TwotterTweetInteraction;
}

const REYES_POSTS: readonly PostSource[] = [
    { key: M03_TWOTTER_KEY.REYES_POST_1, interaction: { comments: 4, share: 1, likes: 12, views: 340 } },
    { key: M03_TWOTTER_KEY.REYES_POST_2, interaction: { comments: 2, share: 0, likes: 8, views: 210 } },
    { key: M03_TWOTTER_KEY.REYES_POST_3, interaction: { comments: 6, share: 0, likes: 33, views: 520 } },
    { key: M03_TWOTTER_KEY.REYES_POST_4, interaction: { comments: 3, share: 1, likes: 9, views: 280 } },
    { key: M03_TWOTTER_KEY.REYES_POST_5, interaction: { comments: 7, share: 2, likes: 18, views: 610 } },
    { key: M03_TWOTTER_KEY.REYES_POST_6, interaction: { comments: 5, share: 0, likes: 14, views: 430 } },
    { key: M03_TWOTTER_KEY.REYES_POST_7, interaction: { comments: 1, share: 0, likes: 6, views: 190 } },
];

const OKAFOR_POSTS: readonly PostSource[] = [
    { key: M03_TWOTTER_KEY.OKAFOR_POST_1, interaction: { comments: 3, share: 0, likes: 7, views: 240 } },
    { key: M03_TWOTTER_KEY.OKAFOR_POST_2, interaction: { comments: 5, share: 2, likes: 11, views: 520 } },
    { key: M03_TWOTTER_KEY.OKAFOR_POST_3, interaction: { comments: 2, share: 0, likes: 9, views: 300 } },
    { key: M03_TWOTTER_KEY.OKAFOR_POST_4, interaction: { comments: 4, share: 1, likes: 14, views: 410 } },
    { key: M03_TWOTTER_KEY.OKAFOR_POST_5, interaction: { comments: 6, share: 0, likes: 8, views: 350 } },
];

const translatePosts = (sources: readonly PostSource[]): PersonaSpec["posts"] =>
    sources.map(({ key, interaction }) => ({
        content: Localization.t(key, { wifi: M03_OKAFOR_FAKE_WIFI_PASSWORD }),
        interaction,
    }));

export const buildM03ReyesPersona = (): PersonaSpec => ({
    username: M03_TWOTTER_HANDLE,
    firstName: M03_TWOTTER_FIRST_NAME,
    lastName: M03_TWOTTER_LAST_NAME,
    bio: Localization.t(M03_TWOTTER_KEY.REYES_BIO),
    gender: "female",
    tweetIdPrefix: "m03-reyes-tweet-",
    posts: translatePosts(REYES_POSTS),
});

export const buildM03OkaforPersona = (): PersonaSpec => ({
    username: M03_OKAFOR_HANDLE,
    firstName: M03_OKAFOR_FIRST_NAME,
    lastName: M03_OKAFOR_LAST_NAME,
    bio: Localization.t(M03_TWOTTER_KEY.OKAFOR_BIO),
    gender: "male",
    tweetIdPrefix: "m03-okafor-tweet-",
    posts: translatePosts(OKAFOR_POSTS),
});
