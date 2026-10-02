export interface M06QuestData {
    readonly tipReviewed: boolean;
    readonly registryReached: boolean;
    readonly nomineesRead: boolean;
    readonly agentIdentified: boolean;
    readonly hiddenFilingsFound: boolean;
    readonly filing2019Seen: boolean;
    readonly filing2024Seen: boolean;
    readonly snapshotsCompared: boolean;
    readonly insurerLinked: boolean;
    readonly infraLinked: boolean;
    readonly identityProven: boolean;
    readonly reportSent: boolean;
    readonly captureSeen: boolean;
    readonly certificateSeen: boolean;
    readonly networkBuilt: boolean;
}

export const createM06Data = (): M06QuestData => ({
    tipReviewed: false,
    registryReached: false,
    nomineesRead: false,
    agentIdentified: false,
    hiddenFilingsFound: false,
    filing2019Seen: false,
    filing2024Seen: false,
    snapshotsCompared: false,
    insurerLinked: false,
    infraLinked: false,
    identityProven: false,
    reportSent: false,
    captureSeen: false,
    certificateSeen: false,
    networkBuilt: false,
});
