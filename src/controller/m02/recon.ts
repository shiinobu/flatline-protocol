import { M02_GATES } from "../../content/m02/gates.js";
import { M02_DEAD_DROP_EMAIL, M02_TIP_SUBJECT } from "../../content/m02/mail.js";
import { M02_ROOT_DOMAIN, M02_ROOT_IP } from "../../content/m02/network.js";
import { M02_WORLD } from "./world.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M02Quest } from "./types.js";

const probeRoot = (quest: M02Quest): void => {
    advanceStep(quest, M02_GATES, "rootProbed", () => unlock(M02_WORLD, "subdomainLead"));
};

const bindTip = (quest: M02Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M02_DEAD_DROP_EMAIL || data.subject !== M02_TIP_SUBJECT()) return;

        advanceStep(quest, M02_GATES, "tipReviewed");
    });
};

const bindProbes = (quest: M02Quest): void => {
    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M02_ROOT_IP && data.ip !== M02_ROOT_DOMAIN) return;

        probeRoot(quest);
    });

    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain !== M02_ROOT_DOMAIN) return;

        probeRoot(quest);
    });

    quest.Events.on("Terminal.Nslookup", (data) => {
        if (data.domain !== M02_ROOT_DOMAIN) return;

        probeRoot(quest);
    });

    quest.Events.on("Subfinder.Results", (data) => {
        if (data.domain !== M02_ROOT_DOMAIN) return;

        advanceStep(quest, M02_GATES, "subdomainsEnumerated");
    });
};

export const bindM02Recon = (quest: M02Quest): void => {
    bindTip(quest);
    bindProbes(quest);
};
