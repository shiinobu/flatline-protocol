import {
    Command,
    Events,
    Files,
    RegisterCommand,
    type CommandAutoComplete,
    type CommandTools,
    type FileInfo,
} from "@hotbunny/hackhub-content-sdk";

import { findMeterpreterFile } from "./meterpreter-files.js";

export const OPEN_FILE_READ_EVENT = "flatline.open.fileRead";

const findFile = async (target: string): Promise<FileInfo | null> => {
    if (Files.isRemoteSession()) return Files.getByPath(target);

    return (await findMeterpreterFile(target)) ?? Files.getByPath(target);
};

@RegisterCommand({ default: true, scope: "both" })
export class OpenCommand extends Command {
    CommandName = "open";
    Description = "Read a file's content, regardless of extension";
    Autocomplete: CommandAutoComplete[] = [
        { label: "open", type: "STRING" },
        { label: "<path>", type: "FILE" },
    ];

    async Run(tools: CommandTools) {
        const args = tools.getArgs();
        if (args.length === 0) {
            tools.printError("Usage: open <path>");
            return;
        }

        const target = args[0];
        const file = await findFile(target);
        if (!file) {
            tools.printError(`No such file: ${target}`);
            return;
        }
        if (file.isFolder) {
            tools.printError(`${target} is a folder.`);
            return;
        }

        const content = Files.read(file.id);
        if (content === undefined) {
            tools.printError(`Could not read: ${target}`);
            return;
        }

        const label = file.extension ? `${file.name}.${file.extension}` : file.name;
        tools.println([{ text: label, color: "cyan", bold: true }]);
        printLines(tools, content);
        Events.emit(OPEN_FILE_READ_EVENT, { id: file.id, name: file.name, extension: file.extension });
    }
}

const keepIndent = (line: string): string => line.replace(/^ +/, (spaces) => "\u00a0".repeat(spaces.length));

const printLines = (tools: CommandTools, content: string): void => {
    for (const line of content.split(/\r?\n/)) {
        if (line === "") tools.newLine();
        else tools.println(keepIndent(line));
    }
};
