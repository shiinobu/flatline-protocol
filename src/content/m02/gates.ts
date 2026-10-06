import type { FlagKey, Gate, Unlock } from "../../core/types.js";

import type { M02QuestData } from "./state.js";

export type M02Step = FlagKey<M02QuestData>;

export const M02_STEP_ORDER: readonly M02Step[] = [
    "tipReviewed",
    "rootProbed",
    "subdomainsEnumerated",
    "adminsDumped",
    "affiliatesDumped",
    "devboxAccessed",
    "deployLogRead",
    "homeLeadRead",
    "firewallLoggedIn",
    "firewallBreached",
    "workstationRooted",
    "shellCompanyFound",
];

export const M02_GATES: readonly Gate<M02QuestData>[] = [
    { step: "rootProbed", requires: ["tipReviewed"] },
    { step: "subdomainsEnumerated", requires: ["rootProbed"] },
    { step: "adminsDumped", requires: ["subdomainsEnumerated"] },
    { step: "affiliatesDumped", requires: ["subdomainsEnumerated"] },
    { step: "devboxAccessed", requires: ["adminsDumped"] },
    { step: "deployLogRead", requires: ["devboxAccessed"] },
    { step: "homeLeadRead", requires: ["devboxAccessed"] },
    { step: "firewallLoggedIn", requires: ["homeLeadRead"] },
    { step: "firewallBreached", requires: ["firewallLoggedIn"] },
    { step: "workstationRooted", requires: ["firewallBreached"] },
    { step: "shellCompanyFound", requires: ["workstationRooted"] },
    { step: "aftermathShown", requires: ["workstationRooted"] },
    { step: "reportSent", requires: ["shellCompanyFound", "deployLogRead", "affiliatesDumped"] },
];

export const M02_UNLOCKS: readonly Unlock<M02QuestData>[] = [
    { name: "subdomainLead", when: "rootProbed" },
    { name: "workstationRdp", when: "firewallBreached" },
];
