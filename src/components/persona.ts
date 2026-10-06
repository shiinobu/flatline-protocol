import { Twotter, type TwotterUser } from "@hotbunny/hackhub-content-sdk";

import type { PersonaSpec } from "../core/types.js";

const findOrCreateUser = (spec: PersonaSpec): TwotterUser => {
    const user =
        Twotter.getUserByUsername(spec.username) ??
        Twotter.createUser({
            username: spec.username,
            firstName: spec.firstName,
            lastName: spec.lastName,
            ...(spec.avatar === undefined ? {} : { avatar: spec.avatar }),
            ...(spec.banner === undefined ? {} : { banner: spec.banner }),
            bio: spec.bio,
            gender: spec.gender,
        });
    if (!Twotter.getUserByUsername(spec.username)) Twotter.addUser(user);
    return user;
};

const syncProfile = (user: TwotterUser, spec: PersonaSpec): void => {
    Twotter.updateUser(user.id, {
        name: spec.firstName,
        surname: spec.lastName,
        ...(spec.avatar === undefined ? {} : { avatar: spec.avatar }),
        ...(spec.banner === undefined ? {} : { banner: spec.banner }),
        bio: spec.bio,
    });
};

const postTweets = (user: TwotterUser, spec: PersonaSpec): void => {
    spec.posts.forEach((post, index) => {
        const id = `${spec.tweetIdPrefix}${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({
            id,
            userId: user.id,
            content: post.content,
            interaction: post.interaction,
        });
    });
};

export const seedPersona = (spec: PersonaSpec): void => {
    const user = findOrCreateUser(spec);
    syncProfile(user, spec);
    postTweets(user, spec);
};
