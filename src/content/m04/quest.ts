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

export const M04_REWARD_MONEY = 2400;
export const M04_REWARD_DESCRIPTION = "Burn Notice — contract settled";

export const M04_SAVE_PREFIX = "flatline.m04";
export const M04_SCOPE = "M04";

export const M04_STRIKE_PROBE_ID = "probe";
export const M04_STRIKE_DELAY_REAL_MS = 20_000;
export const M04_STRIKE_DEADLINE_REAL_MS = 60_000;
export const M04_HONEYPOT_PENALTY = 500;

export const M04_STRIKE_BREACH_ID = "breach";
export const M04_BREACH_HANDOFF_REAL_MS = 100;
export const M04_FIREWALL_LOG_DELAY_REAL_MS = 1_500;
export const M04_RESTORE_MAIL_DELAY_REAL_MS = 4_000;

export const M04_STORY_DAY = { year: 2026, month: 9, day: 24 } as const;
