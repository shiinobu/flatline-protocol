import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M05_I18N_KEY } from "../../i18n/m05/core.js";
import { DEAD_DROP_CONTACT } from "../global/characters.js";
import type { M05Step } from "./gates.js";

export const M05_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M05_TIP_SUBJECT = (): string => Localization.t(M05_I18N_KEY.MAIL_TIP_SUBJECT);
export const M05_TIP_CONTENT = (): string => Localization.t(M05_I18N_KEY.MAIL_TIP_CONTENT);

export const M05_PORTAL_MAIL_SLOT = "m05.portalLogin";

export const buildM05PortalLoginMail = (): MailDefinition => ({
    from: M05_DEAD_DROP_EMAIL,
    subject: Localization.t(M05_I18N_KEY.MAIL_PORTAL_SUBJECT),
    content: Localization.t(M05_I18N_KEY.MAIL_PORTAL_CONTENT),
});

export const M05_PREMATURE_MAIL_SLOT = "m05.prematureReply";
export const M05_PREMATURE_SUBJECT = (): string => Localization.t(M05_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M05_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M05Step, string>>> = {
    tipReviewed: M05_I18N_KEY.MAIL_PREMATURE_HINT_VAULT,
    vaultRevisited: M05_I18N_KEY.MAIL_PREMATURE_HINT_VAULT,
    teamPageSeen: M05_I18N_KEY.MAIL_PREMATURE_HINT_TEAM,
    changeRecordRead: M05_I18N_KEY.MAIL_PREMATURE_HINT_CHANGE,
    staffArchiveCompared: M05_I18N_KEY.MAIL_PREMATURE_HINT_ARCHIVE,
    roxanneProfiled: M05_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY,
    handoverOpened: M05_I18N_KEY.MAIL_PREMATURE_HINT_HANDOVER,
    policyRead: M05_I18N_KEY.MAIL_PREMATURE_HINT_CREDENTIAL,
    portalLoggedIn: M05_I18N_KEY.MAIL_PREMATURE_HINT_PORTAL,
    footholdFlagged: M05_I18N_KEY.MAIL_PREMATURE_HINT_FOOTHOLD,
    usbFound: M05_I18N_KEY.MAIL_PREMATURE_HINT_USB,
    separationFound: M05_I18N_KEY.MAIL_PREMATURE_HINT_SEPARATION,
    controlsFound: M05_I18N_KEY.MAIL_PREMATURE_HINT_CONTROLS,
    holdFound: M05_I18N_KEY.MAIL_PREMATURE_HINT_HOLD,
    systemsOpened: M05_I18N_KEY.MAIL_PREMATURE_HINT_SYSTEMS,
    sampleOpened: M05_I18N_KEY.MAIL_PREMATURE_HINT_SYSTEMS,
    rdcLoggedIn: M05_I18N_KEY.MAIL_PREMATURE_HINT_TOKEN,
    displayAttached: M05_I18N_KEY.MAIL_PREMATURE_HINT_DISPLAY,
    statementRead: M05_I18N_KEY.MAIL_PREMATURE_HINT_DOCUMENTS,
    memoRead: M05_I18N_KEY.MAIL_PREMATURE_HINT_DOCUMENTS,
    ticketRead: M05_I18N_KEY.MAIL_PREMATURE_HINT_DOCUMENTS,
};

export const buildM05PrematureReply = (unmetStep: M05Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M05_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M05_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M05_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M05_DEAD_DROP_EMAIL,
        subject: M05_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
