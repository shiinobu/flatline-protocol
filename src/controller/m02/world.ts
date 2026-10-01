import { buildM02Databases } from "../../content/m02/database.js";
import { buildM02Fixtures, buildM02SubdomainFixtures } from "../../content/m02/fixtures.js";
import {
    M02_DOMAIN_RECORDS,
    M02_FIREWALL_IP,
    M02_ROUTER_IPS,
    M02_SUBDOMAIN_RECORDS,
    M02_WORKSTATION_IP,
} from "../../content/m02/network.js";
import { buildM02Topology } from "../../content/m02/topology.js";
import type { WorldSpec } from "../../core/types.js";

const RDP_PORT = 3389;

export const M02_WORLD: WorldSpec = {
    id: "m02",
    networkIps: M02_ROUTER_IPS,
    networks: buildM02Topology,
    persistentDomains: [],
    domains: M02_DOMAIN_RECORDS,
    fixtures: buildM02Fixtures,
    staleFixtures: [],
    unlocks: {
        subdomainLead: { fixtures: buildM02SubdomainFixtures, domains: M02_SUBDOMAIN_RECORDS },
        workstationRdp: {
            removeFirewallRules: [{ ip: M02_FIREWALL_IP, port: RDP_PORT }],
            openPorts: [{ ip: M02_WORKSTATION_IP, port: RDP_PORT }],
        },
    },
    databases: buildM02Databases,
};
