import { backtraceMissionStatus, setBacktraceMission } from "../../applications/backtrace-state.js";
import { sendReplacingMail, withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { isReportSubmission, registerReportTemplate } from "../../components/report.js";
import { payReward } from "../../components/reward.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M06_GATES, M06_STEP_ORDER, M06_UNLOCKS } from "../../content/m06/gates.js";
import { M06_INTRO } from "../../content/m06/intro.js";
import {
    M06_DEAD_DROP_EMAIL,
    M06_PREMATURE_MAIL_SLOT,
    buildM06PrematureReply,
} from "../../content/m06/mail.js";
import {
    M06_OBJECTIVE_IDS,
    M06_REWARD_DESCRIPTION,
    M06_REWARD_MONEY,
} from "../../content/m06/quest.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import {
    M06_STAGE,
    clearM06Progress,
    resetM06Stage,
    setM06ShellStruckOff,
    setM06Stage,
} from "../../context/m06/progress.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus, isQuestTesterFocus } from "../../guard/flags.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep, firstUnmetStep, reachedUnlocks } from "../../middleware/gate.js";
import type { M06QuestData } from "../../content/m06/state.js";
import { bindM06Pages } from "./pages.js";
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

export const stageForM06 = (data: M06QuestData): number => {
    if (data.insurerLinked && data.infraLinked) return M06_STAGE.identity;
    if (data.snapshotsCompared) return M06_STAGE.ownership;
    if (data.hiddenFilingsFound) return M06_STAGE.filings;
    if (data.agentIdentified) return M06_STAGE.archive;
    if (data.registryReached || data.tipReviewed) return M06_STAGE.register;

    return M06_STAGE.closed;
};

const syncStage = (quest: M06Quest): void => {
    const stage = stageForM06(quest.Data);
    setM06Stage(stage);
    trace("M06", `probe:stage=${stage}`);
};

const mirrorConsequences = (): void => {
    const struckOff = backtraceMissionStatus("m3") === "complete";
    setM06ShellStruckOff(struckOff);
    trace("M06", `probe:m3-consequence struckOff=${struckOff}`);
};

const bindStageSync = (quest: M06Quest): void => {
    quest.Events.on("Mail.Read", () => syncStage(quest));
    quest.Events.on("Browser.Meta", () => syncStage(quest));
    quest.Events.on("Terminal.Whois", () => syncStage(quest));
};

const bindReport = (quest: M06Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M06_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M06_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M06_GATES, "reportSent", () =>
            quest.completeObjective(M06_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M06_PREMATURE_MAIL_SLOT, buildM06PrematureReply(firstUnmetStep(M06_STEP_ORDER, quest.Data)));
    });
};

export const onObjectivesStartM06 = (quest: M06Quest): void => {
    openMissionSites("m06");
    refreshSiteStrings();
    mirrorConsequences();
    resetM06Stage(stageForM06(quest.Data));

    const networkBuilt = register(M06_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M06_UNLOCKS, quest.Data),
    });
    trace("M06", `probe:zero-network register built=${networkBuilt}`);

    registerReportTemplate(M06_REPORT_SPEC);
    bindM06Recon(quest);
    bindM06Pages(quest);
    bindStageSync(quest);
    bindReport(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM06 = (): void => {
    closeMissionSites("m06");
    setBacktraceMission("m6", "complete");
    withdrawSlotMail(M06_PREMATURE_MAIL_SLOT);
    clearM06Progress();
    payReward({
        scope: "M06",
        amount: M06_REWARD_MONEY,
        description: M06_REWARD_DESCRIPTION,
        skip: isQuestDevFocus("m06") || isQuestTesterFocus("m06"),
    });
    unregister(M06_WORLD);
};
