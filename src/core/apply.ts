import { registerDomains, removeDomains } from "../components/domains.js";
import { applyFixtures, removeFixtures } from "../components/fixtures.js";
import { buildNetworks } from "../components/topology.js";
import type { WorldSpec } from "./types.js";
import { applyDomainUnlocks, applyFixtureUnlocks, applyNetworkUnlocks } from "./unlock.js";
import { fixtureRefsOf, lockedDomainsOf } from "./world.js";

export const applyDomains = (world: WorldSpec, unlocked: readonly string[]): void => {
    registerDomains(world.persistentDomains, world.domains);
    applyDomainUnlocks(world, unlocked);
    removeDomains(lockedDomainsOf(world, unlocked));
};

export const applyShell = (world: WorldSpec, unlocked: readonly string[]): void => {
    removeFixtures(fixtureRefsOf(world));
    applyFixtures(world.fixtures());
    applyFixtureUnlocks(world, unlocked);
};

export const applyNetwork = (world: WorldSpec, unlocked: readonly string[]): void => {
    buildNetworks(world.networks());
    applyDomains(world, unlocked);
    applyNetworkUnlocks(world, unlocked);
};
