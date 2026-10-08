import { beginBacktraceStory, setBacktraceMission, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M01_UNLOCKS } from "../../content/m01/gates.js";
import { M01_INTRO } from "../../content/m01/intro.js";
import { M01_PREMATURE_MAIL_SLOT } from "../../content/m01/mail.js";
import {
    ensureM01ListingResolution,
    resetM01ListingResolution,
    rollM01ListingResolution,
} from "../../context/m01/listing.js";
import { clearM01VaultSeal, setM01VaultSealed } from "../../context/m01/progress.js";
import { M01_WORLD } from "./world.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { bindM01Access } from "./access.js";
import { bindM01Breach } from "./breach.js";
import { seedM01Irc } from "./irc.js";
import { bindM01Recon } from "./recon.js";
import { M01_REPORT_SPEC } from "./report.js";
import type { M01Quest } from "./types.js";
import { bindM01Vault } from "./vault.js";

export { createM01Data } from "../../content/m01/state.js";
export { M01_QUEST } from "./spec.js";

bindWorld(M01_WORLD);

const retraceFindings = (quest: M01Quest): void => {
    if (quest.Data.listingFound) traceBacktraceFinding("m1", "broker");
    if (quest.Data.vaultVisited) traceBacktraceFinding("m1", "vault");
    if (quest.Data.caseFileOpened) traceBacktraceFinding("m1", "caseId");
};

const teardown = (): void => {
    closeMissionSites("m01");
    resetM01ListingResolution();
    clearM01VaultSeal();
    withdrawSlotMail(M01_PREMATURE_MAIL_SLOT);
    unregister(M01_WORLD);
};

export const onStartM01 = (): void => {
    rollM01ListingResolution();
    setM01VaultSealed(true);
    withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    beginBacktraceStory();
    seedM01Irc();
    seed(M01_INTRO);
};

export const onObjectivesStartM01 = (quest: M01Quest): void => {
    ensureM01ListingResolution();
    setM01VaultSealed(!quest.Data.chatConfirmed);
    openMissionSites("m01");
    refreshSiteStrings();

    const networkBuilt = register(M01_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M01_UNLOCKS, quest.Data),
    });

    registerReportTemplate(M01_REPORT_SPEC);

    bindM01Recon(quest);
    bindM01Breach(quest);
    bindM01Access(quest);
    bindM01Vault(quest);

    retraceFindings(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM01 = (): void => {
    setBacktraceMission("m1", "complete");
    teardown();
};
