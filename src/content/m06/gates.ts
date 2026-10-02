import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M06QuestData } from "./state.js";

export type M06Step = FlagKey<M06QuestData>;

export const M06_STEP_ORDER: readonly M06Step[] = [
    "tipReviewed",
    "registryReached",
    "nomineesRead",
    "agentIdentified",
    "hiddenFilingsFound",
    "snapshotsCompared",
    "insurerLinked",
    "infraLinked",
    "identityProven",
];

export const M06_GATES: readonly Gate<M06QuestData>[] = [
    { step: "registryReached", requires: ["tipReviewed"] },
    { step: "nomineesRead", requires: ["registryReached"] },
    { step: "agentIdentified", requires: ["nomineesRead"] },
    { step: "hiddenFilingsFound", requires: ["agentIdentified"] },
    { step: "filing2019Seen", requires: ["hiddenFilingsFound"] },
    { step: "filing2024Seen", requires: ["hiddenFilingsFound"] },
    { step: "snapshotsCompared", requires: ["filing2019Seen", "filing2024Seen"] },
    { step: "insurerLinked", requires: ["snapshotsCompared"] },
    { step: "infraLinked", requires: ["snapshotsCompared"] },
    { step: "identityProven", requires: ["insurerLinked", "infraLinked"] },
    { step: "reportSent", requires: ["identityProven"] },
];

export const M06_UNLOCKS: readonly Unlock<M06QuestData>[] = [
    { name: "nomineesRecord", when: "registryReached" },
    { name: "filingArchive", when: "agentIdentified" },
    { name: "ownershipRecords", when: "snapshotsCompared" },
];
