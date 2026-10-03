import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { payReward } from "../../components/reward.js";
import { resetBreach } from "../../components/desktop-breach.js";
import { abandonStrike } from "../../components/intrusion.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M04_GATES, M04_STEP_ORDER, M04_UNLOCKS } from "../../content/m04/gates.js";
import { M04_INTRO } from "../../content/m04/intro.js";
import {
    M04_DEAD_DROP_EMAIL,
    M04_PREMATURE_MAIL_SLOT,
    M04_WARNING_SUBJECT,
    buildM04PrematureReply,
} from "../../content/m04/mail.js";
import {
    M04_OBJECTIVE_IDS,
    M04_REWARD_DESCRIPTION,
    M04_REWARD_MONEY,
    M04_SAVE_PREFIX,
    M04_SCOPE,
} from "../../content/m04/quest.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus, isQuestTesterFocus } from "../../guard/flags.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { advanceStep, firstUnmetStep, reachedUnlocks } from "../../middleware/gate.js";
import { bindM04Breach, cancelM04BreachJobs } from "./breach.js";
import { bindM04Control } from "./control.js";
import { bindM04Intrusion, cancelM04Strike, scheduleM04Strike } from "./intrusion.js";
import { bindM04Relay } from "./relay.js";
import { M04_REPORT_SPEC } from "./report.js";
import type { M04Quest } from "./types.js";
import { M04_WORLD } from "./world.js";

export { createM04Data } from "../../content/m04/state.js";
export { M04_QUEST } from "./spec.js";

bindWorld(M04_WORLD);

export const onStartM04 = (): void => {
    if (isQuestDevFocus("m04")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    abandonStrike(M04_SAVE_PREFIX);
    cancelM04Strike();
    cancelM04BreachJobs();
    resetBreach();
    setBacktraceMission("m4", "progress");
    seed(M04_INTRO);
};

const bindWarning = (quest: M04Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M04_DEAD_DROP_EMAIL || data.subject !== M04_WARNING_SUBJECT()) return;

        advanceStep(quest, M04_GATES, "warningRead", () => scheduleM04Strike(quest));
    });
};

const bindReport = (quest: M04Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M04_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M04_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M04_GATES, "reportSent", () =>
            quest.completeObjective(M04_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M04_PREMATURE_MAIL_SLOT, buildM04PrematureReply(firstUnmetStep(M04_STEP_ORDER, quest.Data)));
    });
};

export const onObjectivesStartM04 = (quest: M04Quest): void => {
    openMissionSites("m04");
    refreshSiteStrings();

    const networkBuilt = register(M04_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M04_UNLOCKS, quest.Data),
    });

    registerReportTemplate(M04_REPORT_SPEC);

    bindWarning(quest);
    bindM04Intrusion(quest);
    bindM04Breach(quest);
    bindM04Relay(quest);
    bindM04Control(quest);
    bindReport(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM04 = (): void => {
    closeMissionSites("m04");
    setBacktraceMission("m4", "complete");
    withdrawSlotMail(M04_PREMATURE_MAIL_SLOT);
    abandonStrike(M04_SAVE_PREFIX);
    payReward({
        scope: M04_SCOPE,
        amount: M04_REWARD_MONEY,
        description: M04_REWARD_DESCRIPTION,
        skip: isQuestDevFocus("m04") || isQuestTesterFocus("m04"),
    });
    unregister(M04_WORLD);
};
