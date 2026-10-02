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
