import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M04QuestData } from "./state.js";

export type M04Step = FlagKey<M04QuestData>;

export const M04_STEP_ORDER: readonly M04Step[] = ["warningRead", "probeStarted", "intruderRepelled"];

export const M04_GATES: readonly Gate<M04QuestData>[] = [
    { step: "probeStarted", requires: ["warningRead"] },
    { step: "intruderRepelled", requires: ["probeStarted"] },
    { step: "reportSent", requires: ["intruderRepelled"] },
];

export const M04_UNLOCKS: readonly Unlock<M04QuestData>[] = [];
