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
import {
    BACKTRACE_STORAGE_KEY,
    setBacktraceApplied,
    setBacktraceMission,
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

@registerDevCommand({ default: true, scope: "both" })
export class ScratchBacktraceCommand extends Command {
    CommandName = "scratchbt";
    Description = "scratch: set, inspect or reset the BACKTRACE mission state, or trace a single clue";
    Autocomplete: CommandAutoComplete[] = [
        { label: "scratchbt", type: "STRING" },
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
            tools.printError(`"${key}" is not a key finding of ${mission}. Try: scratchbt ${mission} keys`);
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
            tools.printError(`Usage: scratchbt [<${MISSION_CHOICES}> <locked|progress|complete|keys|key> | applied [on|off] | reset]`);
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
