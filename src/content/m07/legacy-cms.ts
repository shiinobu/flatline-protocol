import {
    M07_ASHVECTOR_IP,
    M07_ASHVECTOR_RETIRED_YEAR,
    M07_C2_IP,
    M07_FIREWALL_IP,
    M07_FIREWALL_LABEL,
    M07_NULLCROWN_IP,
    M07_NULLCROWN_RETIRED_YEAR,
} from "./network.js";

export interface M07NodeRow {
    readonly label: string;
    readonly address: string;
    readonly role: string;
    readonly state: "active" | "retired";
    readonly retiredYear: string;
}

export const M07_NODE_ROWS: readonly M07NodeRow[] = [
    { label: "index-01", address: M07_C2_IP, role: "index", state: "active", retiredYear: "" },
    { label: M07_FIREWALL_LABEL, address: M07_FIREWALL_IP, role: "edge", state: "active", retiredYear: "" },
    {
        label: "node-07",
        address: M07_NULLCROWN_IP,
        role: "relay",
        state: "retired",
        retiredYear: M07_NULLCROWN_RETIRED_YEAR,
    },
    {
        label: "node-11",
        address: M07_ASHVECTOR_IP,
        role: "relay",
        state: "retired",
        retiredYear: M07_ASHVECTOR_RETIRED_YEAR,
    },
];
