import { M04_STALE_FIXTURES, buildM04ControlFixtures, buildM04Fixtures } from "../../content/m04/fixtures.js";
import { M04_DOMAIN_RECORDS, M04_ROUTER_IPS } from "../../content/m04/network.js";
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
        controlHost: { fixtures: buildM04ControlFixtures },
    },
};
