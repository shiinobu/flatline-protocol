import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M02_I18N_KEY } from "../../i18n/m02/core.js";
import { M01_CASE_ID } from "../global/case.js";
import { M02_SHELL_COMPANY_NAME } from "../global/entities.js";
import { RANSOM_BATCH_HOSPITAL, formatUsd } from "../global/finance.js";

export const M02_STORY_DAY = { year: 2026, month: 9, day: 19 } as const;

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
export const M02_LOG_DEVELOPER = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_DEVELOPER_1),
    Localization.t(M02_I18N_KEY.LOG_DEVELOPER_2),
];
export const M02_LOG_RANSOM = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_RANSOM_1, { amount: formatUsd(RANSOM_BATCH_HOSPITAL.gross) }),
    Localization.t(M02_I18N_KEY.LOG_RANSOM_2),
];
export const M02_LOG_HOME = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_HOME_1),
    Localization.t(M02_I18N_KEY.LOG_HOME_2),
];
export const M02_LOG_FIREWALL = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_FIREWALL_1),
    Localization.t(M02_I18N_KEY.LOG_FIREWALL_2),
];
export const M02_LOG_WORKSTATION = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_WORKSTATION_1),
    Localization.t(M02_I18N_KEY.LOG_WORKSTATION_2),
];
export const M02_LOG_SHELL = (): readonly string[] => [
    Localization.t(M02_I18N_KEY.LOG_SHELL_1, { company: M02_SHELL_COMPANY_NAME }),
    Localization.t(M02_I18N_KEY.LOG_SHELL_2),
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
    money: 1000,
} as const;
