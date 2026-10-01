import { Scheduler } from "@hotbunny/hackhub-content-sdk";

import { removeDomains } from "../components/domains.js";
import { destroyNetworksInOrder } from "../components/topology.js";
import { applyNetwork } from "./apply.js";
import type { WorldSpec } from "./types.js";
import { allDomainsOf } from "./world.js";

interface RebuildPayload {
    readonly unlocked: string[];
}

const JOB_DELAY = { realMs: 250 };

const rebuildKind = (worldId: string): string => `flatline.world.rebuild.${worldId}`;
const teardownKind = (worldId: string): string => `flatline.world.teardown.${worldId}`;

const rebuildWorld = async (world: WorldSpec, payload: RebuildPayload): Promise<void> => {
    await destroyNetworksInOrder(world.networkIps);
    applyNetwork(world, payload.unlocked);
};

const teardownWorld = async (world: WorldSpec): Promise<void> => {
    await destroyNetworksInOrder(world.networkIps);
    removeDomains(allDomainsOf(world));
};

export const bindWorld = (world: WorldSpec): void => {
    Scheduler.register<RebuildPayload>(rebuildKind(world.id), (payload) => rebuildWorld(world, payload));
    Scheduler.register(teardownKind(world.id), () => teardownWorld(world));
};

export const cancelTeardown = (world: WorldSpec): void => {
    Scheduler.cancelKind(teardownKind(world.id));
};

export const scheduleRebuild = (world: WorldSpec, unlocked: readonly string[]): void => {
    cancelTeardown(world);
    Scheduler.cancelKind(rebuildKind(world.id));
    Scheduler.schedule<RebuildPayload>(rebuildKind(world.id), { unlocked: [...unlocked] }, JOB_DELAY);
};

export const scheduleTeardown = (world: WorldSpec): void => {
    Scheduler.cancelKind(rebuildKind(world.id));
    cancelTeardown(world);
    Scheduler.schedule(teardownKind(world.id), {}, JOB_DELAY);
};
