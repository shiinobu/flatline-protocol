import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M01_I18N_KEY } from "../../i18n/m01/core.js";

export const M01_PROJECT_OPENED_EVENT = "flatline.m01.projectOpened";

export const M01_LOG_DEFAULT = (): readonly string[] => [
    Localization.t(M01_I18N_KEY.LOG_DEFAULT_1),
    Localization.t(M01_I18N_KEY.LOG_DEFAULT_2),
];
export const M01_LOG_AFTERMATH = (): readonly string[] => [
    Localization.t(M01_I18N_KEY.LOG_AFTERMATH_1),
    Localization.t(M01_I18N_KEY.LOG_AFTERMATH_2),
    Localization.t(M01_I18N_KEY.LOG_AFTERMATH_3),
];

export const M01_HACKHUB_AUTHOR_NAME = "GHOSTWIRE";

export const M01_HACKHUB_POST_CONTENT = (): string => Localization.t(M01_I18N_KEY.HACKHUB_POST_CONTENT);

export const M01_OBJECTIVE_IDS = {
    reportFindings: "m01.objective.03",
} as const;

export const buildM01Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M01_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M01_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M01_REWARDS = {
    money: 250,
    xp: 60,
} as const;
