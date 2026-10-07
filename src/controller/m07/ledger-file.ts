import { Files, type FileInfo } from "@hotbunny/hackhub-content-sdk";

import { M07_C2_IP } from "../../content/m07/network.js";
import {
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
    M07_LEDGER_FOLDER_PATH,
} from "../../content/m07/server-files.js";

const childNamed = async (parent: FileInfo, name: string): Promise<FileInfo | null> => {
    const children = await Files.getChildren(parent.id);
    return children.find((child) => child.name === name) ?? null;
};

const walkFolders = async (start: FileInfo, path: readonly string[]): Promise<FileInfo | null> => {
    let current: FileInfo | null = start;
    for (const name of path) {
        if (current === null) return null;
        current = await childNamed(current, name);
    }
    return current;
};

export const findLedgerOnTarget = async (): Promise<FileInfo | null> => {
    const root = Files.getById(M07_C2_IP);
    if (root === null) return null;

    const folder = await walkFolders(root, M07_LEDGER_FOLDER_PATH);
    if (folder === null) return null;

    const children = await Files.getChildren(folder.id);
    return (
        children.find(
            (child) => child.name === M07_LEDGER_FILE_NAME && child.extension === M07_LEDGER_FILE_EXTENSION,
        ) ?? null
    );
};
