import { M07_CHOICE_DESTROY, M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF } from "./choice.js";

export type M07Choice = typeof M07_CHOICE_EXPOSE | typeof M07_CHOICE_HANDOFF | typeof M07_CHOICE_DESTROY;

export interface M07QuestData {
    readonly tipReviewed: boolean;
    readonly claimsPortalSeen: boolean;
    readonly paidClaimsMatched: boolean;
    readonly endpointMapped: boolean;
    readonly edgeScanned: boolean;
    readonly dashboardFound: boolean;
    readonly deadBoxEntered: boolean;
    readonly credentialRead: boolean;
    readonly firewallLoggedIn: boolean;
    readonly firewallBreached: boolean;
    readonly shellObtained: boolean;
    readonly manifestRead: boolean;
    readonly ordersRead: boolean;
    readonly surveyRead: boolean;
    readonly ledgerTaken: boolean;
    readonly reservesChecked: boolean;
    readonly sealRead: boolean;
    readonly sealOneOpened: boolean;
    readonly sealTwoOpened: boolean;
    readonly workstationLoggedIn: boolean;
    readonly displayAttached: boolean;
    readonly instructionRead: boolean;
    readonly reportSent: boolean;
    readonly modelRead: boolean;
    readonly dossierRead: boolean;
    readonly honeypotAlertSent: boolean;
    readonly traceHalved: boolean;
    readonly ledgerWiped: boolean;
    readonly whatNowSent: boolean;
    readonly endingApplied: boolean;
    readonly networkBuilt: boolean;
    readonly claimsFound: readonly string[];
    readonly reservesFound: readonly string[];
    readonly duelOneLosses: number;
    readonly duelTwoLosses: number;
    readonly rdcSeed: number;
    readonly choice: M07Choice | null;
}

export const createM07Data = (): M07QuestData => ({
    tipReviewed: false,
    claimsPortalSeen: false,
    paidClaimsMatched: false,
    endpointMapped: false,
    edgeScanned: false,
    dashboardFound: false,
    deadBoxEntered: false,
    credentialRead: false,
    firewallLoggedIn: false,
    firewallBreached: false,
    shellObtained: false,
    manifestRead: false,
    ordersRead: false,
    surveyRead: false,
    ledgerTaken: false,
    reservesChecked: false,
    sealRead: false,
    sealOneOpened: false,
    sealTwoOpened: false,
    workstationLoggedIn: false,
    displayAttached: false,
    instructionRead: false,
    reportSent: false,
    modelRead: false,
    dossierRead: false,
    honeypotAlertSent: false,
    traceHalved: false,
    ledgerWiped: false,
    whatNowSent: false,
    endingApplied: false,
    networkBuilt: false,
    claimsFound: [],
    reservesFound: [],
    duelOneLosses: 0,
    duelTwoLosses: 0,
    rdcSeed: 0,
    choice: null,
});

export const rdcSeedOf = (data: M07QuestData): number => data.rdcSeed;
