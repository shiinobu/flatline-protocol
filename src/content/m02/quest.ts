import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M02_I18N_KEY } from "../../i18n/m02/core.js";
import { M01_CASE_ID } from "../global/case.js";

export const M02_LOG_DEFAULT = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_DEFAULT_1, { caseId: M01_CASE_ID }),
    Localization.t(M02_I18N_KEY.LOG_DEFAULT_2),
    Localization.t(M02_I18N_KEY.LOG_DEFAULT_3),
];
export const M02_LOG_AFTERMATH = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_AFTERMATH_1),
    Localization.t(M02_I18N_KEY.LOG_AFTERMATH_2),
    Localization.t(M02_I18N_KEY.LOG_AFTERMATH_3),
];

export const M02_OBJECTIVE_IDS = {
    reportFindings: "m02.objective.07",
} as const;

export const buildM02Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M02_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M02_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M02_REWARDS = {
    money: 400,
    xp: 90,
} as const;
