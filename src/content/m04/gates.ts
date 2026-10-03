import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M04QuestData } from "./state.js";

export type M04Step = FlagKey<M04QuestData>;

export const M04_STEP_ORDER: readonly M04Step[] = [
    "warningRead",
    "probeStarted",
    "breachBegan",
    "incidentLogRead",
    "desktopRestored",
    "relayProfiled",
    "hydraRun",
    "relay1Accessed",
    "relayLogRead",
    "relay2Accessed",
    "controlFound",
    "originLinked",
    "huntEnded",
];

export const M04_GATES: readonly Gate<M04QuestData>[] = [
    { step: "probeStarted", requires: ["warningRead"] },
    { step: "breachBegan", requires: ["probeStarted"] },
    { step: "incidentLogRead", requires: ["breachBegan"] },
    { step: "desktopRestored", requires: ["breachBegan"] },
    { step: "relayProfiled", requires: ["incidentLogRead", "desktopRestored"] },
    { step: "hydraRun", requires: ["relayProfiled"] },
    { step: "relay1Accessed", requires: ["hydraRun"] },
    { step: "relayLogRead", requires: ["relay1Accessed"] },
    { step: "relay2Accessed", requires: ["relayLogRead"] },
    { step: "controlFound", requires: ["relay2Accessed"] },
    { step: "originLinked", requires: ["controlFound"] },
    { step: "huntEnded", requires: ["originLinked"] },
    { step: "reportSent", requires: ["huntEnded"] },
];

export const M04_UNLOCKS: readonly Unlock<M04QuestData>[] = [
    { name: "relayLead", when: "incidentLogRead" },
    { name: "routerCrack", when: "relayProfiled" },
    { name: "staticHopSsh", when: "hydraRun" },
    { name: "quietMirrorSsh", when: "relayLogRead" },
    { name: "controlHost", when: "controlFound" },
];
