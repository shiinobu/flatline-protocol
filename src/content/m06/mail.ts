import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M06_I18N_KEY } from "../../i18n/m06/core.js";
import { DEAD_DROP_CONTACT } from "../global/characters.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import type { M06Step } from "./gates.js";
import {
    M06_HOSTTRAIL_DOMAIN,
    M06_INSURER_PORTAL_HOST,
    M06_REGISTRY_DOMAIN,
    M06_REGISTRY_JURISDICTION,
} from "./network.js";

export const M06_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;

export const M06_TIP_SUBJECT = (): string => Localization.t(M06_I18N_KEY.MAIL_TIP_SUBJECT);
export const M06_TIP_CONTENT = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_TIP_CONTENT, {
        jurisdiction: M06_REGISTRY_JURISDICTION,
        registry: M06_REGISTRY_DOMAIN,
        entity: M03_PARENT_ENTITY_NAME,
    });

export const M06_HOSTS_LEAD_MAIL = (): MailDefinition => ({
    from: M06_DEAD_DROP_EMAIL,
    subject: Localization.t(M06_I18N_KEY.MAIL_HOSTS_SUBJECT),
    content: Localization.t(M06_I18N_KEY.MAIL_HOSTS_CONTENT, {
        hosttrail: M06_HOSTTRAIL_DOMAIN,
        portal: M06_INSURER_PORTAL_HOST,
    }),
});

export const M06_PREMATURE_MAIL_SLOT = "m06.prematureReply";
export const M06_PREMATURE_SUBJECT = (): string => Localization.t(M06_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M06_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M06Step, string>>> = {
    tipReviewed: M06_I18N_KEY.MAIL_PREMATURE_HINT_TIP,
    registryReached: M06_I18N_KEY.MAIL_PREMATURE_HINT_REGISTRY,
    nomineesRead: M06_I18N_KEY.MAIL_PREMATURE_HINT_NOMINEES,
    agentIdentified: M06_I18N_KEY.MAIL_PREMATURE_HINT_AGENT,
    hiddenFilingsFound: M06_I18N_KEY.MAIL_PREMATURE_HINT_FILINGS,
    snapshotsCompared: M06_I18N_KEY.MAIL_PREMATURE_HINT_SNAPSHOTS,
    insurerLinked: M06_I18N_KEY.MAIL_PREMATURE_HINT_INSURER,
    infraLinked: M06_I18N_KEY.MAIL_PREMATURE_HINT_INFRA,
    identityProven: M06_I18N_KEY.MAIL_PREMATURE_HINT_IDENTITY,
};

export const buildM06PrematureReply = (unmetStep: M06Step | undefined): MailDefinition => {
    const hintKey = unmetStep ? M06_PREMATURE_HINT_KEYS[unmetStep] : undefined;
    const paragraphs = [
        Localization.t(M06_I18N_KEY.MAIL_PREMATURE_INTRO),
        ...(hintKey ? [Localization.t(hintKey)] : []),
        Localization.t(M06_I18N_KEY.MAIL_PREMATURE_OUTRO),
    ];

    return {
        from: M06_DEAD_DROP_EMAIL,
        subject: M06_PREMATURE_SUBJECT(),
        content: paragraphs.join("\n\n"),
    };
};
