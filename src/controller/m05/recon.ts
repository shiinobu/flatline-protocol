import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M01_PROJECT_OPENED_EVENT, M01_VAULT_PROJECT_FOLDER } from "../../content/global/vault-hook.js";
import { M05_GATES } from "../../content/m05/gates.js";
import {
    M05_ARCHIVE_LEAD_MAIL,
    M05_DEAD_DROP_EMAIL,
    M05_LOOKUP_LEAD_MAIL,
    M05_TIP_SUBJECT,
} from "../../content/m05/mail.js";
import {
    M05_ECHOLINE_DOMAIN,
    M05_ECHOLINE_M05_2025_PATH,
    M05_ECHOLINE_M05_2026_PATH,
    M05_EDGE_DOMAIN,
    M05_EDGE_IP,
} from "../../content/m05/network.js";
import { M05_LOG_DISMISSED, M05_LOG_GRETA } from "../../content/m05/quest-logs.js";
import { M05_GRETA_LYNX_INPUTS } from "../../content/m05/twotter.js";
import { setM05ArchiveOpen, setM05LookupOpen } from "../../context/m05/progress.js";
import { unlock } from "../../core/index.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M05Quest } from "./types.js";
import { M05_WORLD } from "./world.js";

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const bindTip = (quest: M05Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M05_DEAD_DROP_EMAIL || data.subject !== M05_TIP_SUBJECT()) return;

        advanceStep(quest, M05_GATES, "tipReviewed");
    });
};

const bindVault = (quest: M05Quest): void => {
    quest.Events.on(M01_PROJECT_OPENED_EVENT, (data: { readonly folder: string }) => {
        if (data.folder !== M01_VAULT_PROJECT_FOLDER) return;

        trace("M05", "probe:vault-revisited");
        advanceStep(quest, M05_GATES, "vaultRevisited", () => {
            unlock(M05_WORLD, "archiveLead");
            setM05ArchiveOpen(true);
            Mail.send(M05_ARCHIVE_LEAD_MAIL());
        });
    });
};

const compareArchive = (quest: M05Quest): void => {
    advanceStep(quest, M05_GATES, "staffArchiveCompared", () => {
        traceBacktraceFinding("m5", "dismissed", M05_LOG_DISMISSED());
        unlock(M05_WORLD, "edgeLead");
    });
};

const bindArchive = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:" || data.hostname !== M05_ECHOLINE_DOMAIN) return;

        const path = normalizePath(data.pathname);
        if (path === normalizePath(M05_ECHOLINE_M05_2025_PATH)) {
            advanceStep(quest, M05_GATES, "staff2025Seen");
        } else if (path === normalizePath(M05_ECHOLINE_M05_2026_PATH)) {
            advanceStep(quest, M05_GATES, "staff2026Seen");
        } else {
            return;
        }

        trace("M05", `probe:snapshot-seen path=${path}`);
        compareArchive(quest);
    });
};

const markGreta = (quest: M05Quest): void => {
    advanceStep(quest, M05_GATES, "gretaProfiled", () =>
        traceBacktraceFinding("m5", "greta", M05_LOG_GRETA()),
    );
};

const isGretaLookup = (subject: string): boolean => M05_GRETA_LYNX_INPUTS.includes(subject);

const bindGreta = (quest: M05Quest): void => {
    quest.Events.on("Terminal.Lynx.Lookup", (data) => {
        if (!isGretaLookup(data.input)) return;
        markGreta(quest);
    });

    quest.Events.on("Terminal.Lynx.Search", (data) => {
        if (!isGretaLookup(data)) return;
        markGreta(quest);
    });
};

const bindEdge = (quest: M05Quest): void => {
    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M05_EDGE_IP && data.ip !== M05_EDGE_DOMAIN) return;

        trace("M05", "probe:edge-mapped");
        advanceStep(quest, M05_GATES, "edgeMapped", () => {
            unlock(M05_WORLD, "breachLookup");
            setM05LookupOpen(true);
            Mail.send(M05_LOOKUP_LEAD_MAIL());
        });
    });
};

export const bindM05Recon = (quest: M05Quest): void => {
    bindTip(quest);
    bindVault(quest);
    bindArchive(quest);
    bindGreta(quest);
    bindEdge(quest);
};
