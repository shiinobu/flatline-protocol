import { Shell } from "@hotbunny/hackhub-content-sdk";

import type { FixtureEntry, FixtureRef } from "../core/types.js";

export const applyFixtures = (entries: readonly FixtureEntry[]): void => {
    for (const entry of entries) Shell.addCommandData(entry.command, entry.input, entry.data);
};

export const removeFixtures = (refs: readonly FixtureRef[]): void => {
    for (const ref of refs) Shell.removeCommandData(ref.command, ref.input);
};
