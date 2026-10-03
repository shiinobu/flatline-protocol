import { M01_LOG_AFTERMATH, M01_LOG_BUYER, M01_LOG_CASE, M01_LOG_DEFAULT } from "../content/m01/quest.js";
import {
    M02_LOG_AFTERMATH,
    M02_LOG_DEFAULT,
    M02_LOG_DEVELOPER,
    M02_LOG_FIREWALL,
    M02_LOG_HOME,
    M02_LOG_RANSOM,
    M02_LOG_SHELL,
    M02_LOG_WORKSTATION,
} from "../content/m02/quest.js";
import {
    M03_LOG_ACCOMPLICE,
    M03_LOG_AFTERMATH,
    M03_LOG_GATEWAY,
    M03_LOG_LEDGER,
    M03_LOG_PIVOT,
    M03_LOG_PORTAL,
    M03_LOG_REYES,
    M03_LOG_TUNNEL,
} from "../content/m03/quest.js";
import {
    M04_LOG_BREACH,
    M04_LOG_CONTROL,
    M04_LOG_ORIGIN,
    M04_LOG_PROBE,
    M04_LOG_RELAY1,
    M04_LOG_RELAY2,
} from "../content/m04/quest-logs.js";
import {
    M05_LOG_ARCHIVE,
    M05_LOG_BEDSIDE,
    M05_LOG_DISMISSED,
    M05_LOG_GRETA,
    M05_LOG_MEMO,
    M05_LOG_NOTES,
    M05_LOG_STATEMENT,
    M05_LOG_TICKET,
} from "../content/m05/quest-logs.js";
import {
    M06_LOG_AGENT,
    M06_LOG_CAPTURE,
    M06_LOG_CERTIFICATE,
    M06_LOG_IDENTITY,
    M06_LOG_INSURER,
    M06_LOG_NOMINEES,
    M06_LOG_OWNERSHIP,
} from "../content/m06/quest-logs.js";
import {
    M07_LOG_C2,
    M07_LOG_CREDENTIAL,
    M07_LOG_EDGE,
    M07_LOG_LEDGER,
    M07_LOG_MANIFEST,
    M07_LOG_NODES,
} from "../content/m07/quest-logs.js";
import type { BacktraceMissionId } from "./backtrace-state.js";

const NOTE_SOURCE = "note";

interface BacktraceLogGroup {
    readonly read: () => readonly string[];
    readonly key?: string;
    readonly note?: boolean;
    readonly optional?: boolean;
    readonly moment?: boolean;
}

export interface BacktraceFilledLogs {
    readonly logs: readonly string[];
    readonly moments?: readonly string[];
}

