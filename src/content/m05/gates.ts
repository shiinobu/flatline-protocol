import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M05QuestData } from "./state.js";

export type M05Step = FlagKey<M05QuestData>;

export const M05_STEP_ORDER: readonly M05Step[] = [
    "tipReviewed",
    "vaultRevisited",
    "staffArchiveCompared",
    "gretaProfiled",
    "edgeMapped",
    "credentialFound",
    "passwordCracked",
    "firewallLoggedIn",
    "firewallBreached",
    "archiveAccessed",
    "statementRead",
    "memoRead",
    "ticketRead",
];

export const M05_GATES: readonly Gate<M05QuestData>[] = [
    { step: "vaultRevisited", requires: ["tipReviewed"] },
    { step: "staff2025Seen", requires: ["vaultRevisited"] },
    { step: "staff2026Seen", requires: ["vaultRevisited"] },
    { step: "staffArchiveCompared", requires: ["staff2025Seen", "staff2026Seen"] },
    { step: "gretaProfiled", requires: ["vaultRevisited"] },
    { step: "edgeMapped", requires: ["staffArchiveCompared", "gretaProfiled"] },
    { step: "credentialFound", requires: ["edgeMapped"] },
    { step: "passwordCracked", requires: ["credentialFound"] },
    { step: "firewallLoggedIn", requires: ["passwordCracked"] },
    { step: "firewallBreached", requires: ["firewallLoggedIn"] },
    { step: "archiveAccessed", requires: ["firewallBreached"] },
    { step: "statementRead", requires: ["archiveAccessed"] },
    { step: "memoRead", requires: ["archiveAccessed"] },
    { step: "ticketRead", requires: ["archiveAccessed"] },
    { step: "reportSent", requires: ["statementRead", "memoRead", "ticketRead"] },
];

export const M05_UNLOCKS: readonly Unlock<M05QuestData>[] = [
    { name: "archiveLead", when: "vaultRevisited" },
    { name: "edgeLead", when: "staffArchiveCompared" },
    { name: "breachLookup", when: "edgeMapped" },
    { name: "hospitalShells", when: "firewallBreached" },
];
