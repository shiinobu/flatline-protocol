import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { payReward } from "../../components/reward.js";
import { abandonStrike } from "../../components/intrusion.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { clearRdcProfile, setRdcProfile } from "../../content/global/rdc.js";
import { clearSealedArtifacts, setSealedArtifacts } from "../../content/global/sealed.js";
import { M07_UNLOCKS } from "../../content/m07/gates.js";
import { M07_INTRO } from "../../content/m07/intro.js";
import { M07_PREMATURE_MAIL_SLOT } from "../../content/m07/mail.js";
import {
    M07_DUEL_ONE_PREFIX,
    M07_DUEL_TWO_PREFIX,
    M07_REWARD_DESCRIPTION,
    M07_REWARD_MONEY,
    M07_SCOPE,
} from "../../content/m07/quest.js";
import { M07_MISSION, buildM07RdcProfile } from "../../content/m07/rdc.js";
import { M07_SEALED_ARTIFACTS } from "../../content/m07/sealed.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import {
    clearM07Progress,
    setM07DashboardOpen,
    setM07PortalOpen,
    setM07ReservesOpen,
} from "../../context/m07/progress.js";
import { bindWorld, register, seed } from "../../core/index.js";
import { isQuestDevFocus, isQuestTesterFocus } from "../../guard/flags.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { M07_REPORT_SPEC } from "./report.js";
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
    setM07PortalOpen(quest.Data.tipReviewed);
    setM07DashboardOpen(quest.Data.edgeScanned);
    setM07ReservesOpen(quest.Data.ledgerTaken);

    const networkBuilt = register(M07_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M07_UNLOCKS, quest.Data),
    });

    setSealedArtifacts(M07_MISSION, M07_SEALED_ARTIFACTS);
    setRdcProfile(buildM07RdcProfile());
    registerReportTemplate(M07_REPORT_SPEC);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM07 = (): void => {
    closeMissionSites("m07");
    clearM07Progress();
    setBacktraceMission("m7", "complete");
    withdrawSlotMail(M07_PREMATURE_MAIL_SLOT);
    clearSealedArtifacts(M07_MISSION);
    clearRdcProfile(M07_MISSION);
    abandonStrike(M07_DUEL_ONE_PREFIX);
    abandonStrike(M07_DUEL_TWO_PREFIX);
    payReward({
        scope: M07_SCOPE,
        amount: M07_REWARD_MONEY,
        description: M07_REWARD_DESCRIPTION,
        skip: isQuestDevFocus("m07") || isQuestTesterFocus("m07"),
    });
};
