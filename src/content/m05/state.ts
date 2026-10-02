export interface M05QuestData {
    readonly tipReviewed: boolean;
    readonly vaultRevisited: boolean;
    readonly staff2025Seen: boolean;
    readonly staff2026Seen: boolean;
    readonly staffArchiveCompared: boolean;
    readonly gretaProfiled: boolean;
    readonly edgeMapped: boolean;
    readonly credentialFound: boolean;
    readonly passwordCracked: boolean;
    readonly firewallLoggedIn: boolean;
    readonly firewallBreached: boolean;
    readonly archiveAccessed: boolean;
    readonly statementRead: boolean;
    readonly memoRead: boolean;
    readonly ticketRead: boolean;
    readonly reportSent: boolean;
    readonly bedsideVisited: boolean;
    readonly networkBuilt: boolean;
}

export const createM05Data = (): M05QuestData => ({
    tipReviewed: false,
    vaultRevisited: false,
    staff2025Seen: false,
    staff2026Seen: false,
    staffArchiveCompared: false,
    gretaProfiled: false,
    edgeMapped: false,
    credentialFound: false,
    passwordCracked: false,
    firewallLoggedIn: false,
    firewallBreached: false,
    archiveAccessed: false,
    statementRead: false,
    memoRead: false,
    ticketRead: false,
    reportSent: false,
    bedsideVisited: false,
    networkBuilt: false,
});
