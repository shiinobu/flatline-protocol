import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M02_I18N_KEY } from "../../i18n/m02/core.js";
import { DEAD_DROP_CONTACT } from "../global/characters.js";
import type { M02Step } from "./gates.js";

export const M02_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M02_TIP_SUBJECT = (): string => Localization.t(M02_I18N_KEY.MAIL_TIP_SUBJECT);
export const M02_TIP_CONTENT = (): string => Localization.t(M02_I18N_KEY.MAIL_TIP_CONTENT);

export const M02_PREMATURE_MAIL_SLOT = "m02.prematureReply";

export const M02_PREMATURE_SUBJECT = (): string => Localization.t(M02_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M02_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M02Step, string>>> = {
    tipReviewed: M02_I18N_KEY.MAIL_PREMATURE_HINT_RECON,
    rootProbed: M02_I18N_KEY.MAIL_PREMATURE_HINT_RECON,
    subdomainsEnumerated: M02_I18N_KEY.MAIL_PREMATURE_HINT_RECON,
    adminsDumped: M02_I18N_KEY.MAIL_PREMATURE_HINT_PANEL,
    affiliatesDumped: M02_I18N_KEY.MAIL_PREMATURE_HINT_PANEL,
    devboxAccessed: M02_I18N_KEY.MAIL_PREMATURE_HINT_DEVBOX,
    deployLogRead: M02_I18N_KEY.MAIL_PREMATURE_HINT_TRAIL,
    homeLeadRead: M02_I18N_KEY.MAIL_PREMATURE_HINT_TRAIL,
    firewallLoggedIn: M02_I18N_KEY.MAIL_PREMATURE_HINT_HOME,
    firewallBreached: M02_I18N_KEY.MAIL_PREMATURE_HINT_HOME,
    workstationRooted: M02_I18N_KEY.MAIL_PREMATURE_HINT_HOME,
    shellCompanyFound: M02_I18N_KEY.MAIL_PREMATURE_HINT_PAPERWORK,
};

export const buildM02PrematureReply = (unmetStep: M02Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M02_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M02_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M02_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M02_DEAD_DROP_EMAIL,
        subject: M02_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
