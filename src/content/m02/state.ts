export interface M02QuestData {
    readonly tipReviewed: boolean;
    readonly rootProbed: boolean;
    readonly subdomainsEnumerated: boolean;
    readonly adminsDumped: boolean;
    readonly affiliatesDumped: boolean;
    readonly devboxAccessed: boolean;
    readonly deployLogRead: boolean;
    readonly homeLeadRead: boolean;
    readonly firewallLoggedIn: boolean;
    readonly firewallBreached: boolean;
    readonly workstationRooted: boolean;
    readonly shellCompanyFound: boolean;
    readonly aftermathShown: boolean;
    readonly reportSent: boolean;
    readonly networkBuilt: boolean;
}

export const createM02Data = (): M02QuestData => ({
    tipReviewed: false,
    rootProbed: false,
    subdomainsEnumerated: false,
    adminsDumped: false,
    affiliatesDumped: false,
    devboxAccessed: false,
    deployLogRead: false,
    homeLeadRead: false,
    firewallLoggedIn: false,
    firewallBreached: false,
    workstationRooted: false,
    shellCompanyFound: false,
    aftermathShown: false,
    reportSent: false,
    networkBuilt: false,
});
