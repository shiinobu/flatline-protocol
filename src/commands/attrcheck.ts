import {
    Command,
    Events,
    Files,
    RegisterCommand,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import { M04_IDENTITY_FILE_EXTENSION, M04_IDENTITY_FILE_NAME } from "../content/m04.js";

export const ATTRCHECK_REVEALED_EVENT = "flatline.m04.attrcheckRevealed";

@RegisterCommand({ default: true, scope: "both" })
export class AttrCheckCommand extends Command {
    CommandName = "attrcheck";
    Description = "Inspect a file's hidden attributes before touching it";
    Autocomplete: CommandAutoComplete[] = [
        { label: "attrcheck", type: "STRING" },
        { label: "<path>", type: "FILE" },
    ];

    async Run(tools: CommandTools) {
        const args = tools.getArgs();
        if (args.length === 0) {
            tools.printError("Usage: attrcheck <path>");
            return;
        }

        const target = args[0];
        const file = await Files.getByPath(target);
        if (!file) {
            tools.printError(`No such file: ${target}`);
            return;
        }

        if (file.name === M04_IDENTITY_FILE_NAME && file.extension === M04_IDENTITY_FILE_EXTENSION) {
            tools.printWarning("Suspicious attribute found: SELF_DESTRUCT_ON_READ");
            tools.println("Do not open this file directly. Extract it as-is instead.");
            Events.emit(ATTRCHECK_REVEALED_EVENT, { id: file.id, name: file.name });
            return;
        }

        tools.printSuccess("No suspicious attributes found.");
    }
}
