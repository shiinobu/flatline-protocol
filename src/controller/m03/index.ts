import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M03_UNLOCKS } from "../../content/m03/gates.js";
import { M03_INTRO } from "../../content/m03/intro.js";
import { M03_PREMATURE_MAIL_SLOT } from "../../content/m03/mail.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { M03_WORLD } from "./world.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus } from "../../guard/flags.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { bindM03Gateway } from "./gateway.js";
import { bindM03Pivot } from "./pivot.js";
import { bindM03Recon } from "./recon.js";
import { M03_REPORT_SPEC } from "./report.js";
import type { M03Quest } from "./types.js";

export { createM03Data } from "../../content/m03/state.js";
export { M03_QUEST } from "./spec.js";

bindWorld(M03_WORLD);

export const onStartM03 = (): void => {
    if (isQuestDevFocus("m03")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    setBacktraceMission("m3", "progress");
    seed(M03_INTRO);
};

export const onObjectivesStartM03 = (quest: M03Quest): void => {
    openMissionSites("m03");
    refreshSiteStrings();

    const networkBuilt = register(M03_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M03_UNLOCKS, quest.Data),
        restore: quest.Data.forwards,
    });

    registerReportTemplate(M03_REPORT_SPEC);

    bindM03Recon(quest);
    bindM03Pivot(quest);
    bindM03Gateway(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM03 = (): void => {
    closeMissionSites("m03");
    setBacktraceMission("m3", "complete");
    withdrawSlotMail(M03_PREMATURE_MAIL_SLOT);
    unregister(M03_WORLD);
};
