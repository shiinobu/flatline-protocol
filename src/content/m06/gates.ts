import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M06QuestData } from "./state.js";

export type M06Step = FlagKey<M06QuestData>;

export const M06_STEP_ORDER: readonly M06Step[] = [
    "tipReviewed",
    "registryReached",
    "nomineesRead",
    "agentIdentified",
    "hiddenFilingsFound",
];

export const M06_GATES: readonly Gate<M06QuestData>[] = [
    { step: "registryReached", requires: ["tipReviewed"] },
    { step: "nomineesRead", requires: ["registryReached"] },
    { step: "agentIdentified", requires: ["nomineesRead"] },
    { step: "hiddenFilingsFound", requires: ["agentIdentified"] },
    { step: "reportSent", requires: ["hiddenFilingsFound"] },
];

export const M06_UNLOCKS: readonly Unlock<M06QuestData>[] = [
    { name: "nomineesRecord", when: "registryReached" },
];
