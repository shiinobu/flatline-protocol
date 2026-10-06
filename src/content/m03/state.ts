export interface M03Forward {
    readonly ip: string;
    readonly external: number;
    readonly internal: number;
    readonly active: boolean;
    readonly bannered: boolean;
}

export interface M03QuestData {
    readonly tipReviewed: boolean;
    readonly siteScouted: boolean;
    readonly portalReached: boolean;
    readonly natPivotDone: boolean;
    readonly ledgerDumped: boolean;
    readonly gatewayShellObtained: boolean;
    readonly vpnConfigRead: boolean;
    readonly accompliceReached: boolean;
    readonly reportSent: boolean;
    readonly networkBuilt: boolean;
    readonly forwards: readonly M03Forward[];
}

export const createM03Data = (): M03QuestData => ({
    tipReviewed: false,
    siteScouted: false,
    portalReached: false,
    natPivotDone: false,
    ledgerDumped: false,
    gatewayShellObtained: false,
    vpnConfigRead: false,
    accompliceReached: false,
    reportSent: false,
    networkBuilt: false,
    forwards: [],
});
