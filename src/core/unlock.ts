import { registerDomains } from "../components/domains.js";
import { applyFixtures } from "../components/fixtures.js";
import { openPorts, removeFirewallRules } from "../components/topology.js";
import type { UnlockSpec, WorldSpec } from "./types.js";

const specsOf = (world: WorldSpec, names: readonly string[]): readonly UnlockSpec[] =>
    names.flatMap((name) => world.unlocks[name] ?? []);

export const applyFixtureUnlocks = (world: WorldSpec, names: readonly string[]): void => {
    for (const spec of specsOf(world, names)) applyFixtures(spec.fixtures?.() ?? []);
};

export const applyDomainUnlocks = (world: WorldSpec, names: readonly string[]): void => {
    for (const spec of specsOf(world, names)) registerDomains([], spec.domains ?? []);
};

export const applyNetworkUnlocks = (world: WorldSpec, names: readonly string[]): void => {
    for (const spec of specsOf(world, names)) {
        removeFirewallRules(spec.removeFirewallRules ?? []);
        openPorts(spec.openPorts ?? []);
    }
};

export const unlock = (world: WorldSpec, name: string): void => {
    applyFixtureUnlocks(world, [name]);
    applyDomainUnlocks(world, [name]);
    applyNetworkUnlocks(world, [name]);
};
