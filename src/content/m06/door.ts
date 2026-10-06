import { M06_SHARED_FINGERPRINT } from "./hosttrail.js";

export const M06_DOOR_OPENED_EVENT = "flatline.m06.door.opened";

export const M06_DOOR_PHRASE = "BEHIND THE WALL";
export const M06_DOOR_PASSPHRASE = M06_DOOR_PHRASE.replace(/ /g, "");
export const M06_DOOR_CIPHERTEXT = "MBRDONQLNYLVOL";
export const M06_DOOR_FACTOR = M06_SHARED_FINGERPRINT.split(":").slice(-2).join("");

export const M06_DOOR_MAX_FIELD_LENGTH = 64;
export const M06_DOOR_COOLDOWN_SECONDS: readonly number[] = [0, 0, 10];

const FILLER_LETTER = "X";

const lettersOnly = (value: string): string => value.toUpperCase().replace(/[^A-Z]/g, "");

export const isDoorPassphrase = (value: string): boolean => {
    const letters = lettersOnly(value);
    const hasFiller = letters.length === M06_DOOR_PASSPHRASE.length + 1 && letters.endsWith(FILLER_LETTER);

    return (hasFiller ? letters.slice(0, -1) : letters) === M06_DOOR_PASSPHRASE;
};

export const isDoorFactor = (value: string): boolean =>
    value.toLowerCase().replace(/[^0-9a-f]/g, "") === M06_DOOR_FACTOR;

export const isDoorAnswer = (passphrase: string, factor: string): boolean =>
    isDoorPassphrase(passphrase) && isDoorFactor(factor);

export const doorCooldownSeconds = (failures: number): number => {
    if (failures <= 0) return 0;

    return M06_DOOR_COOLDOWN_SECONDS[Math.min(failures, M06_DOOR_COOLDOWN_SECONDS.length) - 1];
};
