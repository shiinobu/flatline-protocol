import {
    M04_STALE_FIXTURES,
    buildM04ControlFixtures,
    buildM04Fixtures,
    buildM04QuietMirrorOpenFixtures,
    buildM04RelayLeadFixtures,
    buildM04RouterCrackFixtures,
    buildM04StaticHopOpenFixtures,
} from "../../content/m04/fixtures.js";
import {
    M04_DOMAIN_RECORDS,
    M04_QUIET_MIRROR_IP,
    M04_ROUTER_IPS,
    M04_SSH_PORT,
    M04_STATIC_HOP_IP,
} from "../../content/m04/network.js";
import { buildM04Topology } from "../../content/m04/topology.js";
import type { WorldSpec } from "../../core/types.js";

export const M04_WORLD: WorldSpec = {
    id: "m04",
    networkIps: M04_ROUTER_IPS,
    networks: buildM04Topology,
    persistentDomains: [],
    domains: M04_DOMAIN_RECORDS,
    fixtures: buildM04Fixtures,
    staleFixtures: M04_STALE_FIXTURES,
    unlocks: {
        relayLead: { fixtures: buildM04RelayLeadFixtures },
        routerCrack: { fixtures: buildM04RouterCrackFixtures },
        staticHopSsh: {
            fixtures: buildM04StaticHopOpenFixtures,
            openPorts: [{ ip: M04_STATIC_HOP_IP, port: M04_SSH_PORT }],
        },
        quietMirrorSsh: {
            fixtures: buildM04QuietMirrorOpenFixtures,
            openPorts: [{ ip: M04_QUIET_MIRROR_IP, port: M04_SSH_PORT }],
        },
        controlHost: { fixtures: buildM04ControlFixtures },
    },
};
