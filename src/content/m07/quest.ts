import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";

export const M07_OBJECTIVE_IDS = {
    reportFindings: "m07.objective.00",
} as const;

export const buildM07Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M07_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M07_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M07_REWARD_MONEY = 5000;
export const M07_REWARD_DESCRIPTION = "The Architect — contract settled";

export const M07_SAVE_PREFIX = "flatline.m07";
export const M07_SCOPE = "M07";

export const M07_DUEL_ONE_PREFIX = "flatline.m07.duelOne";
export const M07_DUEL_ONE_STRIKE_ID = "index";
export const M07_DUEL_ONE_DEADLINE_REAL_MS = 240_000;
export const M07_DUEL_ONE_HALVED_REAL_MS = 120_000;

export const M07_DUEL_TWO_PREFIX = "flatline.m07.duelTwo";
export const M07_DUEL_TWO_STRIKE_ID = "chair";
export const M07_DUEL_TWO_DEADLINE_REAL_MS = 180_000;

export const M07_DUEL_PENALTY = 500;
export const M07_HONEYPOT_PENALTY = 500;
