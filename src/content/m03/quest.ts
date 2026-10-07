import { Localization, type QuestObjectiveDefinition } from "@hotbunny/hackhub-content-sdk";

import { M03_I18N_KEY } from "../../i18n/m03/core.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import { formatUsd } from "../global/finance.js";
import { M03_ALL_TOTALS } from "./ledger.js";
import { M03_VAULTLINE_CODENAME } from "./network.js";

export const M03_LOG_LEDGER = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_LEDGER_1),
    Localization.t(M03_I18N_KEY.LOG_LEDGER_2, {
        parent: formatUsd(M03_ALL_TOTALS.parent),
        gross: formatUsd(M03_ALL_TOTALS.gross),
        entity: M03_PARENT_ENTITY_NAME,
    }),
];
export const M03_LOG_TUNNEL = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_TUNNEL_1),
    Localization.t(M03_I18N_KEY.LOG_TUNNEL_2),
    Localization.t(M03_I18N_KEY.LOG_TUNNEL_3),
];
export const M03_LOG_REYES = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_REYES_1),
    Localization.t(M03_I18N_KEY.LOG_REYES_2),
];
export const M03_LOG_AFTERMATH = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_AFTERMATH_1),
    Localization.t(M03_I18N_KEY.LOG_AFTERMATH_2),
];
export const M03_LOG_PORTAL = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_PORTAL_1),
    Localization.t(M03_I18N_KEY.LOG_PORTAL_2),
];
export const M03_LOG_PIVOT = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_PIVOT_1),
    Localization.t(M03_I18N_KEY.LOG_PIVOT_2),
];
export const M03_LOG_GATEWAY = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_GATEWAY_1, { gateway: M03_VAULTLINE_CODENAME }),
    Localization.t(M03_I18N_KEY.LOG_GATEWAY_2),
];
export const M03_LOG_ACCOMPLICE = (): readonly string[] => [
    Localization.t(M03_I18N_KEY.LOG_ACCOMPLICE_1),
    Localization.t(M03_I18N_KEY.LOG_ACCOMPLICE_2),
];

export const M03_OBJECTIVE_IDS = {
    reportFindings: "m03.objective.00",
} as const;

export const buildM03Objectives = (): QuestObjectiveDefinition[] => [
    {
        name: M03_OBJECTIVE_IDS.reportFindings,
        description: Localization.t(M03_I18N_KEY.OBJECTIVE_REPORT_FINDINGS),
    },
];

export const M03_REWARDS = {
    money: 1000,
} as const;
