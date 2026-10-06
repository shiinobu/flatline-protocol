import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M06QuestData } from "./state.js";

export type M06Step = FlagKey<M06QuestData>;

export const M06_STEP_ORDER: readonly M06Step[] = [
    "tipReviewed",
    "doorSeen",
    "registryReached",
    "nomineesRead",
    "agentIdentified",
    "hiddenFilingsFound",
    "filing2019Opened",
    "filing2024Opened",
    "holdingsRead",
    "insurerLinked",
    "doorOpened",
    "identityProven",
    "infraLinked",
];

export const M06_GATES: readonly Gate<M06QuestData>[] = [
    { step: "doorSeen", requires: ["tipReviewed"] },
    { step: "registryReached", requires: ["tipReviewed"] },
    { step: "nomineesRead", requires: ["registryReached"] },
    { step: "agentIdentified", requires: ["nomineesRead"] },
    { step: "hiddenFilingsFound", requires: ["agentIdentified"] },
    { step: "filing2019Opened", requires: ["hiddenFilingsFound"] },
    { step: "filing2024Opened", requires: ["filing2019Opened"] },
    { step: "holdingsRead", requires: ["filing2024Opened"] },
    { step: "insurerLinked", requires: ["holdingsRead"] },
    { step: "infraLinked", requires: ["insurerLinked"] },
    { step: "doorOpened", requires: ["doorSeen", "insurerLinked"] },
    { step: "identityProven", requires: ["doorOpened"] },
    { step: "reportSent", requires: ["identityProven", "infraLinked"] },
];

export const M06_UNLOCKS: readonly Unlock<M06QuestData>[] = [
    { name: "nomineesRecord", when: "registryReached" },
    { name: "filingArchive", when: "agentIdentified" },
    { name: "infraRecords", when: "insurerLinked" },
];
