import {
    M07_ASHVECTOR_IP,
    M07_C2_IP,
    M07_NULLCROWN_IP,
} from "./network.js";

export type HoneyCheckTone = "ok" | "warn" | "bad";
export type HoneyCheckVerdict = "clean" | "likely" | "notHoneypot";

export interface HoneyCheckRecord {
    readonly host: string;
    readonly verdict: HoneyCheckVerdict;
    readonly tone: HoneyCheckTone;
    readonly confidence: number;
    readonly lastSeen: string;
    readonly signalsKey: string;
}

export const M07_HONEYCHECK_SAMPLED_AT = "2026-10-01";

export const M07_HONEYCHECK_RECORDS: readonly HoneyCheckRecord[] = [
    {
        host: M07_C2_IP,
        verdict: "notHoneypot",
        tone: "ok",
        confidence: 91,
        lastSeen: M07_HONEYCHECK_SAMPLED_AT,
        signalsKey: "c2",
    },
    {
        host: M07_NULLCROWN_IP,
        verdict: "clean",
        tone: "ok",
        confidence: 88,
        lastSeen: M07_HONEYCHECK_SAMPLED_AT,
        signalsKey: "nullcrown",
    },
    {
        host: M07_ASHVECTOR_IP,
        verdict: "likely",
        tone: "bad",
        confidence: 71,
        lastSeen: M07_HONEYCHECK_SAMPLED_AT,
        signalsKey: "ashvector",
    },
];

export const M07_HONEYCHECK_DOMAIN = "honeycheck.net";
export const M07_HONEYCHECK_IP = "185.93.2.117";
