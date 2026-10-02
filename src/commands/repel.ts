import {
    Command,
    Events,
    Localization,
    RegisterCommand,
    UI,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import { currentRepellableStrike, repelStrike, repelTargetFor } from "../components/intrusion.js";
import { KIT_I18N_KEY } from "../i18n/global/kit.js";

export const INTRUSION_REPELLED_EVENT = "flatline.intrusion.repelled";

export interface IntrusionRepelledPayload {
    readonly prefix: string;
    readonly strikeId: string;
    readonly ip: string;
}

@RegisterCommand({ default: true, scope: "both" })
export class RepelCommand extends Command {
    CommandName = "repel";
    Description = "Cut off a host that is pushing into your own machine";
    Autocomplete: CommandAutoComplete[] = [
        { label: "repel", type: "STRING" },
        { label: "<ip>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const [ip] = tools.getArgs();
        if (!ip) {
            tools.printError(Localization.t(KIT_I18N_KEY.REPEL_USAGE));
            return;
        }

        const strike = currentRepellableStrike();
        if (strike !== null && strike.ip === ip) {
            repelStrike(strike.prefix);
            tools.printSuccess(Localization.t(KIT_I18N_KEY.REPEL_SEVERED, { ip }));
            UI.toast(Localization.t(KIT_I18N_KEY.REPEL_TOAST), "success");
            Events.emit(INTRUSION_REPELLED_EVENT, { prefix: strike.prefix, strikeId: strike.strikeId, ip });
            return;
        }

        const target = repelTargetFor(ip);
        if (target !== null) {
            tools.printSuccess(Localization.t(KIT_I18N_KEY.REPEL_SEVERED, { ip }));
            Events.emit(INTRUSION_REPELLED_EVENT, { prefix: target.prefix, strikeId: target.strikeId, ip });
            return;
        }

        if (strike !== null) {
            tools.printError(Localization.t(KIT_I18N_KEY.REPEL_WRONG, { ip }));
            return;
        }

        tools.printWarning(Localization.t(KIT_I18N_KEY.REPEL_NONE));
    }
}
