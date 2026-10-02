import { M07_GATES } from "../../content/m07/gates.js";
import { M07_FIREWALL_IP } from "../../content/m07/network.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

export const bindM07Firewall = (quest: M07Quest): void => {
    quest.Events.on("PFSense.Login", (data) => {
        if (data.ip !== M07_FIREWALL_IP) return;

        advanceStep(quest, M07_GATES, "firewallLoggedIn");
    });

    quest.Events.on("PFSense.Changes", () => {
        advanceStep(quest, M07_GATES, "firewallBreached", () => unlock(M07_WORLD, "commandHostRdp"));
    });
};
