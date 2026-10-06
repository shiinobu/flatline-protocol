import {
    Command,
    RegisterCommand,
    SaveStorage,
    type CommandAutoComplete,
    type CommandTools,
    type RegisterCommandOptions,
} from "@hotbunny/hackhub-content-sdk";

import { isDev } from "../guard/flags.js";
import { BACKTRACE_KEYS, buildBacktraceFacts, isBacktraceKey } from "./backtrace-facts.js";
import { optionalBacktraceLogGroups } from "./backtrace-logs.js";
import {
    BACKTRACE_STORAGE_KEY,
    setBacktraceApplied,
    setBacktraceMission,
    setBacktraceOptionalLog,
    traceBacktraceKeyById,
    type BacktraceMissionId,
    type BacktraceMissionState,
    type BacktraceMissionStatus,
    type BacktraceState,
} from "./backtrace-state.js";

type CommandRegistrar = ReturnType<typeof RegisterCommand>;

const BACKTRACE_MISSION_IDS: readonly BacktraceMissionId[] = ["m1", "m2", "m3", "m4", "m5", "m6", "m7"];
const BACKTRACE_STATUSES: readonly BacktraceMissionStatus[] = ["locked", "progress", "complete"];
const MISSION_CHOICES = BACKTRACE_MISSION_IDS.join("|");

const registerDevCommand =
    (options: RegisterCommandOptions): CommandRegistrar =>
    (target) =>
        isDev ? RegisterCommand(options)(target) : target;

const isBacktraceMission = (value: string | undefined): value is BacktraceMissionId =>
    BACKTRACE_MISSION_IDS.some((id) => id === value);

const isBacktraceStatus = (value: string | undefined): value is BacktraceMissionStatus =>
    BACKTRACE_STATUSES.some((status) => status === value);

const readBacktraceMission = (mission: BacktraceMissionId): BacktraceMissionState =>
    SaveStorage.get<Partial<BacktraceState>>(BACKTRACE_STORAGE_KEY)?.[mission] ?? { status: "locked" };

const readBacktraceStatus = (mission: BacktraceMissionId): BacktraceMissionStatus =>
    readBacktraceMission(mission).status;

const nextBacktraceMission = (mission: BacktraceMissionId): BacktraceMissionId | undefined =>
    BACKTRACE_MISSION_IDS[BACKTRACE_MISSION_IDS.indexOf(mission) + 1];

const keysOf = (mission: BacktraceMissionId): readonly string[] => BACKTRACE_KEYS[mission];

const optionalLogStatus = (state: BacktraceMissionState, texts: readonly string[]): string => {
    if (texts.every((text) => state.logs?.includes(text) === true)) return "recorded";
    if (texts.every((text) => state.skipped?.logs.includes(text) === true)) return "skipped";
    return "pending";
};

@registerDevCommand({ default: true, scope: "both" })
export class BacktraceCommand extends Command {
    CommandName = "backtrace";
    Description = "dev: set, inspect or reset the BACKTRACE mission state, or trace a single clue";
    Autocomplete: CommandAutoComplete[] = [
        { label: "backtrace", type: "STRING" },
        { label: `<${MISSION_CHOICES}|applied|reset> <locked|progress|complete|keys|key|on|off>`, type: "STRING" },
    ];

    private listKeys(tools: CommandTools, mission: BacktraceMissionId): void {
        const traced = readBacktraceMission(mission).facts ?? {};
        for (const key of keysOf(mission)) {
            tools.println(`${traced[key] ? "[x]" : "[ ]"} ${key}`);
        }
    }

