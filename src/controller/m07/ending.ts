import { Files, Mail } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { M07_GRETA_LETTER } from "../../content/m07/mail.js";
import { M07_C2_IP } from "../../content/m07/network.js";
import { M07_LOG_ENDING } from "../../content/m07/quest-logs.js";
import { M07_SCOPE } from "../../content/m07/quest.js";
import {
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
} from "../../content/m07/server-files.js";
import type { M07Choice } from "../../content/m07/state.js";
import { unregister } from "../../core/index.js";
import { trace } from "../../helpers/logger.js";
import { M07_WORLD } from "./world.js";
import type { M07Quest } from "./types.js";

const destroyLedgerFile = async (): Promise<void> => {
    const root = Files.getById(M07_C2_IP);
    if (root === null) return;

    const children = await Files.getChildren(root.id);
    const ledger = children.find(
        (child) => child.name === M07_LEDGER_FILE_NAME && child.extension === M07_LEDGER_FILE_EXTENSION,
    );
    if (ledger === undefined) return;

    Files.remove(ledger.id);
    trace(M07_SCOPE, "ledger removed from the host");
};

export const recordM07Ending = (quest: M07Quest, choice: M07Choice): void => {
    if (quest.Data.endingApplied) return;

    quest.SetData("endingApplied", true);
    appendBacktraceLogs("m7", M07_LOG_ENDING(choice));

    const letter = M07_GRETA_LETTER(choice);
    if (letter !== null) Mail.send(letter);

    trace(M07_SCOPE, `ending recorded choice=${choice} letter=${letter !== null}`);
};

export const destroyM07Network = async (): Promise<void> => {
    await destroyLedgerFile();
    unregister(M07_WORLD);
    trace(M07_SCOPE, "C2 network torn down (destroy ending)");
};
