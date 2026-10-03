import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead } from "../../components/file-reads.js";
import { M01_GATES } from "../../content/m01/gates.js";
import {
    M01_IRC_HOST,
    M01_IRC_NOTES_CONTENT,
    M01_IRC_NOTES_FILE_EXTENSION,
    M01_IRC_NOTES_FILE_NAME,
} from "../../content/m01/irc.js";
import { M01_TARGET_IP } from "../../content/m01/network.js";
import { M01_LEDGER_FILE_EXTENSION, M01_LEDGER_FILE_NAME } from "../../content/m01/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import { setM01VaultSealed } from "../../context/m01/progress.js";
import type { M01Quest } from "./types.js";
import { M01_LOG_BUYER } from "../../content/m01/quest.js";

const bindSession = (quest: M01Quest): void => {
    quest.Events.on("Terminal.SSH.Connected", (data) => {
        if (data !== M01_TARGET_IP) return;

        advanceStep(quest, M01_GATES, "backendAccessed");
    });
};

const bindFiles = (quest: M01Quest): void => {
    onFileRead(quest.Events, (file) => {
        if (isNamedFile(file, M01_IRC_NOTES_FILE_NAME, M01_IRC_NOTES_FILE_EXTENSION)) {
            advanceStep(quest, M01_GATES, "suspiciousFileFound");
        }

        if (isNamedFile(file, M01_LEDGER_FILE_NAME, M01_LEDGER_FILE_EXTENSION) && quest.Data.backendAccessed) {
            traceBacktraceFinding("m1", "buyer", M01_LOG_BUYER());
        }
    });
};

const bindChat = (quest: M01Quest): void => {
    quest.Events.on("Terminal.Openssl", (data) => {
        if (data.type !== "dec" || data.output !== M01_IRC_NOTES_CONTENT) return;

        advanceStep(quest, M01_GATES, "credentialsDecrypted");
    });

    quest.Events.on("WeeChat.Connected", (data) => {
        if (data !== M01_IRC_HOST) return;

        advanceStep(quest, M01_GATES, "chatConfirmed", () => setM01VaultSealed(false));
    });
};

export const bindM01Access = (quest: M01Quest): void => {
    bindSession(quest);
    bindFiles(quest);
    bindChat(quest);
};
