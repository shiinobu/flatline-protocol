import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";

export const M05_OBJECTIVE_IDS = {
    reportFindings: "m05.objective.00",
} as const;

export const buildM05Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M05_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M05_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M05_STORY_DAY = { year: 2026, month: 9, day: 27 } as const;

export const M05_REWARD_MONEY = 2500;
export const M05_REWARD_DESCRIPTION = "The Door — contract settled";

export const M05_PAID_AT = "09:02";
export const M05_GAP_TEXT = "6 hours 21 minutes";
export const M05_GAP_TOTAL_MINUTES = "381";
