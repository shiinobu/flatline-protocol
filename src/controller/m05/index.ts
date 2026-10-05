import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { sendReplacingMail, withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { isReportSubmission, registerReportTemplate } from "../../components/report.js";
import { payReward } from "../../components/reward.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { clearRdcProfile, setRdcProfile } from "../../content/global/rdc.js";
import { clearSealedArtifacts, setSealedArtifacts } from "../../content/global/sealed.js";
import { M05_GATES, M05_STEP_ORDER, M05_UNLOCKS } from "../../content/m05/gates.js";
import { M05_INTRO } from "../../content/m05/intro.js";
import { M05_DEAD_DROP_EMAIL, M05_PREMATURE_MAIL_SLOT, buildM05PrematureReply } from "../../content/m05/mail.js";
import { M05_PORTAL_LOGIN_USER, M05_PORTAL_MIN_STEPS } from "../../content/m05/portal.js";
import { M05_OBJECTIVE_IDS, M05_REWARD_DESCRIPTION, M05_REWARD_MONEY } from "../../content/m05/quest.js";
import { buildM05RdcProfile } from "../../content/m05/rdc.js";
import { M05_SEALED_ARTIFACTS } from "../../content/m05/sealed.js";
import type { M05QuestData } from "../../content/m05/state.js";
import { closeMissionSites, openMissionSites } from "../../context/global/site-access.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import {
    clearM05Progress,
    setM05ArchiveOpen,
    setM05PortalMin,
    setM05PortalUser,
    setM05RdcState,
    setM05TeamOpen,
} from "../../context/m05/progress.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus, isQuestTesterFocus } from "../../guard/flags.js";
import { advanceStep, firstUnmetStep, reachedUnlocks } from "../../middleware/gate.js";
import { bindM05Access } from "./access.js";
import { bindM05Cipher } from "./cipher.js";
import { bindM05Portal } from "./portal.js";
import { bindM05Rdc } from "./rdc.js";
import { bindM05Recon } from "./recon.js";
import { M05_REPORT_SPEC } from "./report.js";
import type { M05Quest } from "./types.js";
import { M05_WORLD } from "./world.js";

export { createM05Data } from "../../content/m05/state.js";
export { M05_QUEST } from "./spec.js";

bindWorld(M05_WORLD);

export const onStartM05 = (): void => {
    if (isQuestDevFocus("m05")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    setBacktraceMission("m5", "progress");
    seed(M05_INTRO);
};

const portalMinOf = (data: M05QuestData): number => {
    const flags: Readonly<Record<string, keyof M05QuestData>> = {
        foothold: "footholdFlagged",
        separation: "separationFound",
        controls: "controlsFound",
        hold: "holdFound",
        systems: "systemsOpened",
    };
    return M05_PORTAL_MIN_STEPS.filter((kind) => data[flags[kind]]).length;
};

const restoreMirrors = (data: M05QuestData): void => {
    setM05TeamOpen(data.vaultRevisited);
    setM05ArchiveOpen(data.changeRecordRead);
    setM05PortalUser(data.portalLoggedIn ? M05_PORTAL_LOGIN_USER : "");
    setM05PortalMin(portalMinOf(data));
    setM05RdcState({
        loggedIn: data.rdcLoggedIn,
        attached: data.displayAttached,
        docs: [data.statementRead ? 1 : 0, data.memoRead ? 2 : 0, data.ticketRead ? 3 : 0].filter((n) => n > 0),
    });
};

const bindReport = (quest: M05Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M05_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M05_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M05_GATES, "reportSent", () =>
            quest.completeObjective(M05_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M05_PREMATURE_MAIL_SLOT, buildM05PrematureReply(firstUnmetStep(M05_STEP_ORDER, quest.Data)));
    });
};

export const onObjectivesStartM05 = (quest: M05Quest): void => {
    openMissionSites("m05");
    refreshSiteStrings();
    setSealedArtifacts("m05", M05_SEALED_ARTIFACTS);
    setRdcProfile(buildM05RdcProfile());
    restoreMirrors(quest.Data);

    const networkBuilt = register(M05_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M05_UNLOCKS, quest.Data),
    });

    registerReportTemplate(M05_REPORT_SPEC);

    bindM05Recon(quest);
    bindM05Portal(quest);
    bindM05Cipher(quest);
    bindM05Rdc(quest);
    bindM05Access(quest);
    bindReport(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM05 = (): void => {
    closeMissionSites("m05");
    setBacktraceMission("m5", "complete");
    withdrawSlotMail(M05_PREMATURE_MAIL_SLOT);
    clearM05Progress();
    clearSealedArtifacts("m05");
    clearRdcProfile("m05");
    payReward({
        scope: "M05",
        amount: M05_REWARD_MONEY,
        description: M05_REWARD_DESCRIPTION,
        skip: isQuestDevFocus("m05") || isQuestTesterFocus("m05"),
    });
    unregister(M05_WORLD);
};
