import {
    M05_STALE_FIXTURES,
    buildM05Fixtures,
    buildM05TeamPageFixtures,
} from "../../content/m05/fixtures.js";
import {
    M05_BEDSIDE_IP,
    M05_DOMAIN_RECORDS,
    M05_FIREWALL_IP,
    M05_RDP_PORT,
    M05_ROUTER_IPS,
} from "../../content/m05/network.js";
import { buildM05Topology } from "../../content/m05/topology.js";
import type { WorldSpec } from "../../core/types.js";

export const M05_WORLD: WorldSpec = {
    id: "m05",
    networkIps: M05_ROUTER_IPS,
    networks: buildM05Topology,
    persistentDomains: [],
    domains: M05_DOMAIN_RECORDS,
    fixtures: buildM05Fixtures,
    staleFixtures: M05_STALE_FIXTURES,
    unlocks: {
        teamPage: { fixtures: buildM05TeamPageFixtures },
        hospitalShells: {
            removeFirewallRules: [{ ip: M05_FIREWALL_IP, port: M05_RDP_PORT }],
            openPorts: [{ ip: M05_BEDSIDE_IP, port: M05_RDP_PORT }],
        },
    },
};
