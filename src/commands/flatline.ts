import {
    Command,
    Events,
    Localization,
    RegisterCommand,
    UI,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import { playFlatline } from "../components/flatline-sequence.js";
import { currentRepellableStrike, currentStrike, repelStrike, repelTargetFor } from "../components/intrusion.js";
import { KIT_I18N_KEY } from "../i18n/global/kit.js";

export const INTRUSION_REPELLED_EVENT = "flatline.intrusion.repelled";

export interface IntrusionRepelledPayload {
    readonly prefix: string;
    readonly strikeId: string;
    readonly ip: string;
}

const cutHost = async (tools: CommandTools, payload: IntrusionRepelledPayload): Promise<void> => {
    try {
        await playFlatline(tools, payload.ip);
        tools.printSuccess(Localization.t(KIT_I18N_KEY.REPEL_SEVERED, { ip: payload.ip }));
    } finally {
        Events.emit(INTRUSION_REPELLED_EVENT, payload);
    }
};

@RegisterCommand({ default: true, scope: "both" })
export class FlatlineCommand extends Command {
    CommandName = "flatline";
    Description = "Cut off a host by flatlining its beacon";
    Autocomplete: CommandAutoComplete[] = [
        { label: "flatline", type: "STRING" },
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
            await cutHost(tools, { prefix: strike.prefix, strikeId: strike.strikeId, ip });
            UI.toast(Localization.t(KIT_I18N_KEY.REPEL_TOAST), "success");
            return;
        }

        const target = repelTargetFor(ip);
        if (target !== null) {
            const refusal = target.refusalKey?.() ?? null;
            if (refusal !== null) {
                tools.printError(Localization.t(refusal));
                return;
            }

            await cutHost(tools, { prefix: target.prefix, strikeId: target.strikeId, ip });
            return;
        }

        const uncuttable = currentStrike();
        if (uncuttable !== null && !uncuttable.repellable && uncuttable.noticeKey !== undefined) {
            tools.printError(Localization.t(uncuttable.noticeKey));
            return;
        }

        if (strike !== null) {
            tools.printError(Localization.t(KIT_I18N_KEY.REPEL_WRONG, { ip }));
            return;
        }

        tools.printWarning(Localization.t(KIT_I18N_KEY.REPEL_NONE));
    }
}
