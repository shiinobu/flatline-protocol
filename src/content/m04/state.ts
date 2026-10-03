export interface M04QuestData {
    readonly warningRead: boolean;
    readonly probeStarted: boolean;
    readonly breachBegan: boolean;
    readonly incidentLogRead: boolean;
    readonly desktopRestored: boolean;
    readonly relayProfiled: boolean;
    readonly hydraRun: boolean;
    readonly relay1Accessed: boolean;
    readonly relayLogRead: boolean;
    readonly relay2Accessed: boolean;
    readonly controlFound: boolean;
    readonly originLinked: boolean;
    readonly huntEnded: boolean;
    readonly reportSent: boolean;
    readonly strikeScheduled: boolean;
    readonly breachScheduled: boolean;
    readonly honeypotAlertSent: boolean;
    readonly networkBuilt: boolean;
}

export const createM04Data = (): M04QuestData => ({
    warningRead: false,
    probeStarted: false,
    breachBegan: false,
    incidentLogRead: false,
    desktopRestored: false,
    relayProfiled: false,
    hydraRun: false,
    relay1Accessed: false,
    relayLogRead: false,
    relay2Accessed: false,
    controlFound: false,
    originLinked: false,
    huntEnded: false,
    reportSent: false,
    strikeScheduled: false,
    breachScheduled: false,
    honeypotAlertSent: false,
    networkBuilt: false,
});
