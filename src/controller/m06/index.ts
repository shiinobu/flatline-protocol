import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { payReward } from "../../components/reward.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M06_UNLOCKS } from "../../content/m06/gates.js";
import { M06_INTRO } from "../../content/m06/intro.js";
import { M06_PREMATURE_MAIL_SLOT } from "../../content/m06/mail.js";
import { M06_REWARD_DESCRIPTION, M06_REWARD_MONEY } from "../../content/m06/quest.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus, isQuestTesterFocus } from "../../guard/flags.js";
import { trace } from "../../helpers/logger.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { bindM06Recon } from "./recon.js";
import { M06_REPORT_SPEC } from "./report.js";
import type { M06Quest } from "./types.js";
import { M06_WORLD } from "./world.js";

export { createM06Data } from "../../content/m06/state.js";
export { M06_QUEST } from "./spec.js";

bindWorld(M06_WORLD);

export const onStartM06 = (): void => {
    if (isQuestDevFocus("m06")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    setBacktraceMission("m6", "progress");
    seed(M06_INTRO);
};

export const onObjectivesStartM06 = (quest: M06Quest): void => {
    openMissionSites("m06");
    refreshSiteStrings();

    const networkBuilt = register(M06_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M06_UNLOCKS, quest.Data),
    });
    trace("M06", `probe:zero-network register built=${networkBuilt}`);

    registerReportTemplate(M06_REPORT_SPEC);
    bindM06Recon(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM06 = (): void => {
    closeMissionSites("m06");
    setBacktraceMission("m6", "complete");
    withdrawSlotMail(M06_PREMATURE_MAIL_SLOT);
    payReward({
        scope: "M06",
        amount: M06_REWARD_MONEY,
        description: M06_REWARD_DESCRIPTION,
        skip: isQuestDevFocus("m06") || isQuestTesterFocus("m06"),
    });
    unregister(M06_WORLD);
};
