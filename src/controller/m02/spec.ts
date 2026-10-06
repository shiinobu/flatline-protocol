import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M02_REWARDS, buildM02Objectives } from "../../content/m02/quest.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../../guard/flags.js";
import { M02_I18N_KEY } from "../../i18n/m02/core.js";

export const M02_QUEST = {
    name: "flatline.m02",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M02_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M02_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m02", ["flatline.m01"]),
    rewards: () => (isQuestDevFocus("m02") || isQuestTesterFocus("m02") ? { money: 0, xp: 0 } : M02_REWARDS),
    objectives: () => applyDevGating(buildM02Objectives(), isQuestDevFocus("m02")),
} as const;
