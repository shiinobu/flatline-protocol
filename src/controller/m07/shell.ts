import { Mail } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { ATTRCHECK_REVEALED_EVENT } from "../../commands/attrcheck.js";
import { OPEN_FILE_READ_EVENT } from "../../commands/open.js";
import { M07_GATES } from "../../content/m07/gates.js";
import { M07_TRAP_WARNING_CONTENT, M07_TRAP_WARNING_SUBJECT, M07_WATCHDOG_EMAIL } from "../../content/m07/mail.js";
import { M07_C2_IP } from "../../content/m07/network.js";
import { M07_LOG_MANIFEST } from "../../content/m07/quest-logs.js";
import {
    M07_LEDGER_FILE_NAME,
    M07_MANIFEST_FILE_EXTENSION,
    M07_MANIFEST_FILE_NAME,
} from "../../content/m07/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import { halveM07Trace, resumeM07Trace, startM07Trace } from "./tracking.js";
import type { M07Quest } from "./types.js";

interface ReadFile {
    readonly name: string;
    readonly extension?: string;
}

const isManifest = (file: ReadFile): boolean =>
    file.name === M07_MANIFEST_FILE_NAME && file.extension === M07_MANIFEST_FILE_EXTENSION;

const isLedger = (file: ReadFile): boolean => file.name === M07_LEDGER_FILE_NAME;

const markManifest = (quest: M07Quest): void => {
    advanceStep(quest, M07_GATES, "manifestRead", () => {
        traceBacktraceFinding("m7", "manifest");
        appendBacktraceLogs("m7", M07_LOG_MANIFEST());
    });
};

const bindSession = (quest: M07Quest): void => {
    quest.Events.on("RemoteConnection.Established", async (data) => {
        if (data.t !== "METASPLOIT" || data.targetIp !== M07_C2_IP) return;

        const first = advanceStep(quest, M07_GATES, "shellObtained", () => traceBacktraceFinding("m7", "c2"));
        if (first) {
            startM07Trace(quest);
            return;
        }

        await resumeM07Trace(quest);
    });
};

const bindManifest = (quest: M07Quest): void => {
    quest.Events.on("Terminal.Cat", (data) => {
        if (isManifest(data)) markManifest(quest);
    });

    quest.Events.on(OPEN_FILE_READ_EVENT, (data: ReadFile) => {
        if (isManifest(data)) markManifest(quest);
    });
};

const bindTrap = (quest: M07Quest): void => {
    quest.Events.on(ATTRCHECK_REVEALED_EVENT, (data: { readonly id: string; readonly name: string }) => {
        if (data.name !== M07_LEDGER_FILE_NAME) return;

        advanceStep(quest, M07_GATES, "trapRevealed");
    });

    quest.Events.on(OPEN_FILE_READ_EVENT, (data: ReadFile) => {
        if (!isLedger(data) || quest.Data.fileExtracted) return;

        Mail.send({
            from: M07_WATCHDOG_EMAIL,
            subject: M07_TRAP_WARNING_SUBJECT(),
            content: M07_TRAP_WARNING_CONTENT(),
        });
        halveM07Trace(quest);
    });
};

export const bindM07Shell = (quest: M07Quest): void => {
    bindSession(quest);
    bindManifest(quest);
    bindTrap(quest);
};
