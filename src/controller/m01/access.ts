import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M01_GATES } from "../../content/m01/gates.js";
import {
    M01_IRC_HOST,
    M01_IRC_NOTES_CONTENT,
    M01_IRC_NOTES_FILE_CONTENT,
    M01_IRC_NOTES_FILE_NAME,
} from "../../content/m01/irc.js";
import { M01_TARGET_IP } from "../../content/m01/network.js";
import { M01_BUYER_ALIAS, M01_LEDGER_FILE_NAME } from "../../content/m01/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import { setM01VaultSealed } from "../../context/m01/progress.js";
import type { M01Quest } from "./types.js";

const bindSession = (quest: M01Quest): void => {
    quest.Events.on("Terminal.SSH.Connected", (data) => {
        if (data !== M01_TARGET_IP) return;

        advanceStep(quest, M01_GATES, "backendAccessed");
    });
};

const bindFiles = (quest: M01Quest): void => {
    quest.Events.on("Terminal.Cat", (data) => {
        if (data.name !== M01_IRC_NOTES_FILE_NAME || data.data !== M01_IRC_NOTES_FILE_CONTENT) return;

        advanceStep(quest, M01_GATES, "suspiciousFileFound");
    });

    quest.Events.on("Terminal.Cat", (data) => {
        if (data.name !== M01_LEDGER_FILE_NAME) return;
        if (!data.data?.includes(M01_BUYER_ALIAS)) return;
        if (!quest.Data.backendAccessed) return;

        traceBacktraceFinding("m1", "buyer");
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
