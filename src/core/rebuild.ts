import { Scheduler } from "@hotbunny/hackhub-content-sdk";

import { removeDatabases } from "../components/database.js";
import { removeDomains } from "../components/domains.js";
import { destroyNetworksInOrder } from "../components/topology.js";
import { applyNetwork } from "./apply.js";
import type { WorldSpec } from "./types.js";
import { allDomainsOf, databaseHostsOf } from "./world.js";

interface RebuildPayload<R> {
    readonly unlocked: string[];
    readonly restore?: R;
}

const JOB_DELAY = { realMs: 250 };

const rebuildKind = (worldId: string): string => `flatline.world.rebuild.${worldId}`;
const teardownKind = (worldId: string): string => `flatline.world.teardown.${worldId}`;

const rebuildWorld = async <R>(world: WorldSpec<R>, payload: RebuildPayload<R>): Promise<void> => {
    await destroyNetworksInOrder(world.networkIps);
    applyNetwork(world, payload.unlocked, payload.restore);
};

const teardownWorld = async (world: WorldSpec): Promise<void> => {
    await destroyNetworksInOrder(world.networkIps);
    removeDomains(allDomainsOf(world));
    removeDatabases(databaseHostsOf(world));
};

export const bindWorld = <R = never>(world: WorldSpec<R>): void => {
    Scheduler.register<RebuildPayload<R>>(rebuildKind(world.id), (payload) => rebuildWorld(world, payload));
    Scheduler.register(teardownKind(world.id), () => teardownWorld(world));
};

export const cancelTeardown = (world: WorldSpec): void => {
    Scheduler.cancelKind(teardownKind(world.id));
};

export const scheduleRebuild = <R = never>(world: WorldSpec<R>, unlocked: readonly string[], restore?: R): void => {
    cancelTeardown(world);
    Scheduler.cancelKind(rebuildKind(world.id));
    Scheduler.schedule<RebuildPayload<R>>(
        rebuildKind(world.id),
        restore === undefined ? { unlocked: [...unlocked] } : { unlocked: [...unlocked], restore },
        JOB_DELAY,
    );
};

export const scheduleTeardown = (world: WorldSpec): void => {
    Scheduler.cancelKind(rebuildKind(world.id));
    cancelTeardown(world);
    Scheduler.schedule(teardownKind(world.id), {}, JOB_DELAY);
};
