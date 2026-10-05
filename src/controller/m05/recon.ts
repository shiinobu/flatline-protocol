import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M01_PROJECT_OPENED_EVENT, M01_VAULT_PROJECT_FOLDER } from "../../content/global/vault-hook.js";
import { M05_ECHOLINE_CAPTURE } from "../../content/m05/echoline.js";
import { M05_GATES } from "../../content/m05/gates.js";
import { M05_DEAD_DROP_EMAIL, M05_TIP_SUBJECT } from "../../content/m05/mail.js";
import {
    M05_ECHOLINE_DOMAIN,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_TEAM_PATH,
} from "../../content/m05/network.js";
import { M05_LOG_DISMISSED, M05_LOG_GRETA } from "../../content/m05/quest-logs.js";
import { M05_GRETA_LYNX_INPUTS } from "../../content/m05/twotter.js";
import { setM05ArchiveOpen, setM05TeamOpen } from "../../context/m05/progress.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M05Quest } from "./types.js";

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
        advanceStep(quest, M05_GATES, "vaultRevisited", () => setM05TeamOpen(true));
    });
};

const bindTeamPage = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:" || data.hostname !== M05_HOSPITAL_HOME_DOMAIN) return;
        if (normalizePath(data.pathname) !== normalizePath(M05_TEAM_PATH)) return;

        trace("M05", "probe:team-page-seen");
        advanceStep(quest, M05_GATES, "teamPageSeen", () => setM05ArchiveOpen(true));
    });
};

const bindArchive = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:" || data.hostname !== M05_ECHOLINE_DOMAIN) return;
        if (normalizePath(data.pathname) !== normalizePath(M05_ECHOLINE_CAPTURE.path)) return;

        trace("M05", "probe:staff-archive-compared");
        advanceStep(quest, M05_GATES, "staffArchiveCompared", () =>
            traceBacktraceFinding("m5", "dismissed", M05_LOG_DISMISSED()),
        );
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

export const bindM05Recon = (quest: M05Quest): void => {
    bindTip(quest);
    bindVault(quest);
    bindTeamPage(quest);
    bindArchive(quest);
    bindGreta(quest);
};
