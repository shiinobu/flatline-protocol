import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M01_HACKHUB_AUTHOR_AVATAR, M01_HACKHUB_POST_MEDIA } from "../../content/m01/assets.js";
import {
    M01_HACKHUB_AUTHOR_NAME,
    M01_HACKHUB_POST_CONTENT,
    M01_REWARDS,
    buildM01Objectives,
} from "../../content/m01/quest.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../../guard/flags.js";
import { M01_I18N_KEY } from "../../i18n/m01/core.js";

export const M01_QUEST = {
    name: "flatline.m01",
    group: "storyline",
    title: (): string => Localization.t(M01_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M01_I18N_KEY.QUEST_DESCRIPTION),
    autoStart: (): boolean => isQuestDevFocus("m01"),
    questsToComplete: (): string[] => questGate("m01", []),
    rewards: () => (isQuestDevFocus("m01") || isQuestTesterFocus("m01") ? { money: 0, xp: 0 } : M01_REWARDS),
    hackhubPost: () => ({
        content: M01_HACKHUB_POST_CONTENT(),
        media: M01_HACKHUB_POST_MEDIA,
        author: { name: M01_HACKHUB_AUTHOR_NAME, avatar: M01_HACKHUB_AUTHOR_AVATAR },
    }),
    objectives: () => applyDevGating(buildM01Objectives(), isQuestDevFocus("m01")),
} as const;
