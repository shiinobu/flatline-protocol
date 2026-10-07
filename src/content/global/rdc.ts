import { openSealed, sealText } from "../../components/text-seal.js";

export interface RdcTarget {
    readonly code: number;
    readonly name: string;
    readonly tag: string;
    readonly lanIp: string;
    readonly change: string;
    readonly os: string;
    readonly hasDisplay: boolean;
}

export interface RdcArchiveDoc {
    readonly name: string;
    readonly dir: string;
    readonly gate: number;
    readonly label?: string;
    readonly text: string;
    readonly sealed?: boolean;
    readonly trashed?: boolean;
}

export type RdcNarrative = Readonly<Record<string, string>>;

export interface RdcProfile {
    readonly id: string;
    readonly mission: string;
    readonly key: string;
    readonly user: string;
    readonly password: string;
    readonly advanceCode: number;
    readonly targets: readonly RdcTarget[];
    readonly docs: readonly RdcArchiveDoc[];
    readonly narrative?: RdcNarrative;
}

export interface RdcMirror {
    readonly loggedIn: boolean;
    readonly attached: boolean;
    readonly docs: readonly number[];
    readonly seed: number;
}

export interface RdcPageTarget {
    readonly code: number;
    readonly name: string;
    readonly tag: string;
    readonly lanIp: string;
    readonly os: string;
    readonly hasDisplay: boolean;
}

export interface RdcPageProfile {
    readonly id: string;
    readonly targets: readonly RdcPageTarget[];
    readonly docs: readonly RdcArchiveDoc[];
    readonly narrative?: RdcNarrative;
}

export const toRdcPageProfile = (profile: RdcProfile | null): RdcPageProfile | null =>
    profile === null
        ? null
        : {
              id: profile.id,
              targets: profile.targets.map(({ code, name, tag, lanIp, os, hasDisplay }) => ({
                  code,
                  name,
                  tag,
                  lanIp,
                  os,
                  hasDisplay,
              })),
              docs: profile.docs.map(({ name, dir, gate, label, text, sealed, trashed }) => ({
                  name,
                  dir,
                  gate,
                  label,
                  text: sealed ? sealText(text, profile.key) : text,
                  ...(sealed ? { sealed } : {}),
                  ...(trashed ? { trashed } : {}),
              })),
              narrative: profile.narrative,
          };

export interface RdcLoginResult {
    readonly ok: boolean;
    readonly msg: string;
    readonly host?: RdcTarget;
}

export const RDC_LOGIN_EVENT = "flatline.rdc.login";
export const RDC_ATTACHED_EVENT = "flatline.rdc.attached";
export const RDC_READ_EVENT = "flatline.rdc.read";
export const RDC_SEED_EVENT = "flatline.rdc.seed";

export interface RdcLoginPayload {
    readonly mission: string;
    readonly code: number;
}

export interface RdcAttachedPayload {
    readonly mission: string;
}

export interface RdcReadPayload {
    readonly mission: string;
    readonly gate: number;
}

export interface RdcSeedPayload {
    readonly mission: string;
    readonly seed: number;
}

export const RDC_MESSAGES = {
    unreadable: "Token unreadable.",
    format: "Token format not recognised.",
    signin: "Sign-in failed.",
    address: "Address is not on the monitoring network.",
    tag: "Address and device tag do not match.",
    approval: "Approval does not cover this address.",
} as const;

let active: RdcProfile | null = null;

export const setRdcProfile = (profile: RdcProfile): void => {
    active = profile;
};

export const clearRdcProfile = (mission: string): void => {
    if (active?.mission === mission) active = null;
};

export const getRdcProfile = (): RdcProfile | null => active;

export const gatedDocCount = (profile: RdcProfile): number =>
    profile.docs.filter((doc) => doc.gate > 0).length;

export interface RdcDecryptResult {
    readonly ok: boolean;
    readonly text: string;
}

const MAX_KEY_LENGTH = 64;

export const decryptRdcDoc = (profile: RdcProfile | null, name: string, key: string): RdcDecryptResult => {
    const doc = profile?.docs.find((entry) => entry.name === name && entry.sealed === true);
    if (!profile || !doc || key.length === 0 || key.length > MAX_KEY_LENGTH) return { ok: false, text: "" };

    return sealText(doc.text, key) === sealText(doc.text, profile.key)
        ? { ok: true, text: doc.text }
        : { ok: false, text: "" };
};

export const checkRdcToken = (hex: string, profile: RdcProfile | null): RdcLoginResult => {
    if (!profile) return { ok: false, msg: RDC_MESSAGES.unreadable };

    const plain = openSealed(hex, profile.key);
    if (plain === null) return { ok: false, msg: RDC_MESSAGES.unreadable };

    const parts = plain.split(":");
    if (parts.length !== 5) return { ok: false, msg: RDC_MESSAGES.format };

    if (parts[0] !== profile.user || parts[1] !== profile.password) return { ok: false, msg: RDC_MESSAGES.signin };

    const byAddress = profile.targets.find((target) => target.lanIp === parts[2]);
    if (!byAddress) return { ok: false, msg: RDC_MESSAGES.address };
    if (byAddress.tag !== parts[4]) return { ok: false, msg: RDC_MESSAGES.tag };
    if (byAddress.change !== parts[3]) return { ok: false, msg: RDC_MESSAGES.approval };

    return { ok: true, msg: "", host: byAddress };
};
