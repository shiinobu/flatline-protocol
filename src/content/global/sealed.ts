import { compactHex, sealText } from "../../components/text-seal.js";

export interface SealedArtifactSpec {
    readonly id: string;
    readonly mission: string;
    readonly key: string;
    readonly plaintext: string;
}

export interface SealedArtifact extends SealedArtifactSpec {
    readonly hex: string;
}

export const SEALED_OPENED_EVENT = "flatline.cipher.opened";

export interface SealedOpenedPayload {
    readonly id: string;
    readonly mission: string;
}

const registry = new Map<string, SealedArtifact>();

export const setSealedArtifacts = (mission: string, entries: readonly SealedArtifactSpec[]): void => {
    for (const [id, artifact] of registry) {
        if (artifact.mission === mission) registry.delete(id);
    }
    for (const entry of entries) {
        registry.set(entry.id, { ...entry, hex: sealText(entry.plaintext, entry.key) });
    }
};

export const clearSealedArtifacts = (mission: string): void => {
    for (const [id, artifact] of registry) {
        if (artifact.mission === mission) registry.delete(id);
    }
};

export const findSealedArtifact = (hex: string, key: string): SealedArtifact | null => {
    const needle = compactHex(hex);
    for (const artifact of registry.values()) {
        if (artifact.key === key && artifact.hex === needle) return artifact;
    }
    return null;
};
