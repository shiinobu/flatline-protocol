import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";

export const M04_OBJECTIVE_IDS = {
    reportFindings: "m04.objective.00",
} as const;

export const buildM04Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M04_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M04_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M04_REWARD_MONEY = 800;
export const M04_REWARD_DESCRIPTION = "Burn Notice — contract settled";

export const M04_SAVE_PREFIX = "flatline.m04";
export const M04_SCOPE = "M04";

export const M04_STRIKE_PROBE_ID = "probe";
export const M04_STRIKE_DELAY_REAL_MS = 20_000;
export const M04_STRIKE_DEADLINE_REAL_MS = 120_000;
export const M04_STRIKE_PENALTY = 300;
export const M04_HONEYPOT_PENALTY = 500;

export const M04_STRIKE_BREACH_ID = "breach";
export const M04_BREACH_DELAY_REAL_MS = 15_000;
export const M04_INCIDENT_CLOCK = "03:14:07";
