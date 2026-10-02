import { Localization } from "@hotbunny/hackhub-content-sdk";

import { buildM06Objectives } from "../../content/m06/quest.js";
import { applyDevGating, isQuestDevFocus, questGate } from "../../guard/flags.js";
import { M06_I18N_KEY } from "../../i18n/m06/core.js";

export const M06_QUEST = {
    name: "flatline.m06",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M06_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M06_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m06", ["flatline.m05"]),
    objectives: () => applyDevGating(buildM06Objectives(), isQuestDevFocus("m06")),
} as const;
