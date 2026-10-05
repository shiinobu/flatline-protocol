import { Events } from "@hotbunny/hackhub-content-sdk";

import {
    RDC_ATTACHED_EVENT,
    RDC_LOGIN_EVENT,
    RDC_MESSAGES,
    RDC_READ_EVENT,
    checkRdcToken,
    gatedDocCount,
    getRdcProfile,
    type RdcAttachedPayload,
    type RdcLoginPayload,
    type RdcLoginResult,
    type RdcReadPayload,
} from "../../../content/global/rdc.js";
import { getM05RdcState, type M05RdcMirror } from "../../../context/m05/progress.js";
import { trace } from "../../../helpers/logger.js";

const MAX_TOKEN_LENGTH = 512;

export const rdcLogin = (hex: string): RdcLoginResult => {
    const profile = getRdcProfile();
    const result: RdcLoginResult =
        hex.length > MAX_TOKEN_LENGTH ? { ok: false, msg: RDC_MESSAGES.unreadable } : checkRdcToken(hex, profile);

    trace("RDC", `login ok=${result.ok} code=${result.host?.code ?? 0} length=${hex.length} msg=${result.msg}`);

    if (result.ok && result.host && profile) {
        const payload: RdcLoginPayload = { mission: profile.mission, code: result.host.code };
        Events.emit(RDC_LOGIN_EVENT, payload);
    }

    return result;
};

export const rdcSignal = (stage: number): void => {
    trace("RDC", `signal stage=${stage}`);
};

export const rdcAttach = (): void => {
    const profile = getRdcProfile();
    if (!profile) return;

    trace("RDC", `attach mission=${profile.mission}`);
    const payload: RdcAttachedPayload = { mission: profile.mission };
    Events.emit(RDC_ATTACHED_EVENT, payload);
};

export const rdcRead = (gate: number): void => {
    const profile = getRdcProfile();
    if (!profile || !Number.isInteger(gate) || gate < 1 || gate > gatedDocCount(profile)) return;

    trace("RDC", `read mission=${profile.mission} gate=${gate}`);
    const payload: RdcReadPayload = { mission: profile.mission, gate };
    Events.emit(RDC_READ_EVENT, payload);
};

export const rdcState = (): M05RdcMirror => {
    const state = getM05RdcState();
    trace("RDC", `state loggedIn=${state.loggedIn} attached=${state.attached} docs=${state.docs.length}`);
    return state;
};
