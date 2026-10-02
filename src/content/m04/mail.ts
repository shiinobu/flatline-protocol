import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M04_I18N_KEY } from "../../i18n/m04/core.js";
import { DEAD_DROP_CONTACT } from "../global/characters.js";
import type { M04Step } from "./gates.js";
import { M04_HUNTER_EMAIL } from "./network.js";

export const M04_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M04_WARNING_SUBJECT = (): string => Localization.t(M04_I18N_KEY.MAIL_WARNING_SUBJECT);
export const M04_WARNING_CONTENT = (): string => Localization.t(M04_I18N_KEY.MAIL_WARNING_CONTENT);

export const M04_STRIKE1_MAIL = (): MailDefinition => ({
    from: M04_HUNTER_EMAIL,
    subject: Localization.t(M04_I18N_KEY.MAIL_STRIKE1_SUBJECT),
    content: Localization.t(M04_I18N_KEY.MAIL_STRIKE1_CONTENT),
});

export const M04_PREMATURE_MAIL_SLOT = "m04.prematureReply";
export const M04_PREMATURE_SUBJECT = (): string => Localization.t(M04_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M04_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M04Step, string>>> = {
    warningRead: M04_I18N_KEY.MAIL_PREMATURE_HINT_WARNING,
    probeStarted: M04_I18N_KEY.MAIL_PREMATURE_HINT_PROBE,
    intruderRepelled: M04_I18N_KEY.MAIL_PREMATURE_HINT_REPEL,
};

export const buildM04PrematureReply = (unmetStep: M04Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M04_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M04_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M04_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M04_DEAD_DROP_EMAIL,
        subject: M04_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
