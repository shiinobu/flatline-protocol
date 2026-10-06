import { buildM03Databases } from "../../content/m03/database.js";
import { M03_STALE_FIXTURES, buildM03Fixtures, buildM03GatewayLeadFixtures } from "../../content/m03/fixtures.js";
import {
    M03_DOMAIN_RECORDS,
    M03_GATEWAY_LEAD_DOMAIN_RECORDS,
    M03_ROUTER_IPS,
} from "../../content/m03/network.js";
import type { M03Forward } from "../../content/m03/state.js";
import { buildM03Topology } from "../../content/m03/topology.js";
import type { WorldSpec } from "../../core/types.js";
import { restoreForwards } from "./forwards.js";

export const M03_WORLD: WorldSpec<readonly M03Forward[]> = {
    id: "m03",
    networkIps: M03_ROUTER_IPS,
    networks: buildM03Topology,
    persistentDomains: [],
    domains: M03_DOMAIN_RECORDS,
    fixtures: buildM03Fixtures,
    staleFixtures: M03_STALE_FIXTURES,
    unlocks: {
        gatewayLead: { fixtures: buildM03GatewayLeadFixtures, domains: M03_GATEWAY_LEAD_DOMAIN_RECORDS },
    },
    databases: buildM03Databases,
    restore: restoreForwards,
};
