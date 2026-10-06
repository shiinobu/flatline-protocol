import { M03_GATES } from "../../content/m03/gates.js";
import { M03_DEAD_DROP_EMAIL, M03_TIP_SUBJECT } from "../../content/m03/mail.js";
import { M03_SKYNET_DOMAIN, M03_SKYNET_IP } from "../../content/m03/network.js";
import { M03_WORLD } from "./world.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M03Quest } from "./types.js";

const scoutSite = (quest: M03Quest): void => {
    advanceStep(quest, M03_GATES, "siteScouted", () => unlock(M03_WORLD, "gatewayLead"));
};

const bindTip = (quest: M03Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M03_DEAD_DROP_EMAIL || data.subject !== M03_TIP_SUBJECT()) return;

        advanceStep(quest, M03_GATES, "tipReviewed");
    });
};

const bindLookups = (quest: M03Quest): void => {
    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M03_SKYNET_IP && data.ip !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Terminal.Nslookup", (data) => {
        if (data.domain !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Terminal.Mxlookup", (data) => {
        if (data.domain !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Terminal.Lynx.Lookup", (data) => {
        if (data.input !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Terminal.Lynx.Search", (data) => {
        if (data !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });

    quest.Events.on("Browser.Meta", (data) => {
        if (data.hostname !== M03_SKYNET_DOMAIN) return;

        scoutSite(quest);
    });
};

export const bindM03Recon = (quest: M03Quest): void => {
    bindTip(quest);
    bindLookups(quest);
};
