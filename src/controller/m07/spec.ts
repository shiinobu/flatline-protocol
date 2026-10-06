import { Localization } from "@hotbunny/hackhub-content-sdk";

import { buildM07Objectives } from "../../content/m07/quest.js";
import { applyDevGating, isQuestDevFocus, questGate } from "../../guard/flags.js";
import { M07_I18N_KEY } from "../../i18n/m07/core.js";

export const M07_QUEST = {
    name: "flatline.m07",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M07_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M07_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m07", ["flatline.m06"]),
    objectives: () => applyDevGating(buildM07Objectives(), isQuestDevFocus("m07")),
} as const;
