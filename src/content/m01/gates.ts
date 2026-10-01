import type { Gate, Unlock } from "../../core/types.js";

import { type M01QuestData } from "./state.js";

export type M01Step = keyof M01QuestData & string;

export const M01_STEP_ORDER: readonly M01Step[] = [
    "tipReviewed",
    "listingFound",
    "kimaiRan",
    "tokenDecoded",
    "pfsenseLoggedIn",
    "firewallBreached",
    "credentialsCracked",
    "backendAccessed",
    "suspiciousFileFound",
    "credentialsDecrypted",
    "chatConfirmed",
    "vaultVisited",
    "caseFileOpened",
];

export const M01_GATES: readonly Gate<M01QuestData>[] = [
    { step: "listingFound", requires: ["tipReviewed"] },
    { step: "kimaiRan", requires: ["listingFound"] },
    { step: "tokenDecoded", requires: ["kimaiRan"] },
    { step: "pfsenseLoggedIn", requires: ["tokenDecoded"] },
    { step: "firewallBreached", requires: ["pfsenseLoggedIn"] },
    { step: "credentialsCracked", requires: ["firewallBreached"] },
    { step: "backendAccessed", requires: ["credentialsCracked"] },
    { step: "suspiciousFileFound", requires: ["backendAccessed"] },
    { step: "credentialsDecrypted", requires: ["suspiciousFileFound"] },
    { step: "chatConfirmed", requires: ["credentialsDecrypted"] },
    { step: "vaultVisited", requires: ["chatConfirmed"] },
    { step: "caseFileOpened", requires: ["vaultVisited"] },
    { step: "reportSent", requires: ["vaultVisited", "caseFileOpened"] },
];

export const M01_UNLOCKS: readonly Unlock<M01QuestData>[] = [
    { name: "brokerLead", when: "listingFound" },
    { name: "backendSsh", when: "firewallBreached" },
];
