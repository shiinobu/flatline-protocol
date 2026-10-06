import { removeFixtures } from "../components/fixtures.js";
import { scheduleTeardown } from "./rebuild.js";
import type { WorldSpec } from "./types.js";
import { fixtureRefsOf } from "./world.js";

export const unregister = (world: WorldSpec): void => {
    removeFixtures(fixtureRefsOf(world));
    scheduleTeardown(world);
};
