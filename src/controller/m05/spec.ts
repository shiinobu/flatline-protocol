import { Localization } from "@hotbunny/hackhub-content-sdk";

import { buildM05Objectives } from "../../content/m05/quest.js";
import { applyDevGating, isQuestDevFocus, questGate } from "../../guard/flags.js";
import { M05_I18N_KEY } from "../../i18n/m05/core.js";

export const M05_QUEST = {
    name: "flatline.m05",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M05_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M05_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m05", ["flatline.m04"]),
    objectives: () => applyDevGating(buildM05Objectives(), isQuestDevFocus("m05")),
} as const;
