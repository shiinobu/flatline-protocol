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

export const M07_TRACE_STRIKE_ID = "trace";
export const M07_TRACE_DEADLINE_REAL_MS = 240_000;
export const M07_TRACE_HALVED_REAL_MS = 120_000;
export const M07_TRACE_PENALTY = 500;
export const M07_HONEYPOT_PENALTY = 500;
