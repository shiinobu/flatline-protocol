import { setBacktraceMission } from "../../applications/backtrace-state.js";
import { withdrawMailFrom, withdrawSlotMail } from "../../components/mail.js";
import { registerReportTemplate } from "../../components/report.js";
import { FLATLINE_MAIL_SENDERS } from "../../content/global/mail-senders.js";
import { M02_UNLOCKS } from "../../content/m02/gates.js";
import { M02_INTRO } from "../../content/m02/intro.js";
import { M02_PREMATURE_MAIL_SLOT } from "../../content/m02/mail.js";
import { refreshSiteStrings } from "../../context/global/site-strings.js";
import { M02_WORLD } from "./world.js";
import { bindWorld, register, seed, unregister } from "../../core/index.js";
import { isQuestDevFocus } from "../../guard/flags.js";
import { reachedUnlocks } from "../../middleware/gate.js";
import { bindM02Devbox } from "./devbox.js";
import { bindM02Home } from "./home.js";
import { bindM02Recon } from "./recon.js";
import { M02_REPORT_SPEC } from "./report.js";
import type { M02Quest } from "./types.js";

export { createM02Data } from "../../content/m02/state.js";
export { M02_QUEST } from "./spec.js";

bindWorld(M02_WORLD);

export const onStartM02 = (): void => {
    if (isQuestDevFocus("m02")) withdrawMailFrom(FLATLINE_MAIL_SENDERS);
    setBacktraceMission("m2", "progress");
    seed(M02_INTRO);
};

export const onObjectivesStartM02 = (quest: M02Quest): void => {
    refreshSiteStrings();

    const networkBuilt = register(M02_WORLD, {
        networkBuilt: quest.Data.networkBuilt,
        unlocked: reachedUnlocks(M02_UNLOCKS, quest.Data),
    });

    registerReportTemplate(M02_REPORT_SPEC);

    bindM02Recon(quest);
    bindM02Devbox(quest);
    bindM02Home(quest);

    if (networkBuilt) quest.SetData("networkBuilt", true);
};

export const onCompleteM02 = (): void => {
    setBacktraceMission("m2", "complete");
    withdrawSlotMail(M02_PREMATURE_MAIL_SLOT);
    unregister(M02_WORLD);
};
