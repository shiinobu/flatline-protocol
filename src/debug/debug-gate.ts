import {
    RegisterCommand,
    RegisterQuest,
    type RegisterCommandOptions,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";

type CommandRegistrar = ReturnType<typeof RegisterCommand>;

export const registerDebugQuest: typeof RegisterQuest = (target) =>
    isDebug ? RegisterQuest(target) : target;

export const registerDebugCommand =
    (options: RegisterCommandOptions): CommandRegistrar =>
    (target) =>
        isDebug ? RegisterCommand(options)(target) : target;
