import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M07QuestData } from "./state.js";

export type M07Step = FlagKey<M07QuestData>;

export const M07_STEP_ORDER: readonly M07Step[] = [
    "tipReviewed",
    "edgeScanned",
    "dashboardFound",
    "deadBoxEntered",
    "credentialRead",
    "firewallLoggedIn",
    "firewallBreached",
    "shellObtained",
    "manifestRead",
    "trapRevealed",
    "fileExtracted",
];

export const M07_GATES: readonly Gate<M07QuestData>[] = [
    { step: "edgeScanned", requires: ["tipReviewed"] },
    { step: "dashboardFound", requires: ["edgeScanned"] },
    { step: "deadBoxEntered", requires: ["dashboardFound"] },
    { step: "credentialRead", requires: ["deadBoxEntered"] },
    { step: "firewallLoggedIn", requires: ["credentialRead"] },
    { step: "firewallBreached", requires: ["firewallLoggedIn"] },
    { step: "shellObtained", requires: ["firewallBreached"] },
    { step: "manifestRead", requires: ["shellObtained"] },
    { step: "trapRevealed", requires: ["manifestRead"] },
    { step: "fileExtracted", requires: ["trapRevealed"] },
    { step: "reportSent", requires: ["fileExtracted"] },
];

export const M07_UNLOCKS: readonly Unlock<M07QuestData>[] = [
    { name: "legacyCms", when: "edgeScanned" },
    { name: "commandHostRdp", when: "firewallBreached" },
];
