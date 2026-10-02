import { M07_CHOICE_DESTROY, M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF } from "./choice.js";

export type M07Choice = typeof M07_CHOICE_EXPOSE | typeof M07_CHOICE_HANDOFF | typeof M07_CHOICE_DESTROY;

export interface M07QuestData {
    readonly tipReviewed: boolean;
    readonly edgeScanned: boolean;
    readonly dashboardFound: boolean;
    readonly deadBoxEntered: boolean;
    readonly credentialRead: boolean;
    readonly firewallLoggedIn: boolean;
    readonly firewallBreached: boolean;
    readonly shellObtained: boolean;
    readonly manifestRead: boolean;
    readonly trapRevealed: boolean;
    readonly fileExtracted: boolean;
    readonly reportSent: boolean;
    readonly honeypotAlertSent: boolean;
    readonly ledgerWiped: boolean;
    readonly traceHalved: boolean;
    readonly whatNowSent: boolean;
    readonly endingApplied: boolean;
    readonly choice: M07Choice | null;
    readonly networkBuilt: boolean;
}

export const createM07Data = (): M07QuestData => ({
    tipReviewed: false,
    edgeScanned: false,
    dashboardFound: false,
    deadBoxEntered: false,
    credentialRead: false,
    firewallLoggedIn: false,
    firewallBreached: false,
    shellObtained: false,
    manifestRead: false,
    trapRevealed: false,
    fileExtracted: false,
    reportSent: false,
    honeypotAlertSent: false,
    ledgerWiped: false,
    traceHalved: false,
    whatNowSent: false,
    endingApplied: false,
    choice: null,
    networkBuilt: false,
});
