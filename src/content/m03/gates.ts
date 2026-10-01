import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M03QuestData } from "./state.js";

export type M03Step = FlagKey<M03QuestData>;

export const M03_STEP_ORDER: readonly M03Step[] = [
    "tipReviewed",
    "siteScouted",
    "portalReached",
    "natPivotDone",
    "ledgerDumped",
    "gatewayShellObtained",
    "vpnConfigRead",
];

export const M03_GATES: readonly Gate<M03QuestData>[] = [
    { step: "siteScouted", requires: ["tipReviewed"] },
    { step: "portalReached", requires: ["siteScouted"] },
    { step: "natPivotDone", requires: ["portalReached"] },
    { step: "ledgerDumped", requires: ["natPivotDone"] },
    { step: "gatewayShellObtained", requires: ["ledgerDumped"] },
    { step: "vpnConfigRead", requires: ["gatewayShellObtained"] },
    { step: "accompliceReached", requires: ["natPivotDone"] },
    { step: "reportSent", requires: ["ledgerDumped", "vpnConfigRead"] },
];

export const M03_UNLOCKS: readonly Unlock<M03QuestData>[] = [{ name: "gatewayLead", when: "siteScouted" }];
