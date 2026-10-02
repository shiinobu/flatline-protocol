export interface M04QuestData {
    readonly warningRead: boolean;
    readonly probeStarted: boolean;
    readonly intruderRepelled: boolean;
    readonly reportSent: boolean;
    readonly strikeScheduled: boolean;
    readonly networkBuilt: boolean;
}

export const createM04Data = (): M04QuestData => ({
    warningRead: false,
    probeStarted: false,
    intruderRepelled: false,
    reportSent: false,
    strikeScheduled: false,
    networkBuilt: false,
});
