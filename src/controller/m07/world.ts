import {
    M07_STALE_FIXTURES,
    buildM07CommandHostOpenFixtures,
    buildM07Fixtures,
} from "../../content/m07/fixtures.js";
import {
    M07_C2_IP,
    M07_DOMAIN_RECORDS,
    M07_FIREWALL_IP,
    M07_RDP_PORT,
    M07_ROUTER_IPS,
} from "../../content/m07/network.js";
import { buildM07Topology } from "../../content/m07/topology.js";
import type { WorldSpec } from "../../core/types.js";

export const M07_WORLD: WorldSpec = {
    id: "m07",
    networkIps: M07_ROUTER_IPS,
    networks: buildM07Topology,
    persistentDomains: [],
    domains: M07_DOMAIN_RECORDS,
    fixtures: buildM07Fixtures,
    staleFixtures: M07_STALE_FIXTURES,
    unlocks: {
        legacyCms: {},
        commandHostRdp: {
            fixtures: buildM07CommandHostOpenFixtures,
            removeFirewallRules: [{ ip: M07_FIREWALL_IP, port: M07_RDP_PORT }],
            openPorts: [{ ip: M07_C2_IP, port: M07_RDP_PORT }],
        },
    },
};
