import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { penalty } from "../../components/reward.js";
import { M07_GATES } from "../../content/m07/gates.js";
import {
    M07_HONEYPOT_ALERT_CONTENT,
    M07_HONEYPOT_ALERT_SUBJECT,
    M07_WATCHDOG_EMAIL,
} from "../../content/m07/mail.js";
import { M07_ASHVECTOR_IP, M07_NULLCROWN_IP } from "../../content/m07/network.js";
import { M07_HONEYPOT_PENALTY } from "../../content/m07/quest.js";
import {
    M07_ASH_GATE_BACKUP_FILE_EXTENSION,
    M07_ASH_GATE_BACKUP_FILE_NAME,
} from "../../content/m07/server-files.js";
import { OPEN_FILE_READ_EVENT } from "../../commands/open.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M07Quest } from "./types.js";

interface ReadFile {
    readonly name: string;
    readonly extension?: string;
}

const isAshGateBackup = (file: ReadFile): boolean =>
    file.name === M07_ASH_GATE_BACKUP_FILE_NAME &&
    file.extension === M07_ASH_GATE_BACKUP_FILE_EXTENSION;

const warnOnDecoy = (quest: M07Quest): void => {
    if (quest.Data.honeypotAlertSent) return;

    quest.SetData("honeypotAlertSent", true);
    Mail.send({
        from: M07_WATCHDOG_EMAIL,
        subject: M07_HONEYPOT_ALERT_SUBJECT(),
        content: M07_HONEYPOT_ALERT_CONTENT(),
    });
    const charged = penalty("M07", M07_HONEYPOT_PENALTY, "Decommissioned host probed — loss");
    trace("M07", `probe:honeypot-touched penalty=${charged}`);
};

const bindSessions = (quest: M07Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "SSH") return;

        if (data.targetIp === M07_ASHVECTOR_IP) {
            advanceStep(quest, M07_GATES, "deadBoxEntered");
            return;
        }

        if (data.targetIp === M07_NULLCROWN_IP) warnOnDecoy(quest);
    });
};

const markCredential = (quest: M07Quest): void => {
    advanceStep(quest, M07_GATES, "credentialRead", () => traceBacktraceFinding("m7", "credential"));
};

const bindCredential = (quest: M07Quest): void => {
    quest.Events.on("Terminal.Cat", (data) => {
        if (!isAshGateBackup(data)) return;

        markCredential(quest);
    });

    quest.Events.on(OPEN_FILE_READ_EVENT, (data: ReadFile) => {
        if (!isAshGateBackup(data)) return;

        markCredential(quest);
    });
};

export const bindM07DeadBox = (quest: M07Quest): void => {
    bindSessions(quest);
    bindCredential(quest);
};
