import { SaveStorage, Time } from "@hotbunny/hackhub-content-sdk";

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
}

export type BacktraceState = Readonly<Record<BacktraceMissionId, BacktraceMissionState>>;

const INITIAL_STATE: BacktraceState = {
    m1: { status: "locked" },
    m2: { status: "locked" },
    m3: { status: "locked" },
    m4: { status: "locked" },
};

const readBacktraceState = (): BacktraceState => ({
    ...INITIAL_STATE,
    ...SaveStorage.get<Partial<BacktraceState>>(BACKTRACE_STORAGE_KEY),
});

const collectFacts = (mission: BacktraceMissionId): BacktraceFacts | undefined => {
    try {
        return buildBacktraceFacts(mission);
    } catch (error: unknown) {
        trace("Backtrace", `${mission} facts unavailable`, error instanceof Error ? error.message : String(error));
        return undefined;
    }
};

const buildMissionState = (mission: BacktraceMissionId, status: BacktraceMissionStatus): BacktraceMissionState =>
    status === "complete"
        ? { status, completedAt: Time.now(), facts: collectFacts(mission) }
        : { status };

export const setBacktraceMission = (mission: BacktraceMissionId, status: BacktraceMissionStatus): void => {
    const missionState = buildMissionState(mission, status);
    SaveStorage.set(BACKTRACE_STORAGE_KEY, { ...readBacktraceState(), [mission]: missionState });
    trace("Backtrace", `${mission} -> ${status}`);
    if (missionState.facts) trace("Backtrace", `${mission} facts`, JSON.stringify(missionState.facts));
};
