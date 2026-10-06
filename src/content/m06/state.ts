export interface M06QuestData {
    readonly tipReviewed: boolean;
    readonly doorSeen: boolean;
    readonly registryReached: boolean;
    readonly nomineesRead: boolean;
    readonly agentIdentified: boolean;
    readonly hiddenFilingsFound: boolean;
    readonly filing2019Opened: boolean;
    readonly filing2024Opened: boolean;
    readonly holdingsRead: boolean;
    readonly insurerLinked: boolean;
    readonly infraLinked: boolean;
    readonly doorOpened: boolean;
    readonly identityProven: boolean;
    readonly reportSent: boolean;
    readonly captureSeen: boolean;
    readonly networkBuilt: boolean;
}

export const createM06Data = (): M06QuestData => ({
    tipReviewed: false,
    doorSeen: false,
    registryReached: false,
    nomineesRead: false,
    agentIdentified: false,
    hiddenFilingsFound: false,
    filing2019Opened: false,
    filing2024Opened: false,
    holdingsRead: false,
    insurerLinked: false,
    infraLinked: false,
    doorOpened: false,
    identityProven: false,
    reportSent: false,
    captureSeen: false,
    networkBuilt: false,
});
