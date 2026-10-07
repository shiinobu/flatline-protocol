import { Events } from "@hotbunny/hackhub-content-sdk";

import {
    RDC_ATTACHED_EVENT,
    RDC_LOGIN_EVENT,
    RDC_MESSAGES,
    RDC_READ_EVENT,
    RDC_SEED_EVENT,
    checkRdcToken,
    decryptRdcDoc,
    gatedDocCount,
    getRdcProfile,
    type RdcAttachedPayload,
    type RdcDecryptResult,
    toRdcPageProfile,
    type RdcLoginPayload,
    type RdcLoginResult,
    type RdcMirror,
    type RdcPageProfile,
    type RdcReadPayload,
    type RdcSeedPayload,
} from "../../../content/global/rdc.js";
import { M07_MISSION } from "../../../content/m07/rdc.js";
import { getM05RdcState } from "../../../context/m05/progress.js";
import { getM07RdcState } from "../../../context/m07/progress.js";

const MAX_TOKEN_LENGTH = 512;

const mirrorOf = (mission: string | undefined): RdcMirror =>
    mission === M07_MISSION ? getM07RdcState() : getM05RdcState();

export const rdcLogin = (hex: string): RdcLoginResult => {
    const profile = getRdcProfile();
    const result: RdcLoginResult =
        hex.length > MAX_TOKEN_LENGTH ? { ok: false, msg: RDC_MESSAGES.unreadable } : checkRdcToken(hex, profile);

    if (result.ok && result.host && profile) {
        const payload: RdcLoginPayload = { mission: profile.mission, code: result.host.code };
        Events.emit(RDC_LOGIN_EVENT, payload);
    }

    return result;
};

export const rdcAttach = (): void => {
    const profile = getRdcProfile();
    if (!profile) return;

    const payload: RdcAttachedPayload = { mission: profile.mission };
    Events.emit(RDC_ATTACHED_EVENT, payload);
};

export const rdcRead = (gate: number): void => {
    const profile = getRdcProfile();
    if (!profile || !Number.isInteger(gate) || gate < 1 || gate > gatedDocCount(profile)) return;

    const payload: RdcReadPayload = { mission: profile.mission, gate };
    Events.emit(RDC_READ_EVENT, payload);
};

export const rdcDecrypt = (name: string, key: string): RdcDecryptResult => {
    const result = decryptRdcDoc(getRdcProfile(), name, key);

    return result;
};

export const rdcSeed = (seed: number): void => {
    const profile = getRdcProfile();
    if (!profile || !Number.isInteger(seed) || seed < 1) return;

    const payload: RdcSeedPayload = { mission: profile.mission, seed };
    Events.emit(RDC_SEED_EVENT, payload);
};

export const rdcState = (): RdcMirror => {
    const state = mirrorOf(getRdcProfile()?.mission);
    return state;
};

export const rdcProfile = (): RdcPageProfile | null => {
    const profile = toRdcPageProfile(getRdcProfile());
    return profile;
};