    private traceKey(tools: CommandTools, mission: BacktraceMissionId, key: string): void {
        if (!isBacktraceKey(mission, key)) {
            tools.printError(`"${key}" is not a key finding of ${mission}. Try: backtrace ${mission} keys`);
            return;
        }
        if (readBacktraceStatus(mission) === "complete") {
            tools.printWarning(`${mission} is already complete; its report already carries every fact.`);
            return;
        }
        const outcome = traceBacktraceKeyById(mission, key) ? "traced" : "already traced";
        const traced = readBacktraceMission(mission).facts ?? {};
        const tracedCount = keysOf(mission).filter((id) => traced[id] !== undefined).length;
        const progress = `${tracedCount}/${keysOf(mission).length}, ${readBacktraceStatus(mission)}`;
        tools.printSuccess(`${mission}.${key} = ${buildBacktraceFacts(mission)[key]} (${outcome}, ${progress})`);
    }

    async Run(tools: CommandTools) {
        const [first, second] = tools.getArgs();

        if (first === undefined) {
            tools.println(JSON.stringify(SaveStorage.get(BACKTRACE_STORAGE_KEY) ?? {}));
            return;
        }

        if (first === "reset") {
            SaveStorage.remove(BACKTRACE_STORAGE_KEY);
            tools.printSuccess("BACKTRACE state cleared.");
            return;
        }

        if (first === "applied") {
            const applied = second !== "off";
            setBacktraceApplied(applied);
            tools.printSuccess(`story applied -> ${applied}`);
            return;
        }

        if (isBacktraceMission(first) && second === "keys") {
            this.listKeys(tools, first);
            return;
        }

        if (isBacktraceMission(first) && second !== undefined && !isBacktraceStatus(second)) {
            this.traceKey(tools, first, second);
            return;
        }

        if (!isBacktraceMission(first) || !isBacktraceStatus(second)) {
            tools.printError(`Usage: backtrace [<${MISSION_CHOICES}> <locked|progress|complete|keys|key> | applied [on|off] | reset]`);
            return;
        }

        setBacktraceMission(first, second);
        tools.printSuccess(`${first} -> ${second}`);

        const next = second === "complete" ? nextBacktraceMission(first) : undefined;
        if (next === undefined || readBacktraceStatus(next) !== "locked") return;

        setBacktraceMission(next, "progress");
        tools.printInfo(`${next} -> progress (auto-start after ${first})`);
    }
}

@registerDevCommand({ default: true, scope: "both" })
export class BacktraceLogCommand extends Command {
    CommandName = "backtrace-log";
    Description = "dev: list, record or skip the optional BACKTRACE personal logs of a mission";
    Autocomplete: CommandAutoComplete[] = [
        { label: "backtrace-log", type: "STRING" },
        { label: `<${MISSION_CHOICES}> <number> [skip]`, type: "STRING" },
    ];

    private listLogs(tools: CommandTools, mission: BacktraceMissionId, groups: readonly (readonly string[])[]): void {
        const state = readBacktraceMission(mission);
        groups.forEach((texts, index) => {
            tools.println(`${index + 1}. [${optionalLogStatus(state, texts)}] ${texts[0] ?? ""}`);
        });
    }

    async Run(tools: CommandTools) {
        const [mission, number, status] = tools.getArgs();

        if (!isBacktraceMission(mission)) {
            tools.printError(`Usage: backtrace-log <${MISSION_CHOICES}> [<number> [skip]]`);
            return;
        }

        const groups = optionalBacktraceLogGroups(mission);
        if (groups.length === 0) {
            tools.printError(`${mission} has no optional logs.`);
            return;
        }

        if (number === undefined) {
            this.listLogs(tools, mission, groups);
            return;
        }

        const group = Number(number);
        if (!Number.isInteger(group) || group < 1 || group > groups.length) {
            tools.printError(`"${number}" is not an optional log of ${mission}. Try: backtrace-log ${mission}`);
            return;
        }

        if (status !== undefined && status !== "skip") {
            tools.printError(`"${status}" is not a log status. Use "skip", or leave it out to record the log.`);
            return;
        }

        const skip = status === "skip";
        if (!setBacktraceOptionalLog(mission, group, skip)) {
            tools.printError("The BACKTRACE state could not be updated.");
            return;
        }

        tools.printSuccess(`${mission} optional log ${group} -> ${skip ? "skipped" : "recorded"}`);
    }
}
