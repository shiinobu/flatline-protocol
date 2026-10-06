import { existingNetworkIps, networksExist } from "../components/topology.js";
import { applyData, applyDomains, applyNetwork, applyShell } from "./apply.js";
import { cancelTeardown, scheduleRebuild } from "./rebuild.js";
import type { WorldSpec, WorldState } from "./types.js";

export const register = <R = never>(world: WorldSpec<R>, state: WorldState<R>): boolean => {
    cancelTeardown(world);

    if (state.networkBuilt && networksExist(world.networkIps)) {
        applyData(world);
        applyDomains(world, state.unlocked);
        applyShell(world, state.unlocked);
        return false;
    }

    if (existingNetworkIps(world.networkIps).length === 0) {
        applyNetwork(world, state.unlocked, state.restore);
        applyShell(world, state.unlocked);
        return true;
    }

    applyShell(world, state.unlocked);
    scheduleRebuild(world, state.unlocked, state.restore);
    return true;
};
