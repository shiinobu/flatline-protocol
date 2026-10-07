import { Localization, type NetworkFileMap } from "@hotbunny/hackhub-content-sdk";

import { M07_FILES_KEY } from "../../i18n/m07/files.js";
import {
    M07_LEDGER_FILE_CONTENT,
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
    M07_LEDGER_FOLDER_PATH,
    M07_MANIFEST_CONTENT,
    M07_MANIFEST_FILE_EXTENSION,
    M07_MANIFEST_FILE_NAME,
    M07_ORDERS_CONTENT,
    M07_ORDERS_FILE_EXTENSION,
    M07_ORDERS_FILE_NAME,
    M07_SURVEY_CONTENT,
    M07_SURVEY_FILE_EXTENSION,
    M07_SURVEY_FILE_NAME,
} from "./server-files.js";

export const M07_AGENT_LOG_NAME = "settlecare-agent";

const folder = (name: string, children: NetworkFileMap[]): NetworkFileMap => ({
    name,
    isFolder: true,
    children,
});

const nest = (path: readonly string[], children: NetworkFileMap[]): NetworkFileMap[] =>
    path.reduceRight<NetworkFileMap[]>((inner, name) => [folder(name, inner)], children);

const note = (name: string, extension: string, key: string): NetworkFileMap => ({
    name,
    extension,
    data: Localization.t(key),
});

export const buildC2RootFiles = (): NetworkFileMap[] => [
    folder("etc", [folder("settlecare", [note("gateway", "conf", M07_FILES_KEY.NOISE_GATEWAY_CONF)])]),
    folder("logs", [
        { name: M07_ORDERS_FILE_NAME, extension: M07_ORDERS_FILE_EXTENSION, data: M07_ORDERS_CONTENT() },
        note(M07_AGENT_LOG_NAME, "log", M07_FILES_KEY.NOISE_AGENT_LOG),
    ]),
    folder("opt", [
        folder("settlecare", [
            { name: M07_MANIFEST_FILE_NAME, extension: M07_MANIFEST_FILE_EXTENSION, data: M07_MANIFEST_CONTENT() },
            note("agent", "conf", M07_FILES_KEY.NOISE_AGENT_CONF),
            folder("reports", [
                { name: M07_SURVEY_FILE_NAME, extension: M07_SURVEY_FILE_EXTENSION, data: M07_SURVEY_CONTENT() },
            ]),
        ]),
    ]),
    ...nest(M07_LEDGER_FOLDER_PATH, [
        { name: M07_LEDGER_FILE_NAME, extension: M07_LEDGER_FILE_EXTENSION, data: M07_LEDGER_FILE_CONTENT },
        note("master_ledger_2025", "enc", M07_FILES_KEY.NOISE_LEDGER_OLD),
        note("volumes", "txt", M07_FILES_KEY.NOISE_LEDGER_VOLUMES),
    ]),
];
