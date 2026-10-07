import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { penalty } from "../../components/reward.js";
import { M07_GATES } from "../../content/m07/gates.js";
import {
    M07_HONEYPOT_ALERT_CONTENT,
    M07_HONEYPOT_ALERT_SUBJECT,
    M07_WATCHDOG_EMAIL,
} from "../../content/m07/mail.js";
import { M07_ASHVECTOR_IP, M07_FIREWALL_IP, M07_NULLCROWN_IP } from "../../content/m07/network.js";
import { M07_LOG_CREDENTIAL, M07_LOG_DECOY, M07_LOG_EDGE } from "../../content/m07/quest-logs.js";
import { M07_HONEYPOT_PENALTY, M07_SCOPE } from "../../content/m07/quest.js";
import {
    M07_ASH_GATE_BACKUP_FILE_EXTENSION,
    M07_ASH_GATE_BACKUP_FILE_NAME,
} from "../../content/m07/server-files.js";
import { unlock } from "../../core/index.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

const isAshGateBackup = (file: ReadFile): boolean =>
    isNamedFile(file, M07_ASH_GATE_BACKUP_FILE_NAME, M07_ASH_GATE_BACKUP_FILE_EXTENSION);

const warnOnDecoy = (quest: M07Quest): void => {
    if (quest.Data.honeypotAlertSent) return;

    quest.SetData("honeypotAlertSent", true);
    Mail.send({
        from: M07_WATCHDOG_EMAIL,
        subject: M07_HONEYPOT_ALERT_SUBJECT(),
        content: M07_HONEYPOT_ALERT_CONTENT(),
    });
    traceBacktraceFinding("m7", "decoy", M07_LOG_DECOY());
    const charged = penalty(M07_SCOPE, M07_HONEYPOT_PENALTY, "Decommissioned host probed — loss");
    trace(M07_SCOPE, `probe:honeypot-touched penalty=${charged}`);
};

const bindDeadBoxes = (quest: M07Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "SSH") return;

        if (data.targetIp === M07_ASHVECTOR_IP) {
            advanceStep(quest, M07_GATES, "deadBoxEntered");
            return;
        }

        if (data.targetIp === M07_NULLCROWN_IP) warnOnDecoy(quest);
    });

    onFileRead(quest.Events, (file) => {
        if (!isAshGateBackup(file)) return;

        advanceStep(quest, M07_GATES, "credentialRead", () =>
            traceBacktraceFinding("m7", "credential", M07_LOG_CREDENTIAL()),
        );
    });
};

const bindFirewall = (quest: M07Quest): void => {
    quest.Events.on("PFSense.Login", (data) => {
        if (data.ip !== M07_FIREWALL_IP) return;

        advanceStep(quest, M07_GATES, "firewallLoggedIn");
    });

    quest.Events.on("PFSense.Changes", () => {
        advanceStep(quest, M07_GATES, "firewallBreached", () => {
            unlock(M07_WORLD, "commandHostRdp");
            traceBacktraceFinding("m7", "firewall", M07_LOG_EDGE());
        });
    });
};

export const bindM07Access = (quest: M07Quest): void => {
    bindDeadBoxes(quest);
    bindFirewall(quest);
};
