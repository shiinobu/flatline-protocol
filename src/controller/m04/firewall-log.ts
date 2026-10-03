import { Files } from "@hotbunny/hackhub-content-sdk";

import { removeKernelFile } from "../../components/kernel-files.js";
import type { KernelFile } from "../../components/kernel-layout.js";
import { asLogData, parseLog } from "../../components/log-file.js";
import { M04_STORY_DAY } from "../../content/m04/quest.js";
import {
    M04_FIREWALL_LOG_CONTENT,
    M04_FIREWALL_LOG_FILE_EXTENSION,
    M04_FIREWALL_LOG_FILE_NAME,
    M04_FIREWALL_LOG_FOLDER,
} from "../../content/m04/server-files.js";

const FIREWALL_FOLDER_PATH = `~/${M04_FIREWALL_LOG_FOLDER}`;

const FIREWALL_LOG: KernelFile = {
    folder: FIREWALL_FOLDER_PATH,
    name: M04_FIREWALL_LOG_FILE_NAME,
    extension: M04_FIREWALL_LOG_FILE_EXTENSION,
};

export const seedFirewallLog = async (): Promise<void> => {
    const home = Files.getHomePath();
    await removeKernelFile(FIREWALL_LOG);

    const existing = await Files.getByPath(FIREWALL_FOLDER_PATH);
    const tree = [
        {
            name: M04_FIREWALL_LOG_FILE_NAME,
            extension: M04_FIREWALL_LOG_FILE_EXTENSION,
            data: asLogData(parseLog(M04_FIREWALL_LOG_CONTENT(), M04_STORY_DAY)),
        },
    ];

    if (existing === null) {
        await Files.createTree(home, [{ name: M04_FIREWALL_LOG_FOLDER, isFolder: true, children: tree }]);
        return;
    }

    await Files.createTree(`${home}/${M04_FIREWALL_LOG_FOLDER}`, tree);
};
