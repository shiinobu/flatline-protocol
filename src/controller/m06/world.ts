import {
    M06_STALE_FIXTURES,
    buildM06ArchiveFixtures,
    buildM06Fixtures,
    buildM06InfraFixtures,
    buildM06NomineesFixtures,
} from "../../content/m06/fixtures.js";
import { M06_DOMAIN_RECORDS, M06_NETWORK_IPS } from "../../content/m06/network.js";
import type { RouterSpec, WorldSpec } from "../../core/types.js";

const noNetworks = (): readonly RouterSpec[] => [];

export const M06_WORLD: WorldSpec = {
    id: "m06",
    networkIps: M06_NETWORK_IPS,
    networks: noNetworks,
    persistentDomains: [],
    domains: M06_DOMAIN_RECORDS,
    fixtures: buildM06Fixtures,
    staleFixtures: M06_STALE_FIXTURES,
    unlocks: {
        nomineesRecord: { fixtures: buildM06NomineesFixtures },
        filingArchive: { fixtures: buildM06ArchiveFixtures },
        infraRecords: { fixtures: buildM06InfraFixtures },
    },
};
