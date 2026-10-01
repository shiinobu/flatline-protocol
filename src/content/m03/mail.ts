import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M03_I18N_KEY } from "../../i18n/m03/core.js";
import { DEAD_DROP_CONTACT } from "../global/characters.js";
import { M02_SHELL_COMPANY_NAME } from "../global/entities.js";
import { RANSOM_BATCH_HOSPITAL, formatUsd } from "../global/finance.js";
import type { M03Step } from "./gates.js";
import { M03_SKYNET_DOMAIN } from "./network.js";

export const M03_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M03_TIP_SUBJECT = (): string => Localization.t(M03_I18N_KEY.MAIL_TIP_SUBJECT);
export const M03_TIP_CONTENT = (): string =>
    Localization.t(M03_I18N_KEY.MAIL_TIP_CONTENT, {
        amount: formatUsd(RANSOM_BATCH_HOSPITAL.gross),
        shellCompany: M02_SHELL_COMPANY_NAME,
        skynetDomain: M03_SKYNET_DOMAIN,
    });

export const M03_PREMATURE_MAIL_SLOT = "m03.prematureReply";

export const M03_PREMATURE_SUBJECT = (): string => Localization.t(M03_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M03_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M03Step, string>>> = {
    tipReviewed: M03_I18N_KEY.MAIL_PREMATURE_HINT_RECON,
    siteScouted: M03_I18N_KEY.MAIL_PREMATURE_HINT_RECON,
    portalReached: M03_I18N_KEY.MAIL_PREMATURE_HINT_GATEWAY,
    natPivotDone: M03_I18N_KEY.MAIL_PREMATURE_HINT_GATEWAY,
    ledgerDumped: M03_I18N_KEY.MAIL_PREMATURE_HINT_LEDGER,
    gatewayShellObtained: M03_I18N_KEY.MAIL_PREMATURE_HINT_TUNNEL,
    vpnConfigRead: M03_I18N_KEY.MAIL_PREMATURE_HINT_TUNNEL,
};

export const buildM03PrematureReply = (unmetStep: M03Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M03_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M03_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M03_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M03_DEAD_DROP_EMAIL,
        subject: M03_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
