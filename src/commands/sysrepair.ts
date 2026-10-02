import {
    Command,
    Files,
    Localization,
    RegisterCommand,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import {
    inspectRecovery,
    isRepairable,
    restoreDesktop,
} from "../components/desktop-breach.js";
import { KIT_I18N_KEY, kitBreachText } from "../i18n/global/kit.js";

@RegisterCommand({ default: true, scope: "local" })
export class SysRepairCommand extends Command {
    CommandName = "sysrepair";
    Description = "Rebuild the desktop session once its components are verified";
    Autocomplete: CommandAutoComplete[] = [
        { label: "sysrepair", type: "STRING" },
        { label: "--rebuild", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const text = kitBreachText();

        if (Files.isRemoteSession()) {
            tools.printError(Localization.t(KIT_I18N_KEY.BREACH_REMOTE_ONLY, { command: "sysrepair" }));
            return;
        }

        const inspection = await inspectRecovery();
        if (inspection === null) {
            tools.printWarning(text.repairHealthy);
            return;
        }

        if (!tools.getArgs().includes("--rebuild")) {
            tools.printError(text.repairUsage);
            return;
        }

        if (!isRepairable(inspection)) {
            tools.printError(text.repairRefused);
            return;
        }

        restoreDesktop(text);
        tools.printSuccess(text.repairDone);
    }
}
