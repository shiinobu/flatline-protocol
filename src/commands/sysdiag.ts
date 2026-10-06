import {
    Command,
    Files,
    Localization,
    RegisterCommand,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import { inspectRecovery, printDiagnosis } from "../components/desktop-breach.js";
import { KIT_I18N_KEY, kitBreachText } from "../i18n/global/kit.js";

@RegisterCommand({ default: true, scope: "local" })
export class SysDiagCommand extends Command {
    CommandName = "sysdiag";
    Description = "Check the desktop session after a compromise";
    Autocomplete: CommandAutoComplete[] = [{ label: "sysdiag", type: "STRING" }];

    async Run(tools: CommandTools) {
        const text = kitBreachText();

        if (Files.isRemoteSession()) {
            tools.printError(Localization.t(KIT_I18N_KEY.BREACH_REMOTE_ONLY, { command: "sysdiag" }));
            return;
        }

        const inspection = await inspectRecovery();
        if (inspection === null) {
            tools.printSuccess(text.diagHealthy);
            return;
        }

        printDiagnosis(tools, text, inspection);
    }
}
