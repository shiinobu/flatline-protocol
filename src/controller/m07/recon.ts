import { M07_GATES } from "../../content/m07/gates.js";
import { M07_DEAD_DROP_EMAIL, M07_TIP_SUBJECT } from "../../content/m07/mail.js";
import { M07_C2_IP, M07_LEGACY_CMS_PATH } from "../../content/m07/network.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

const normalizeHost = (host: string): string =>
    host.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const bindTip = (quest: M07Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M07_DEAD_DROP_EMAIL || data.subject !== M07_TIP_SUBJECT()) return;

        advanceStep(quest, M07_GATES, "tipReviewed");
    });
};

const bindEdgeScan = (quest: M07Quest): void => {
    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M07_C2_IP || !data.versionScan) return;

        advanceStep(quest, M07_GATES, "edgeScanned", () => unlock(M07_WORLD, "legacyCms"));
    });
};

const bindDashboard = (quest: M07Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:") return;
        if (data.hostname !== M07_C2_IP) return;
        if (normalizePath(data.pathname) !== normalizePath(M07_LEGACY_CMS_PATH)) return;

        advanceStep(quest, M07_GATES, "dashboardFound");
    });

    quest.Events.on("Terminal.Dirhunter", (data) => {
        if (normalizeHost(data.host) !== M07_C2_IP) return;
        if (!data.results.includes(M07_LEGACY_CMS_PATH)) return;

        advanceStep(quest, M07_GATES, "dashboardFound");
    });
};

export const bindM07Recon = (quest: M07Quest): void => {
    bindTip(quest);
    bindEdgeScan(quest);
    bindDashboard(quest);
};
