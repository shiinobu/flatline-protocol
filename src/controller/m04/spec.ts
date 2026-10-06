import { Localization } from "@hotbunny/hackhub-content-sdk";

import { buildM04Objectives } from "../../content/m04/quest.js";
import { applyDevGating, isQuestDevFocus, questGate } from "../../guard/flags.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";

export const M04_QUEST = {
    name: "flatline.m04",
    group: "storyline",
    autoStart: true,
    title: (): string => Localization.t(M04_I18N_KEY.QUEST_TITLE),
    description: (): string => Localization.t(M04_I18N_KEY.QUEST_DESCRIPTION),
    questsToComplete: (): string[] => questGate("m04", ["flatline.m03"]),
    objectives: () => applyDevGating(buildM04Objectives(), isQuestDevFocus("m04")),
} as const;
