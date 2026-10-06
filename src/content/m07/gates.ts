import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M07QuestData } from "./state.js";

export type M07Step = FlagKey<M07QuestData>;

export const M07_STEP_ORDER: readonly M07Step[] = [
    "tipReviewed",
    "claimsPortalSeen",
    "paidClaimsMatched",
    "endpointMapped",
    "edgeScanned",
    "dashboardFound",
    "deadBoxEntered",
    "credentialRead",
    "firewallLoggedIn",
    "firewallBreached",
    "shellObtained",
    "manifestRead",
    "ordersRead",
    "surveyRead",
    "ledgerTaken",
    "reservesChecked",
    "sealRead",
    "sealOneOpened",
    "sealTwoOpened",
    "workstationLoggedIn",
    "displayAttached",
    "instructionRead",
];

export const M07_GATES: readonly Gate<M07QuestData>[] = [
    { step: "claimsPortalSeen", requires: ["tipReviewed"] },
    { step: "paidClaimsMatched", requires: ["claimsPortalSeen"] },
    { step: "endpointMapped", requires: ["paidClaimsMatched"] },
    { step: "edgeScanned", requires: ["endpointMapped"] },
    { step: "dashboardFound", requires: ["edgeScanned"] },
    { step: "deadBoxEntered", requires: ["dashboardFound"] },
    { step: "credentialRead", requires: ["deadBoxEntered"] },
    { step: "firewallLoggedIn", requires: ["credentialRead"] },
    { step: "firewallBreached", requires: ["firewallLoggedIn"] },
    { step: "shellObtained", requires: ["firewallBreached"] },
    { step: "manifestRead", requires: ["shellObtained"] },
    { step: "ordersRead", requires: ["manifestRead"] },
    { step: "surveyRead", requires: ["ordersRead"] },
    { step: "ledgerTaken", requires: ["surveyRead"] },
    { step: "reservesChecked", requires: ["ledgerTaken"] },
    { step: "sealRead", requires: ["reservesChecked"] },
    { step: "sealOneOpened", requires: ["sealRead"] },
    { step: "sealTwoOpened", requires: ["sealOneOpened"] },
    { step: "workstationLoggedIn", requires: ["sealTwoOpened"] },
    { step: "displayAttached", requires: ["workstationLoggedIn"] },
    { step: "instructionRead", requires: ["displayAttached"] },
    { step: "reportSent", requires: ["instructionRead"] },
];

export const M07_UNLOCKS: readonly Unlock<M07QuestData>[] = [
    { name: "edgeIntel", when: "endpointMapped" },
    { name: "legacyCms", when: "edgeScanned" },
    { name: "commandHostRdp", when: "firewallBreached" },
];
