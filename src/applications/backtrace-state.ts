import { SaveStorage, Time, UI } from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";
import { buildBacktraceFacts } from "./backtrace-facts.js";

export const BACKTRACE_STORAGE_KEY = "backtrace";

export type BacktraceMissionId = "m1" | "m2" | "m3" | "m4";
export type BacktraceMissionStatus = "locked" | "progress" | "complete";
export type BacktraceFacts = Readonly<Record<string, string>>;

export interface BacktraceMissionState {
    readonly status: BacktraceMissionStatus;
    readonly completedAt?: number;
    readonly facts?: BacktraceFacts;
    readonly logs?: readonly string[];
}

export type BacktraceState = Readonly<Record<BacktraceMissionId, BacktraceMissionState>>;

const INITIAL_STATE: BacktraceState = {
    m1: { status: "locked" },
    m2: { status: "locked" },
    m3: { status: "locked" },
    m4: { status: "locked" },
};

const describeError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const readBacktraceState = (): BacktraceState => ({
    ...INITIAL_STATE,
    ...SaveStorage.get<Partial<BacktraceState>>(BACKTRACE_STORAGE_KEY),
});

const writeBacktraceMission = (mission: BacktraceMissionId, missionState: BacktraceMissionState): void =>
    SaveStorage.set(BACKTRACE_STORAGE_KEY, { ...readBacktraceState(), [mission]: missionState });

const collectFacts = (mission: BacktraceMissionId): BacktraceFacts | undefined => {
    try {
        return buildBacktraceFacts(mission);
    } catch (error: unknown) {
        trace("Backtrace", `${mission} facts unavailable`, describeError(error));
        return undefined;
    }
};

const buildMissionState = (
    mission: BacktraceMissionId,
    status: BacktraceMissionStatus,
    current: BacktraceMissionState,
): BacktraceMissionState =>
    status === "complete"
        ? { status, completedAt: Time.now(), facts: collectFacts(mission), logs: current.logs }
        : { status };

const applyMission = (mission: BacktraceMissionId, status: BacktraceMissionStatus): void => {
    const current = readBacktraceState()[mission];
    const missionState = buildMissionState(mission, status, current);
    writeBacktraceMission(mission, missionState);
    trace("Backtrace", `${mission} -> ${status}`);
    if (missionState.facts) trace("Backtrace", `${mission} facts`, JSON.stringify(missionState.facts));
};

const applyTrace = (mission: BacktraceMissionId, keys: readonly string[]): readonly string[] => {
    const current = readBacktraceState()[mission];
    if (current.status === "complete") return [];

    const canon = collectFacts(mission) ?? {};
    const known = current.facts ?? {};
    const fresh = keys.filter((key) => canon[key] !== undefined && known[key] !== canon[key]);
    if (fresh.length === 0) return [];

    const status: BacktraceMissionStatus = current.status === "locked" ? "progress" : current.status;
    const facts = { ...known, ...Object.fromEntries(fresh.map((key) => [key, canon[key]])) };
    writeBacktraceMission(mission, { ...current, status, facts });
    trace("Backtrace", `${mission} traced ${fresh.join(", ")}`);
    return fresh;
};

export const getBacktraceFact = (mission: BacktraceMissionId, key: string): string | undefined =>
    readBacktraceState()[mission].facts?.[key];

export const getBacktraceStatus = (mission: BacktraceMissionId): BacktraceMissionStatus =>
    readBacktraceState()[mission].status;

export const setBacktraceMission = (mission: BacktraceMissionId, status: BacktraceMissionStatus): void => {
    try {
        applyMission(mission, status);
    } catch (error: unknown) {
        trace("Backtrace", `${mission} -> ${status} failed`, describeError(error));
    }
};

export const traceBacktraceFacts = (mission: BacktraceMissionId, keys: readonly string[]): readonly string[] => {
    try {
        return applyTrace(mission, keys);
    } catch (error: unknown) {
        trace("Backtrace", `${mission} trace ${keys.join(", ")} failed`, describeError(error));
        return [];
    }
};

const appendLogs = (mission: BacktraceMissionId, texts: readonly string[]): readonly string[] => {
    const current = readBacktraceState()[mission];
    if (current.status === "complete") return [];

    const logs = current.logs ?? [];
    const fresh = texts.filter((text) => !logs.includes(text));
    if (fresh.length === 0) return [];

    const status: BacktraceMissionStatus = current.status === "locked" ? "progress" : current.status;
    writeBacktraceMission(mission, { ...current, status, logs: [...logs, ...fresh] });
    trace("Backtrace", `${mission} logged`, fresh.join(" | "));
    UI.toast(`BACKTRACE: ${fresh.length} new personal log ${fresh.length === 1 ? "entry" : "entries"} recorded.`, "info");
    return fresh;
};

export const appendBacktraceLogs = (mission: BacktraceMissionId, texts: readonly string[]): readonly string[] => {
    try {
        return appendLogs(mission, texts);
    } catch (error: unknown) {
        trace("Backtrace", `${mission} log failed`, describeError(error));
        return [];
    }
};
