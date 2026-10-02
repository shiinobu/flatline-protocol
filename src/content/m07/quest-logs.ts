import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { M07_CHOICE_DESTROY, M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF } from "./choice.js";

export const M07_LOG_NODES = (): readonly string[] => [Localization.t(M07_I18N_KEY.LOG_NODES_1)];

export const M07_LOG_MANIFEST = (): readonly string[] => [
    Localization.t(M07_I18N_KEY.LOG_MANIFEST_1),
    Localization.t(M07_I18N_KEY.LOG_MANIFEST_2),
];

const ENDING_LOG_KEYS: Readonly<Record<string, readonly string[]>> = {
    [M07_CHOICE_EXPOSE]: [M07_I18N_KEY.LOG_EXPOSE_1, M07_I18N_KEY.LOG_EXPOSE_2],
    [M07_CHOICE_HANDOFF]: [M07_I18N_KEY.LOG_HANDOFF_1, M07_I18N_KEY.LOG_HANDOFF_2],
    [M07_CHOICE_DESTROY]: [M07_I18N_KEY.LOG_DESTROY_1, M07_I18N_KEY.LOG_DESTROY_2],
};

export const M07_LOG_ENDING = (choice: string): readonly string[] =>
    (ENDING_LOG_KEYS[choice] ?? []).map((key) => Localization.t(key));
