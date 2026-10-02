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
    networkBuilt: false,
});
