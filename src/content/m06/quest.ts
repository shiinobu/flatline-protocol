import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M06_I18N_KEY } from "../../i18n/m06/core.js";

export const M06_OBJECTIVE_IDS = {
    reportFindings: "m06.objective.00",
} as const;

export const buildM06Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M06_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M06_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M06_REWARD_MONEY = 3500;
export const M06_REWARD_DESCRIPTION = "Open Register — contract settled";
