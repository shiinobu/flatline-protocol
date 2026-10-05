export interface M05QuestData {
    readonly tipReviewed: boolean;
    readonly vaultRevisited: boolean;
    readonly teamPageSeen: boolean;
    readonly staffArchiveCompared: boolean;
    readonly gretaProfiled: boolean;
    readonly changeRecordRead: boolean;
    readonly handoverOpened: boolean;
    readonly policyRead: boolean;
    readonly portalLoggedIn: boolean;
    readonly footholdFlagged: boolean;
    readonly separationFound: boolean;
    readonly controlsFound: boolean;
    readonly holdFound: boolean;
    readonly systemsOpened: boolean;
    readonly sampleOpened: boolean;
    readonly rdcLoggedIn: boolean;
    readonly displayAttached: boolean;
    readonly statementRead: boolean;
    readonly memoRead: boolean;
    readonly ticketRead: boolean;
    readonly reportSent: boolean;
    readonly changeSeen: boolean;
    readonly captureEarlySeen: boolean;
    readonly captureLateSeen: boolean;
    readonly gretaSeen: boolean;
    readonly handoverDecrypted: boolean;
    readonly formatDecrypted: boolean;
    readonly footholdSeen: boolean;
    readonly separationSeen: boolean;
    readonly controlsSeen: boolean;
    readonly holdSeen: boolean;
    readonly systemsSeen: boolean;
    readonly rollbackOpened: boolean;
    readonly sampleDecrypted: boolean;
    readonly gretaNoteOpened: boolean;
    readonly statusNoted: boolean;
    readonly bedsideVisited: boolean;
    readonly networkBuilt: boolean;
}

export const createM05Data = (): M05QuestData => ({
    tipReviewed: false,
    vaultRevisited: false,
    teamPageSeen: false,
    staffArchiveCompared: false,
    gretaProfiled: false,
    changeRecordRead: false,
    handoverOpened: false,
    policyRead: false,
    portalLoggedIn: false,
    footholdFlagged: false,
    separationFound: false,
    controlsFound: false,
    holdFound: false,
    systemsOpened: false,
    sampleOpened: false,
    rdcLoggedIn: false,
    displayAttached: false,
    statementRead: false,
    memoRead: false,
    ticketRead: false,
    reportSent: false,
    changeSeen: false,
    captureEarlySeen: false,
    captureLateSeen: false,
    gretaSeen: false,
    handoverDecrypted: false,
    formatDecrypted: false,
    footholdSeen: false,
    separationSeen: false,
    controlsSeen: false,
    holdSeen: false,
    systemsSeen: false,
    rollbackOpened: false,
    sampleDecrypted: false,
    gretaNoteOpened: false,
    statusNoted: false,
    bedsideVisited: false,
    networkBuilt: false,
});
