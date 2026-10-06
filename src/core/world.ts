import type { DomainSpec, FixtureRef, WorldSpec } from "./types.js";

const keyOf = (ref: FixtureRef): string => JSON.stringify([ref.command, ref.input]);

export const fixtureRefsOf = (world: WorldSpec): readonly FixtureRef[] => {
    const refs: readonly FixtureRef[] = [
        ...world.fixtures(),
        ...Object.values(world.unlocks).flatMap((unlock) => unlock.fixtures?.() ?? []),
        ...world.staleFixtures,
    ];

    return [...new Map(refs.map((ref) => [keyOf(ref), ref] as const)).values()];
};

export const unlockDomainsOf = (world: WorldSpec, names: readonly string[]): readonly DomainSpec[] =>
    names.flatMap((name) => world.unlocks[name]?.domains ?? []);

export const lockedDomainsOf = (world: WorldSpec, unlocked: readonly string[]): readonly DomainSpec[] =>
    unlockDomainsOf(
        world,
        Object.keys(world.unlocks).filter((name) => !unlocked.includes(name)),
    );

export const allDomainsOf = (world: WorldSpec): readonly DomainSpec[] => [
    ...world.domains,
    ...unlockDomainsOf(world, Object.keys(world.unlocks)),
];

export const databaseHostsOf = (world: WorldSpec): readonly string[] =>
    (world.databases?.() ?? []).map((spec) => spec.host);
