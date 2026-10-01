

export interface M01QuestData {
    readonly tipReviewed: boolean;
    readonly domainResolved: boolean;
    readonly frontScanned: boolean;
    readonly subdomainsEnumerated: boolean;
    readonly backendResolved: boolean;
    readonly listingFound: boolean;
    readonly decoyRuledOut: boolean;
    readonly kimaiRan: boolean;
    readonly tokenDecoded: boolean;
    readonly firewallBreached: boolean;
    readonly pfsenseLoggedIn: boolean;
    readonly credentialsCracked: boolean;
    readonly backendAccessed: boolean;
    readonly suspiciousFileFound: boolean;
    readonly credentialsDecrypted: boolean;
    readonly chatConfirmed: boolean;
    readonly vaultVisited: boolean;
    readonly caseFileOpened: boolean;
    readonly reportSent: boolean;
    readonly networkBuilt: boolean;
}

export const createM01Data = (): M01QuestData => ({
    tipReviewed: false,
    domainResolved: false,
    frontScanned: false,
    subdomainsEnumerated: false,
    backendResolved: false,
    listingFound: false,
    decoyRuledOut: false,
    kimaiRan: false,
    tokenDecoded: false,
    firewallBreached: false,
    pfsenseLoggedIn: false,
    credentialsCracked: false,
    backendAccessed: false,
    suspiciousFileFound: false,
    credentialsDecrypted: false,
    chatConfirmed: false,
    vaultVisited: false,
    caseFileOpened: false,
    reportSent: false,
    networkBuilt: false,
});
