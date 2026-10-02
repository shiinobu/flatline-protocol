export interface M06QuestData {
    readonly tipReviewed: boolean;
    readonly registryReached: boolean;
    readonly nomineesRead: boolean;
    readonly agentIdentified: boolean;
    readonly hiddenFilingsFound: boolean;
    readonly reportSent: boolean;
    readonly networkBuilt: boolean;
}

export const createM06Data = (): M06QuestData => ({
    tipReviewed: false,
    registryReached: false,
    nomineesRead: false,
    agentIdentified: false,
    hiddenFilingsFound: false,
    reportSent: false,
    networkBuilt: false,
});
