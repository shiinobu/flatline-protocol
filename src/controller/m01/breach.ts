import { M01_GATES } from "../../content/m01/gates.js";
import { M01_BROKER_ALIAS, M01_FIREWALL_IP, M01_TARGET_IP } from "../../content/m01/network.js";
import { M01_JWT_DECODER_SCRIPT_NAME, M01_KIMAI_SCRIPT_NAME } from "../../content/m01/server-files.js";
import { M01_WORLD } from "./world.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M01Quest } from "./types.js";

const bindScripts = (quest: M01Quest): void => {
    quest.Events.on("Python3.ExecFile", (data) => {
        if (data.file.name === M01_KIMAI_SCRIPT_NAME) {
            if (data.args[0] !== M01_FIREWALL_IP) return;

            advanceStep(quest, M01_GATES, "kimaiRan");
            return;
        }

        if (data.file.name === M01_JWT_DECODER_SCRIPT_NAME) {
            if (data.args.length !== 1) return;

            advanceStep(quest, M01_GATES, "tokenDecoded");
        }
    });
};

const bindFirewall = (quest: M01Quest): void => {
    quest.Events.on("PFSense.Login", (data) => {
        if (data.ip !== M01_FIREWALL_IP) return;

        advanceStep(quest, M01_GATES, "pfsenseLoggedIn");
    });

    quest.Events.on("PFSense.Changes", () => {
        advanceStep(quest, M01_GATES, "firewallBreached", () => unlock(M01_WORLD, "backendSsh"));
    });
};

const bindHydra = (quest: M01Quest): void => {
    quest.Events.on("Terminal.Hydra", (data) => {
        if (data.ip !== M01_TARGET_IP) return;
        if (data.credentials.username !== M01_BROKER_ALIAS) return;

        advanceStep(quest, M01_GATES, "credentialsCracked");
    });
};

export const bindM01Breach = (quest: M01Quest): void => {
    bindScripts(quest);
    bindFirewall(quest);
    bindHydra(quest);
};
