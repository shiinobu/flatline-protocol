import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M05QuestData } from "./state.js";

export type M05Step = FlagKey<M05QuestData>;

export const M05_STEP_ORDER: readonly M05Step[] = [
    "tipReviewed",
    "vaultRevisited",
    "teamPageSeen",
    "staffArchiveCompared",
    "gretaProfiled",
    "credentialFound",
    "passwordCracked",
    "portalLoggedIn",
    "footholdFlagged",
    "separationFound",
    "controlsFound",
    "holdFound",
    "systemsOpened",
    "sampleOpened",
    "rdcLoggedIn",
    "displayAttached",
    "statementRead",
    "memoRead",
    "ticketRead",
];

export const M05_SETTLE_ORDER: readonly M05Step[] = [
    "footholdFlagged",
    "separationFound",
    "controlsFound",
    "holdFound",
    "systemsOpened",
    "sampleOpened",
];

export const M05_GATES: readonly Gate<M05QuestData>[] = [
    { step: "vaultRevisited", requires: ["tipReviewed"] },
    { step: "teamPageSeen", requires: ["vaultRevisited"] },
    { step: "staffArchiveCompared", requires: ["teamPageSeen"] },
    { step: "gretaProfiled", requires: ["vaultRevisited"] },
    { step: "credentialFound", requires: ["staffArchiveCompared"] },
    { step: "passwordCracked", requires: ["credentialFound"] },
    { step: "portalLoggedIn", requires: ["passwordCracked"] },
    { step: "footholdFlagged", requires: ["portalLoggedIn"] },
    { step: "separationFound", requires: ["footholdFlagged"] },
    { step: "controlsFound", requires: ["separationFound"] },
    { step: "holdFound", requires: ["controlsFound"] },
    { step: "systemsOpened", requires: ["holdFound"] },
    { step: "sampleOpened", requires: ["holdFound"] },
    { step: "rdcLoggedIn", requires: ["systemsOpened", "sampleOpened"] },
    { step: "displayAttached", requires: ["rdcLoggedIn"] },
    { step: "statementRead", requires: ["displayAttached"] },
    { step: "memoRead", requires: ["displayAttached"] },
    { step: "ticketRead", requires: ["displayAttached"] },
    { step: "reportSent", requires: ["statementRead", "memoRead", "ticketRead", "gretaProfiled"] },
];

export const M05_UNLOCKS: readonly Unlock<M05QuestData>[] = [
    { name: "teamPage", when: "vaultRevisited" },
    { name: "hospitalShells", when: "displayAttached" },
];
