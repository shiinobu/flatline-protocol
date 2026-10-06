import { Localization, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { DEAD_DROP_CONTACT, GRETA_PRIVATE_EMAIL, M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import { M04_HUNTER_EMAIL } from "../m04/network.js";
import { M07_CHOICE_DESTROY, M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF } from "./choice.js";
import type { M07Step } from "./gates.js";

export const M07_DEAD_DROP_EMAIL = DEAD_DROP_CONTACT.email;
export const M07_WATCHDOG_EMAIL = "watchdog@architect-c2.dark";
export const M07_SENTRY_EMAIL = M04_HUNTER_EMAIL;

export const M07_TIP_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_TIP_SUBJECT);
export const M07_TIP_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_TIP_CONTENT, { endpoint: M04_ARCHITECT_VPN_IP });

export const M07_HONEYPOT_ALERT_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_HONEYPOT_SUBJECT);
export const M07_HONEYPOT_ALERT_CONTENT = (): string => Localization.t(M07_I18N_KEY.MAIL_HONEYPOT_CONTENT);

export const M07_TRAP_WARNING_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_TRAP_SUBJECT);
export const M07_TRAP_WARNING_CONTENT = (): string => Localization.t(M07_I18N_KEY.MAIL_TRAP_CONTENT);

export const M07_TRACED_MAIL = (): MailDefinition => ({
    from: M07_WATCHDOG_EMAIL,
    subject: Localization.t(M07_I18N_KEY.MAIL_TRACED_SUBJECT),
    content: Localization.t(M07_I18N_KEY.MAIL_TRACED_CONTENT),
});

export const M07_SENTRY_MAIL = (): MailDefinition => ({
    from: M07_SENTRY_EMAIL,
    subject: Localization.t(M07_I18N_KEY.MAIL_SENTRY_SUBJECT),
    content: Localization.t(M07_I18N_KEY.MAIL_SENTRY_CONTENT),
});

export const M07_WHATNOW_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_WHATNOW_SUBJECT);
export const M07_WHATNOW_MAIL = (): MailDefinition => ({
    from: M07_DEAD_DROP_EMAIL,
    subject: M07_WHATNOW_SUBJECT(),
    content: Localization.t(M07_I18N_KEY.MAIL_WHATNOW_CONTENT),
});

export const M07_GRETA_LETTER = (choice: string): MailDefinition | null => {
    const key =
        choice === M07_CHOICE_EXPOSE
            ? M07_I18N_KEY.MAIL_GRETA_EXPOSE
            : choice === M07_CHOICE_HANDOFF
              ? M07_I18N_KEY.MAIL_GRETA_HANDOFF
              : null;
    if (key === null) return null;

    return {
        from: GRETA_PRIVATE_EMAIL,
        subject: Localization.t(M07_I18N_KEY.MAIL_GRETA_SUBJECT),
        content: Localization.t(key),
    };
};

const CLOSING_KEYS: Readonly<Record<string, string>> = {
    [M07_CHOICE_EXPOSE]: M07_I18N_KEY.MAIL_CLOSING_EXPOSE,
    [M07_CHOICE_HANDOFF]: M07_I18N_KEY.MAIL_CLOSING_HANDOFF,
    [M07_CHOICE_DESTROY]: M07_I18N_KEY.MAIL_CLOSING_DESTROY,
};

export const M07_CLOSING_MAIL = (choice: string): MailDefinition | null => {
    const key = CLOSING_KEYS[choice];
    if (key === undefined) return null;

    return {
        from: M07_DEAD_DROP_EMAIL,
        subject: Localization.t(M07_I18N_KEY.MAIL_CLOSING_SUBJECT),
        content: Localization.t(key),
    };
};

export const M07_PREMATURE_MAIL_SLOT = "m07.prematureReply";
export const M07_PREMATURE_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_PREMATURE_SUBJECT);

const M07_PREMATURE_HINT_KEYS: Readonly<Partial<Record<M07Step, string>>> = {
    tipReviewed: M07_I18N_KEY.MAIL_PREMATURE_HINT_TIP,
    claimsPortalSeen: M07_I18N_KEY.MAIL_PREMATURE_HINT_PORTAL,
    paidClaimsMatched: M07_I18N_KEY.MAIL_PREMATURE_HINT_CLAIMS,
    endpointMapped: M07_I18N_KEY.MAIL_PREMATURE_HINT_ENDPOINT,
    edgeScanned: M07_I18N_KEY.MAIL_PREMATURE_HINT_EDGE,
    dashboardFound: M07_I18N_KEY.MAIL_PREMATURE_HINT_DASHBOARD,
    deadBoxEntered: M07_I18N_KEY.MAIL_PREMATURE_HINT_DEADBOX,
    credentialRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_CREDENTIAL,
    firewallLoggedIn: M07_I18N_KEY.MAIL_PREMATURE_HINT_FIREWALL,
    firewallBreached: M07_I18N_KEY.MAIL_PREMATURE_HINT_FIREWALL,
    shellObtained: M07_I18N_KEY.MAIL_PREMATURE_HINT_SHELL,
    manifestRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_READ,
    ordersRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_READ,
    surveyRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_READ,
    ledgerTaken: M07_I18N_KEY.MAIL_PREMATURE_HINT_LEDGER,
    reservesChecked: M07_I18N_KEY.MAIL_PREMATURE_HINT_RESERVES,
    sealRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_SEAL,
    sealOneOpened: M07_I18N_KEY.MAIL_PREMATURE_HINT_SEAL,
    sealTwoOpened: M07_I18N_KEY.MAIL_PREMATURE_HINT_SEAL,
    workstationLoggedIn: M07_I18N_KEY.MAIL_PREMATURE_HINT_TOKEN,
    displayAttached: M07_I18N_KEY.MAIL_PREMATURE_HINT_ATTACH,
    instructionRead: M07_I18N_KEY.MAIL_PREMATURE_HINT_INSTRUCTION,
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
