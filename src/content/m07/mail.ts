import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { DEAD_DROP_CONTACT, GRETA_PRIVATE_EMAIL, M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import type { M07Step } from "./gates.js";

export const M07_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M07_WATCHDOG_EMAIL = "watchdog@architect-c2.dark";

export const M07_TIP_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_TIP_SUBJECT);
export const M07_TIP_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_TIP_CONTENT, { endpoint: M04_ARCHITECT_VPN_IP });

export const M07_HONEYPOT_ALERT_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_HONEYPOT_SUBJECT);
export const M07_HONEYPOT_ALERT_CONTENT = (): string => Localization.t(M07_I18N_KEY.MAIL_HONEYPOT_CONTENT);

export const M07_TRAP_WARNING_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_TRAP_SUBJECT);
export const M07_TRAP_WARNING_CONTENT = (): string => Localization.t(M07_I18N_KEY.MAIL_TRAP_CONTENT);

export const M07_WHATNOW_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_WHATNOW_SUBJECT);
export const M07_WHATNOW_MAIL = (): MailDefinition => ({
    from: M07_DEAD_DROP_EMAIL,
    subject: M07_WHATNOW_SUBJECT(),
    content: Localization.t(M07_I18N_KEY.MAIL_WHATNOW_CONTENT),
});

export const M07_TRACE_WARNING_MAIL = (): MailDefinition => ({
    from: M07_WATCHDOG_EMAIL,
    subject: Localization.t(M07_I18N_KEY.MAIL_TRACE_SUBJECT),
    content: Localization.t(M07_I18N_KEY.MAIL_TRACE_CONTENT),
});

export const M07_GRETA_LETTER = (choice: string): MailDefinition | null => {
    const key =
        choice === "expose"
            ? M07_I18N_KEY.MAIL_GRETA_EXPOSE
            : choice === "handoff"
              ? M07_I18N_KEY.MAIL_GRETA_HANDOFF
              : null;
    if (key === null) return null;

    return {
        from: GRETA_PRIVATE_EMAIL,
        subject: Localization.t(M07_I18N_KEY.MAIL_GRETA_SUBJECT),
        content: Localization.t(key),
    };
};

export const M07_PREMATURE_MAIL_SLOT = "m07.prematureReply";
export const M07_PREMATURE_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M07_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M07Step, string>>> = {
    tipReviewed: M07_I18N_KEY.MAIL_PREMATURE_HINT_TIP,
    edgeScanned: M07_I18N_KEY.MAIL_PREMATURE_HINT_EDGE,
    dashboardFound: M07_I18N_KEY.MAIL_PREMATURE_HINT_DASHBOARD,
    deadBoxEntered: M07_I18N_KEY.MAIL_PREMATURE_HINT_DEADBOX,
    credentialRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_CREDENTIAL,
    firewallLoggedIn: M07_I18N_KEY.MAIL_PREMATURE_HINT_FIREWALL,
    firewallBreached: M07_I18N_KEY.MAIL_PREMATURE_HINT_FIREWALL,
    shellObtained: M07_I18N_KEY.MAIL_PREMATURE_HINT_EXTRACT,
    manifestRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_EXTRACT,
    trapRevealed: M07_I18N_KEY.MAIL_PREMATURE_HINT_EXTRACT,
    fileExtracted: M07_I18N_KEY.MAIL_PREMATURE_HINT_EXTRACT,
};

export const buildM07PrematureReply = (unmetStep: M07Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M07_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M07_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M07_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M07_DEAD_DROP_EMAIL,
        subject: M07_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
