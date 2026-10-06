import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M06_GATES } from "../../content/m06/gates.js";
import { M06_AGENT_LEAD_MAIL, M06_DEAD_DROP_EMAIL, M06_TIP_SUBJECT } from "../../content/m06/mail.js";
import { M06_AGENT_DOMAIN, M06_INSURER_DOMAIN } from "../../content/m06/network.js";
import { M06_LOG_CERTIFICATE, M06_LOG_AGENT } from "../../content/m06/quest-logs.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M06Quest } from "./types.js";
import { M06_WORLD } from "./world.js";

const bindTip = (quest: M06Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M06_DEAD_DROP_EMAIL || data.subject !== M06_TIP_SUBJECT()) return;

        advanceStep(quest, M06_GATES, "tipReviewed");
    });
};

const bindWhois = (quest: M06Quest): void => {
    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain === M06_AGENT_DOMAIN) {
            advanceStep(quest, M06_GATES, "agentIdentified", () => {
                traceBacktraceFinding("m6", "registeredAgent", M06_LOG_AGENT());
                unlock(M06_WORLD, "filingArchive");
                Mail.send(M06_AGENT_LEAD_MAIL());
            });
            return;
        }

        if (data.domain !== M06_INSURER_DOMAIN) return;

        advanceStep(quest, M06_GATES, "infraLinked", () => {
            traceBacktraceFinding("m6", "infra", M06_LOG_CERTIFICATE());
        });
    });
};

export const bindM06Recon = (quest: M06Quest): void => {
    bindTip(quest);
    bindWhois(quest);
};
