import { buildM01BrokerLeadFixtures, buildM01Fixtures, M01_STALE_FIXTURES } from "../../content/m01/fixtures.js";
import {
    M01_BROKER_LEAD_DOMAIN_RECORDS,
    M01_DOMAIN_RECORDS,
    M01_FIREWALL_IP,
    M01_LEDGERVAULT_DOMAIN,
    M01_LEDGERVAULT_IP,
    M01_ROUTER_IPS,
    M01_TARGET_IP,
} from "../../content/m01/network.js";
import { buildM01Topology } from "../../content/m01/topology.js";
import type { WorldSpec } from "../../core/types.js";
import { getM01WinningCode } from "../../context/m01/listing.js";

export const M01_WORLD: WorldSpec = {
    id: "m01",
    networkIps: M01_ROUTER_IPS,
    networks: () => buildM01Topology(getM01WinningCode()),
    persistentDomains: [{ name: M01_LEDGERVAULT_DOMAIN, ip: M01_LEDGERVAULT_IP }],
    domains: M01_DOMAIN_RECORDS,
    fixtures: buildM01Fixtures,
    staleFixtures: M01_STALE_FIXTURES,
    unlocks: {
        brokerLead: { fixtures: buildM01BrokerLeadFixtures, domains: M01_BROKER_LEAD_DOMAIN_RECORDS },
        backendSsh: {
            removeFirewallRules: [{ ip: M01_FIREWALL_IP, port: 22 }],
            openPorts: [{ ip: M01_TARGET_IP, port: 22 }],
        },
    },
};
