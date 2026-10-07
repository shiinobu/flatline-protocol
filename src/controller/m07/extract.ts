import { Localization, UI } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { M07_GATES } from "../../content/m07/gates.js";
import { M07_LOG_LEDGER } from "../../content/m07/quest-logs.js";
import { M07_LEDGER_FILE_EXTENSION, M07_LEDGER_FILE_NAME } from "../../content/m07/server-files.js";
import { setM07ReservesOpen } from "../../context/m07/progress.js";
import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { endDuelOne } from "./duel.js";
import type { M07Quest } from "./types.js";

const isLedger = (file: ReadFile): boolean => isNamedFile(file, M07_LEDGER_FILE_NAME, M07_LEDGER_FILE_EXTENSION);

export const settleSealRead = (quest: M07Quest): void => {
    if (!quest.Data.ledgerCopyRead) return;

    advanceStep(quest, M07_GATES, "sealRead");
};

const bindTransfer = (quest: M07Quest): void => {
    quest.Events.on("Files.Transfer", (data) => {
        if (data.type !== "DOWNLOAD" || data.file.name !== M07_LEDGER_FILE_NAME) return;
        if (quest.Data.ledgerWiped) return;

        const taken = advanceStep(quest, M07_GATES, "ledgerTaken", () => {
            traceBacktraceFinding("m7", "ledger", M07_LOG_LEDGER());
            setM07ReservesOpen(true);
            endDuelOne();
        });
        if (taken || quest.Data.ledgerTaken) return;

        UI.toast(Localization.t(M07_I18N_KEY.TOAST_READ_FIRST), "warning");
    });
};

const bindCopyRead = (quest: M07Quest): void => {
    onFileRead(quest.Events, (file) => {
        if (!isLedger(file) || !quest.Data.ledgerTaken) return;

        if (!quest.Data.ledgerCopyRead) quest.SetData("ledgerCopyRead", true);
        settleSealRead(quest);
    });
};

export const bindM07Extract = (quest: M07Quest): void => {
    bindTransfer(quest);
    bindCopyRead(quest);
};
