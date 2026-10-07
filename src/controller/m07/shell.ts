import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { OPEN_FILE_READ_EVENT } from "../../commands/open.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { M07_GATES } from "../../content/m07/gates.js";
import { M07_C2_IP } from "../../content/m07/network.js";
import { M07_LOG_C2, M07_LOG_MANIFEST, M07_LOG_ORDERS, M07_LOG_SURVEY } from "../../content/m07/quest-logs.js";
import {
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
    M07_MANIFEST_FILE_EXTENSION,
    M07_MANIFEST_FILE_NAME,
    M07_ORDERS_FILE_EXTENSION,
    M07_ORDERS_FILE_NAME,
    M07_SURVEY_FILE_EXTENSION,
    M07_SURVEY_FILE_NAME,
} from "../../content/m07/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import { halveDuelOne, resumeDuelOne, startDuelOne } from "./duel.js";
import type { M07Quest } from "./types.js";

const isManifest = (file: ReadFile): boolean =>
    isNamedFile(file, M07_MANIFEST_FILE_NAME, M07_MANIFEST_FILE_EXTENSION);

const isOrders = (file: ReadFile): boolean => isNamedFile(file, M07_ORDERS_FILE_NAME, M07_ORDERS_FILE_EXTENSION);

const isSurvey = (file: ReadFile): boolean => isNamedFile(file, M07_SURVEY_FILE_NAME, M07_SURVEY_FILE_EXTENSION);

const isLedger = (file: ReadFile): boolean => isNamedFile(file, M07_LEDGER_FILE_NAME, M07_LEDGER_FILE_EXTENSION);

const bindSession = (quest: M07Quest): void => {
    quest.Events.on("RemoteConnection.Established", async (data) => {
        if (data.t !== "METASPLOIT" || data.targetIp !== M07_C2_IP) return;

        const first = advanceStep(quest, M07_GATES, "shellObtained", () => {
            traceBacktraceFinding("m7", "c2", M07_LOG_C2());
            startDuelOne(quest);
        });
        if (!first) await resumeDuelOne(quest);
    });
};

const bindReads = (quest: M07Quest): void => {
    onFileRead(quest.Events, (file) => {
        if (isManifest(file)) {
            advanceStep(quest, M07_GATES, "manifestRead", () =>
                traceBacktraceFinding("m7", "manifest", M07_LOG_MANIFEST()),
            );
            return;
        }

        if (isOrders(file)) {
            advanceStep(quest, M07_GATES, "ordersRead", () =>
                traceBacktraceFinding("m7", "orders", M07_LOG_ORDERS()),
            );
            return;
        }

        if (isSurvey(file)) {
            advanceStep(quest, M07_GATES, "surveyRead", () =>
                traceBacktraceFinding("m7", "survey", M07_LOG_SURVEY()),
            );
        }
    });
};

const bindHostRead = (quest: M07Quest): void => {
    quest.Events.on(OPEN_FILE_READ_EVENT, (file: ReadFile) => {
        if (!isLedger(file) || !quest.Data.shellObtained || quest.Data.ledgerTaken) return;

        halveDuelOne(quest);
    });
};

export const bindM07Shell = (quest: M07Quest): void => {
    bindSession(quest);
    bindReads(quest);
    bindHostRead(quest);
};
