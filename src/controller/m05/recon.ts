import { M01_PROJECT_OPENED_EVENT, M01_VAULT_PROJECT_FOLDER } from "../../content/global/vault-hook.js";
import {
    M05_ECHOLINE_CAPTURES,
    M05_ECHOLINE_CHANGE_CAPTURE_REF,
    M05_ECHOLINE_LATE_PATH,
} from "../../content/m05/echoline.js";
import { M05_GATES } from "../../content/m05/gates.js";
import { M05_DEAD_DROP_EMAIL, M05_TIP_SUBJECT } from "../../content/m05/mail.js";
import {
    M05_CHANGE_PATH,
    M05_ECHOLINE_DOMAIN,
    M05_HOSPITAL_HOME_DOMAIN,
    M05_TEAM_PATH,
} from "../../content/m05/network.js";
import { M05_ROXANNE_LYNX_INPUTS } from "../../content/m05/twotter.js";
import { isM05ArchiveOpen, isM05TeamOpen, setM05TeamOpen } from "../../context/m05/progress.js";
import { advanceStep } from "../../middleware/gate.js";
import { settleM05 } from "./portal.js";
import type { M05Quest } from "./types.js";

interface PageVisit {
    readonly protocol: string;
    readonly hostname: string;
    readonly pathname: string;
}

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const isVisit = (visit: PageVisit, hostname: string, path: string): boolean =>
    visit.protocol === "https:" &&
    visit.hostname === hostname &&
    normalizePath(visit.pathname) === normalizePath(path);

const CAPTURE_PATHS: readonly string[] = M05_ECHOLINE_CAPTURES.map((capture) => normalizePath(capture.path));
const CHANGE_CAPTURE_PATH = normalizePath(`/s/${M05_ECHOLINE_CHANGE_CAPTURE_REF}/`);

const bindTip = (quest: M05Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M05_DEAD_DROP_EMAIL || data.subject !== M05_TIP_SUBJECT()) return;

        advanceStep(quest, M05_GATES, "tipReviewed");
    });
};

const bindVault = (quest: M05Quest): void => {
    quest.Events.on(M01_PROJECT_OPENED_EVENT, (data: { readonly folder: string }) => {
        if (data.folder !== M01_VAULT_PROJECT_FOLDER) return;

        advanceStep(quest, M05_GATES, "vaultRevisited", () => setM05TeamOpen(true));
    });
};

const bindTeamPage = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isVisit(data, M05_HOSPITAL_HOME_DOMAIN, M05_TEAM_PATH)) return;

        advanceStep(quest, M05_GATES, "teamPageSeen", () => settleM05(quest));
    });
};

const bindChangeRecord = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isVisit(data, M05_HOSPITAL_HOME_DOMAIN, M05_CHANGE_PATH) || !isM05TeamOpen()) return;
        if (quest.Data.changeSeen) return;

        quest.SetData("changeSeen", true);
        settleM05(quest);
    });
};

const bindArchive = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:" || data.hostname !== M05_ECHOLINE_DOMAIN || !isM05ArchiveOpen()) return;

        const path = normalizePath(data.pathname);
        if (!CAPTURE_PATHS.includes(path)) return;

        const late = path === normalizePath(M05_ECHOLINE_LATE_PATH);
        if (!late && path !== CHANGE_CAPTURE_PATH) return;

        const flag = late ? "captureLateSeen" : "captureEarlySeen";
        if (quest.Data[flag]) return;

        quest.SetData(flag, true);
        settleM05(quest);
    });
};

const markRoxanne = (quest: M05Quest): void => {
    if (quest.Data.roxanneSeen) return;

    quest.SetData("roxanneSeen", true);
    settleM05(quest);
};

const isRoxanneLookup = (subject: string): boolean => M05_ROXANNE_LYNX_INPUTS.includes(subject);

const bindRoxanne = (quest: M05Quest): void => {
    quest.Events.on("Terminal.Lynx.Lookup", (data) => {
        if (!isRoxanneLookup(data.input)) return;
        markRoxanne(quest);
    });

    quest.Events.on("Terminal.Lynx.Search", (data) => {
        if (!isRoxanneLookup(data)) return;
        markRoxanne(quest);
    });
};

export const bindM05Recon = (quest: M05Quest): void => {
    bindTip(quest);
    bindVault(quest);
    bindTeamPage(quest);
    bindChangeRecord(quest);
    bindArchive(quest);
    bindRoxanne(quest);
};
