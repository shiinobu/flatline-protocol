import { Localization, Mail } from "@hotbunny/hackhub-content-sdk";

import { INTRUSION_REPELLED_EVENT, type IntrusionRepelledPayload } from "../../commands/flatline.js";
import { registerRepelTarget } from "../../components/intrusion.js";
import { sendReplacingMail } from "../../components/mail.js";
import { M04_GATES } from "../../content/m04/gates.js";
import { M04_HONEYPOT_MAIL, M04_HONEYPOT_MAIL_SLOT } from "../../content/m04/mail.js";
import {
    M04_NIGHT_SHIFT_IP,
    M04_PAPER_MOTH_IP,
    M04_WATCHDOG_EMAIL,
} from "../../content/m04/network.js";
import {
    M04_HONEYPOT_PENALTY,
    M04_SAVE_PREFIX,
    M04_SCOPE,
} from "../../content/m04/quest.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { chargeM04Penalty } from "./penalty.js";
import type { M04Quest } from "./types.js";

const HUNT_TARGET_ID = "hunt";

const bindHoneypot = (quest: M04Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "SSH" || data.targetIp !== M04_PAPER_MOTH_IP) return;
        if (quest.Data.honeypotAlertSent) return;

        quest.SetData("honeypotAlertSent", true);
        sendReplacingMail(M04_HONEYPOT_MAIL_SLOT, M04_HONEYPOT_MAIL());
        chargeM04Penalty(M04_HONEYPOT_PENALTY, "Relay probe answered — loss");
    });
};

const bindHunt = (quest: M04Quest): void => {
    registerRepelTarget({
        prefix: M04_SAVE_PREFIX,
        scope: M04_SCOPE,
        strikeId: HUNT_TARGET_ID,
        ip: M04_NIGHT_SHIFT_IP,
        refusalKey: () => (quest.Data.originLinked ? null : M04_I18N_KEY.FLATLINE_NOT_READY),
    });

    quest.Events.on(INTRUSION_REPELLED_EVENT, (data: IntrusionRepelledPayload) => {
        if (data.prefix !== M04_SAVE_PREFIX) return;
        if (data.strikeId !== HUNT_TARGET_ID || data.ip !== M04_NIGHT_SHIFT_IP) return;

        advanceStep(quest, M04_GATES, "huntEnded", () => {
            Mail.send({
                from: M04_WATCHDOG_EMAIL,
                subject: Localization.t(M04_I18N_KEY.MAIL_CLOSING_SUBJECT),
                content: Localization.t(M04_I18N_KEY.MAIL_CLOSING_CONTENT),
            });
        });
    });
};

export const bindM04Control = (quest: M04Quest): void => {
    bindHoneypot(quest);
    bindHunt(quest);
};