const MISSION_LOGS: Readonly<Record<BacktraceMissionId, readonly BacktraceLogGroup[]>> = {
    m1: [
        { read: M01_LOG_DEFAULT, key: "broker" },
        { read: M01_LOG_BUYER, key: "buyer" },
        { read: M01_LOG_AFTERMATH, key: "vault" },
        { read: M01_LOG_CASE, key: "caseId" },
    ],
    m2: [
        { read: M02_LOG_DEVELOPER, key: "developer" },
        { read: M02_LOG_RANSOM, key: "ransom" },
        { read: M02_LOG_DEFAULT, key: "deployLog" },
        { read: M02_LOG_HOME, key: "homeLead" },
        { read: M02_LOG_FIREWALL, key: "firewall" },
        { read: M02_LOG_WORKSTATION, key: "workstation" },
        { read: M02_LOG_SHELL, key: "shellCompany" },
        { read: M02_LOG_AFTERMATH, note: true },
    ],
    m3: [
        { read: M03_LOG_PORTAL, key: "portal" },
        { read: M03_LOG_PIVOT, key: "pivot" },
        { read: M03_LOG_LEDGER, key: "parentEntity" },
        { read: M03_LOG_GATEWAY, key: "gateway" },
        { read: M03_LOG_TUNNEL, key: "vpnPeer" },
        { read: M03_LOG_ACCOMPLICE, key: "accomplice", optional: true },
        { read: M03_LOG_REYES, note: true, optional: true },
        { read: M03_LOG_AFTERMATH, moment: true },
    ],
    m4: [
        { read: M04_LOG_PROBE, key: "probe", optional: true },
        { read: M04_LOG_BREACH, key: "breach", moment: true },
        { read: M04_LOG_RELAY1, key: "relay1" },
        { read: M04_LOG_RELAY2, key: "relay2" },
        { read: M04_LOG_CONTROL, key: "control" },
        { read: M04_LOG_ORIGIN, key: "origin" },
    ],
    m5: [
        { read: M05_LOG_DISMISSED, key: "dismissed" },
        { read: M05_LOG_GRETA, key: "greta" },
        { read: M05_LOG_ARCHIVE, key: "archive" },
        { read: M05_LOG_NOTES, note: true, optional: true },
        { read: M05_LOG_STATEMENT, key: "statement" },
        { read: M05_LOG_MEMO, key: "decisionMemo" },
        { read: M05_LOG_TICKET, key: "usbTicket" },
        { read: M05_LOG_BEDSIDE, note: true, optional: true },
    ],
    m6: [
        { read: M06_LOG_NOMINEES, key: "nominees" },
        { read: M06_LOG_AGENT, key: "registeredAgent" },
        { read: M06_LOG_OWNERSHIP, key: "ownershipChange" },
        { read: M06_LOG_INSURER, key: "insurer" },
        { read: M06_LOG_CERTIFICATE, key: "infra" },
        { read: M06_LOG_IDENTITY, key: "architect" },
        { read: M06_LOG_CAPTURE, note: true, optional: true },
    ],
    m7: [
        { read: M07_LOG_NODES, key: "nodes" },
        { read: M07_LOG_CREDENTIAL, key: "credential" },
        { read: M07_LOG_EDGE, key: "firewall" },
        { read: M07_LOG_C2, key: "c2" },
        { read: M07_LOG_MANIFEST, key: "manifest" },
        { read: M07_LOG_LEDGER, key: "ledger" },
    ],
};

const selectTexts = (mission: BacktraceMissionId, include: (group: BacktraceLogGroup) => boolean): readonly string[] =>
    MISSION_LOGS[mission].filter(include).flatMap((group) => group.read());

const insertInOrder = (logs: readonly string[], text: string, order: readonly string[]): readonly string[] => {
    const rank = order.indexOf(text);
    const at = logs.findIndex((logged) => {
        const loggedRank = order.indexOf(logged);
        return loggedRank === -1 || loggedRank > rank;
    });

    return at === -1 ? [...logs, text] : [...logs.slice(0, at), text, ...logs.slice(at)];
};

export const optionalBacktraceLogGroups = (mission: BacktraceMissionId): readonly (readonly string[])[] =>
    MISSION_LOGS[mission].filter((group) => group.optional === true).map((group) => group.read());

export const optionalBacktraceLogs = (mission: BacktraceMissionId): readonly string[] =>
    optionalBacktraceLogGroups(mission).flat();

export const mergeBacktraceLogs = (
    mission: BacktraceMissionId,
    logged: readonly string[],
    texts: readonly string[],
): readonly string[] => {
    const order = selectTexts(mission, () => true);

    return texts
        .filter((text) => !logged.includes(text))
        .reduce<readonly string[]>((merged, text) => insertInOrder(merged, text, order), logged);
};

export const fillBacktraceLogs = (
    mission: BacktraceMissionId,
    logged: readonly string[],
    moments?: readonly string[],
): BacktraceFilledLogs => {
    const missing = selectTexts(mission, (group) => group.optional !== true).filter((text) => !logged.includes(text));
    const filled = mergeBacktraceLogs(mission, logged, missing);
    const unflagged = selectTexts(mission, (group) => group.moment === true).filter(
        (text) => filled.includes(text) && !(moments ?? []).includes(text),
    );

    return {
        logs: filled,
        moments: unflagged.length === 0 ? moments : [...(moments ?? []), ...unflagged],
    };
};

export const sourcesOfBacktraceLogs = (
    mission: BacktraceMissionId,
    texts: readonly string[],
): Readonly<Record<string, string>> => {
    const wanted = new Set(texts);

    return Object.fromEntries(
        MISSION_LOGS[mission].flatMap((group) => {
            const source = group.key ?? (group.note === true ? NOTE_SOURCE : undefined);
            if (source === undefined) return [];

            return group
                .read()
                .filter((text) => wanted.has(text))
                .map((text): [string, string] => [text, source]);
        }),
    );
};
