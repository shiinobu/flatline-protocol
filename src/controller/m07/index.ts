import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M07_UNLOCKS } from "../../content/m07/gates.js";
import { M07_INTRO } from "../../content/m07/intro.js";
import { M07_PREMATURE_MAIL_SLOT } from "../../content/m07/mail.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus } from "../../guard/flags.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { bindM07DeadBox } from "./deadbox.js";
import { bindM07Extract } from "./extract.js";
import { bindM07Firewall } from "./firewall.js";
import { bindM07Probes } from "./probes.js";
import { bindM07Recon } from "./recon.js";
import { M07_REPORT_SPEC } from "./report.js";
import { bindM07Shell } from "./shell.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

export { createM07Data } from "../../content/m07/state.js";
export { M07_QUEST } from "./spec.js";

bindWorld(M07_WORLD);

export const onStartM07 = (): void => {
    if (isQuestDevFocus("m07")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    setBacktraceMission("m7", "progress");
    seed(M07_INTRO);
};

export const onObjectivesStartM07 = (quest: M07Quest): void => {
    openMissionSites("m07");
    refreshSiteStrings();

    const networkBuilt = register(M07_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M07_UNLOCKS, quest.Data),
    });

    registerReportTemplate(M07_REPORT_SPEC);

    bindM07Recon(quest);
    bindM07DeadBox(quest);
    bindM07Firewall(quest);
    bindM07Shell(quest);
    bindM07Extract(quest);
    bindM07Probes(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM07 = (): void => {
    closeMissionSites("m07");
    setBacktraceMission("m7", "complete");
    withdrawSlotMail(M07_PREMATURE_MAIL_SLOT);
    unregister(M07_WORLD);
};
