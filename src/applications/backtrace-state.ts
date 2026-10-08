import { SaveStorage, UI } from "@hotbunny/hackhub-content-sdk";

import { buildBacktraceFacts, buildBacktraceSkipped, isBacktraceKey, type BacktraceKey } from "./backtrace-facts.js";
import {
    fillBacktraceLogs,
    sourcesOfBacktraceLogs,
} from "./backtrace-logs.js";

export const BACKTRACE_STORAGE_KEY = "backtrace";

export type BacktraceMissionId = "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "m7";
export type BacktraceMissionStatus = "locked" | "progress" | "complete";
export type BacktraceFacts = Readonly<Record<string, string>>;

export interface BacktraceSkipped {
    readonly keys: readonly string[];
    readonly logs: readonly string[];
}

export interface BacktraceMissionState {
    readonly status: BacktraceMissionStatus;
    readonly facts?: BacktraceFacts;
    readonly logs?: readonly string[];
    readonly moments?: readonly string[];
    readonly skipped?: BacktraceSkipped;
    readonly sources?: Readonly<Record<string, string>>;
}

export interface BacktraceStoryState {
    readonly applied: boolean;
}

export type BacktraceState = Readonly<Record<BacktraceMissionId, BacktraceMissionState>> & {
    readonly story?: BacktraceStoryState;
};

const INITIAL_STATE: BacktraceState = {
    m1: { status: "locked" },
    m2: { status: "locked" },
    m3: { status: "locked" },
    m4: { status: "locked" },
    m5: { status: "locked" },
    m6: { status: "locked" },
    m7: { status: "locked" },
};

const readBacktraceState = (): BacktraceState => ({
    ...INITIAL_STATE,
    ...SaveStorage.get<Partial<BacktraceState>>(BACKTRACE_STORAGE_KEY),
});

const writeBacktraceMission = (mission: BacktraceMissionId, missionState: BacktraceMissionState): void =>
    SaveStorage.set(BACKTRACE_STORAGE_KEY, { ...readBacktraceState(), [mission]: missionState });

const collectFacts = (mission: BacktraceMissionId): BacktraceFacts | undefined => {
    try {
        return buildBacktraceFacts(mission);
    } catch {
        return undefined;
    }
};

const buildMissionState = (
    mission: BacktraceMissionId,
    status: BacktraceMissionStatus,
    current: BacktraceMissionState,
): BacktraceMissionState => {
    if (status !== "complete") return { status };

    const filled = fillBacktraceLogs(mission, current.logs ?? [], current.moments);
    const skipped =
        current.status === "complete"
            ? current.skipped
            : buildBacktraceSkipped(mission, current.facts ?? {}, current.logs ?? []);

    return {
        status,
        facts: collectFacts(mission),
        logs: filled.logs,
        moments: filled.moments,
        skipped,
        sources: sourcesOfBacktraceLogs(mission, [...filled.logs, ...(skipped?.logs ?? [])]),
    };
};

const applyMission = (mission: BacktraceMissionId, status: BacktraceMissionStatus): void => {
    const current = readBacktraceState()[mission];
    const missionState = buildMissionState(mission, status, current);
    writeBacktraceMission(mission, missionState);
};

const applyFinding = (mission: BacktraceMissionId, key: string): boolean => {
    if (!isBacktraceKey(mission, key)) return false;

    const current = readBacktraceState()[mission];
    if (current.status === "complete") return false;

    const value = (collectFacts(mission) ?? {})[key];
    const known = current.facts ?? {};
    if (value === undefined || known[key] === value) return false;

    const status: BacktraceMissionStatus = current.status === "locked" ? "progress" : current.status;
    writeBacktraceMission(mission, { ...current, status, facts: { ...known, [key]: value } });
    return true;
};

export const backtraceMissionStatus = (mission: BacktraceMissionId): BacktraceMissionStatus => {
    try {
        return readBacktraceState()[mission].status;
    } catch {
        return "locked";
    }
};

export const setBacktraceMission = (mission: BacktraceMissionId, status: BacktraceMissionStatus): void => {
    try {
        applyMission(mission, status);
    } catch {
        return;
    }
};

export const beginBacktraceStory = (): void => {
    try {
        SaveStorage.set(BACKTRACE_STORAGE_KEY, {
            ...INITIAL_STATE,
            m1: { status: "progress" },
            story: { applied: true },
        });
    } catch {
        return;
    }
};

export const traceBacktraceKeyById = (mission: BacktraceMissionId, key: string): boolean => {
    try {
        return applyFinding(mission, key);
    } catch {
        return false;
    }
};

export interface BacktraceLogOptions {
    readonly moment?: boolean;
}

const appendLogs = (mission: BacktraceMissionId, texts: readonly string[], moment: boolean): readonly string[] => {
    const current = readBacktraceState()[mission];
    if (current.status === "complete") return [];

    const logs = current.logs ?? [];
    const fresh = texts.filter((text) => !logs.includes(text));
    if (fresh.length === 0) return [];

    const status: BacktraceMissionStatus = current.status === "locked" ? "progress" : current.status;
    const moments = moment ? [...(current.moments ?? []), ...fresh] : current.moments;
    writeBacktraceMission(mission, { ...current, status, logs: [...logs, ...fresh], moments });
    return fresh;
};

const announce = (traced: boolean, fresh: readonly string[]): void => {
    if (fresh.length === 0) return;

    if (traced) {
        UI.toast("BACKTRACE: new trace and log recorded.", "info");
        return;
    }

    UI.toast(`BACKTRACE: ${fresh.length} new personal log ${fresh.length === 1 ? "entry" : "entries"} recorded.`, "info");
};

export const appendBacktraceLogs = (
    mission: BacktraceMissionId,
    texts: readonly string[],
    options: BacktraceLogOptions = {},
): readonly string[] => {
    try {
        const moment = options.moment === true;
        const fresh = appendLogs(mission, texts, moment);
        if (!moment) announce(false, fresh);
        return fresh;
    } catch {
        return [];
    }
};

export const traceBacktraceFinding = <M extends BacktraceMissionId>(
    mission: M,
    key: BacktraceKey<M>,
    logs: readonly string[] = [],
    options: BacktraceLogOptions = {},
): boolean => {
    const traced = traceBacktraceKeyById(mission, key);
    if (logs.length === 0) return traced;

    try {
        const moment = options.moment === true;
        const fresh = appendLogs(mission, logs, moment);
        if (!moment) announce(traced, fresh);
    } catch {
        return traced;
    }

    return traced;
};
