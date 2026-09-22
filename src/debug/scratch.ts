import { Command, Localization, RegisterCommand, type CommandTools } from "@hotbunny/hackhub-content-sdk";

import { M01_I18N_KEY } from "../content/m01-i18n.js";
import { M01_TIP_SUBJECT } from "../content/m01.js";
import { trace } from "../helpers/logger.js";

@RegisterCommand({ default: true, scope: "both" })
export class ScratchLocCommand extends Command {
    CommandName = "scratchloc";
    Description = "scratch: diagnose why zh translations aren't showing";

    async Run(tools: CommandTools) {
        const lang = Localization.language();
        const liveT = Localization.t(M01_I18N_KEY.MAIL_TIP_SUBJECT);
        const moduleConst = M01_TIP_SUBJECT;

        trace("scratch", "language()", lang);
        trace("scratch", "live t(MAIL_TIP_SUBJECT)", liveT);
        trace("scratch", "module-level M01_TIP_SUBJECT", moduleConst);

        tools.println(`language: ${lang}`);
        tools.println(`live t(): ${liveT}`);
        tools.println(`module const: ${moduleConst}`);
    }
}
