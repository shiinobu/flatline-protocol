import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_LOG_KEY } from "../../i18n/m07/logs.js";
import { M07_CHOICE_DESTROY, M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF } from "./choice.js";

const logs =
    (...keys: readonly string[]): (() => readonly string[]) =>
    () =>
        keys.map((key) => Localization.t(key));

export const M07_LOG_CLAIMS = logs(M07_LOG_KEY.CLAIMS_1, M07_LOG_KEY.CLAIMS_2);
export const M07_LOG_NODES = logs(M07_LOG_KEY.NODES_1);
export const M07_LOG_CREDENTIAL = logs(M07_LOG_KEY.CREDENTIAL_1, M07_LOG_KEY.CREDENTIAL_2);
export const M07_LOG_EDGE = logs(M07_LOG_KEY.EDGE_1, M07_LOG_KEY.EDGE_2);
export const M07_LOG_C2 = logs(M07_LOG_KEY.C2_1, M07_LOG_KEY.C2_2);
export const M07_LOG_MANIFEST = logs(M07_LOG_KEY.MANIFEST_1, M07_LOG_KEY.MANIFEST_2);
export const M07_LOG_ORDERS = logs(M07_LOG_KEY.ORDERS_1, M07_LOG_KEY.ORDERS_2);
export const M07_LOG_SURVEY = logs(M07_LOG_KEY.SURVEY_1, M07_LOG_KEY.SURVEY_2);
export const M07_LOG_LEDGER = logs(M07_LOG_KEY.LEDGER_1, M07_LOG_KEY.LEDGER_2);
export const M07_LOG_SEAL = logs(M07_LOG_KEY.SEAL_1, M07_LOG_KEY.SEAL_2);
export const M07_LOG_INSTRUCTION = logs(M07_LOG_KEY.INSTRUCTION_1, M07_LOG_KEY.INSTRUCTION_2);
export const M07_LOG_DECOY = logs(M07_LOG_KEY.DECOY_1);
export const M07_LOG_MODEL = logs(M07_LOG_KEY.MODEL_1);
export const M07_LOG_DOSSIER = logs(M07_LOG_KEY.DOSSIER_1);
export const M07_LOG_LEDGER_ROOM = logs(M07_LOG_KEY.LEDGER_ROOM_1, M07_LOG_KEY.LEDGER_ROOM_2);
export const M07_LOG_DUEL_ONE_LOST = logs(M07_LOG_KEY.DUEL_ONE_LOST);
export const M07_LOG_DUEL_TWO_LOST = logs(M07_LOG_KEY.DUEL_TWO_LOST);

const ENDING_LOGS: Readonly<Record<string, () => readonly string[]>> = {
    [M07_CHOICE_EXPOSE]: logs(
        M07_LOG_KEY.EXPOSE_1,
        M07_LOG_KEY.EXPOSE_2,
        M07_LOG_KEY.EXPOSE_3,
        M07_LOG_KEY.EXPOSE_4,
        M07_LOG_KEY.EXPOSE_5,
        M07_LOG_KEY.EXPOSE_6,
    ),
    [M07_CHOICE_HANDOFF]: logs(
        M07_LOG_KEY.HANDOFF_1,
        M07_LOG_KEY.HANDOFF_2,
        M07_LOG_KEY.HANDOFF_3,
        M07_LOG_KEY.HANDOFF_4,
        M07_LOG_KEY.HANDOFF_5,
        M07_LOG_KEY.HANDOFF_6,
    ),
    [M07_CHOICE_DESTROY]: logs(
        M07_LOG_KEY.DESTROY_1,
        M07_LOG_KEY.DESTROY_2,
        M07_LOG_KEY.DESTROY_3,
        M07_LOG_KEY.DESTROY_4,
        M07_LOG_KEY.DESTROY_5,
        M07_LOG_KEY.DESTROY_6,
    ),
};

export const M07_LOG_ENDING = (choice: string): readonly string[] => ENDING_LOGS[choice]?.() ?? [];
