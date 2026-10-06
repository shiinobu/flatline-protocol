import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT } from "../global/characters.js";
import { M01_I18N_KEY } from "../../i18n/m01/core.js";
import type { M01Step } from "./gates.js";

export const M01_TIP_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_TIP_SUBJECT);
export const M01_TIP_CONTENT = (): string => Localization.t(M01_I18N_KEY.MAIL_TIP_CONTENT);

export const M01_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M01_TIPSTER_EMAIL = ANONYMOUS_TIPSTER.email;

export const M01_CUSTODIAN_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_CUSTODIAN_SUBJECT);
export const M01_CUSTODIAN_CONTENT = (): string => Localization.t(M01_I18N_KEY.MAIL_CUSTODIAN_CONTENT);

export const M01_PREMATURE_MAIL_SLOT = "m01.prematureReply";

export const M01_PREMATURE_SUBJECT = (): string => Localization.t(M01_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M01_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M01Step, string>>> = {
    tipReviewed: M01_I18N_KEY.MAIL_PREMATURE_HINT_LISTING,
    listingFound: M01_I18N_KEY.MAIL_PREMATURE_HINT_LISTING,
    kimaiRan: M01_I18N_KEY.MAIL_PREMATURE_HINT_PERIMETER,
    tokenDecoded: M01_I18N_KEY.MAIL_PREMATURE_HINT_PERIMETER,
    pfsenseLoggedIn: M01_I18N_KEY.MAIL_PREMATURE_HINT_PERIMETER,
    firewallBreached: M01_I18N_KEY.MAIL_PREMATURE_HINT_PERIMETER,
    credentialsCracked: M01_I18N_KEY.MAIL_PREMATURE_HINT_BACKEND,
    backendAccessed: M01_I18N_KEY.MAIL_PREMATURE_HINT_BACKEND,
    suspiciousFileFound: M01_I18N_KEY.MAIL_PREMATURE_HINT_TRAIL,
    credentialsDecrypted: M01_I18N_KEY.MAIL_PREMATURE_HINT_TRAIL,
    chatConfirmed: M01_I18N_KEY.MAIL_PREMATURE_HINT_TRAIL,
    vaultVisited: M01_I18N_KEY.MAIL_PREMATURE_HINT_ARCHIVE,
    caseFileOpened: M01_I18N_KEY.MAIL_PREMATURE_HINT_ARCHIVE,
};

export const buildM01PrematureReply = (unmetStep: M01Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M01_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M01_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M01_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M01_DEAD_DROP_EMAIL,
        subject: M01_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
