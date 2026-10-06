import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M03_REWARDS, buildM03Objectives } from "../../content/m03/quest.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../../guard/flags.js";
import { M03_I18N_KEY } from "../../i18n/m03/core.js";

export const M03_QUEST = {
    name: "flatline.m03",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M03_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M03_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m03", ["flatline.m02"]),
    rewards: () => (isQuestDevFocus("m03") || isQuestTesterFocus("m03") ? { money: 0, xp: 0 } : M03_REWARDS),
    objectives: () => applyDevGating(buildM03Objectives(), isQuestDevFocus("m03")),
} as const;
