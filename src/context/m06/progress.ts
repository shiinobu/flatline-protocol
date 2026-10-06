import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M06_STAGE_KEY = "flatline.m06.stage";
const M06_SHELL_STRUCK_OFF_KEY = "flatline.m06.shellStruckOff";
const M06_DOOR_OPEN_KEY = "flatline.m06.doorOpen";
const M06_DOOR_FAILS_KEY = "flatline.m06.doorFails";
const M06_DOOR_LOCK_KEY = "flatline.m06.doorLockUntil";
const M06_KEYS_FOUND_KEY = "flatline.m06.keysFound";

export const M06_STAGE = {
    closed: 0,
    register: 1,
    archive: 2,
    filings: 3,
    ownership: 4,
    door: 5,
    identity: 6,
} as const;

export const readM06Stage = (): number => SharedVariables.get<number>(M06_STAGE_KEY) ?? M06_STAGE.closed;

export const setM06Stage = (stage: number): void => {
    if (stage <= readM06Stage()) return;

    SharedVariables.set(M06_STAGE_KEY, stage);
};

export const resetM06Stage = (stage: number): void => SharedVariables.set(M06_STAGE_KEY, stage);

export const isM06StageOpen = (stage: number): boolean => readM06Stage() >= stage;

export const setM06KeysFound = (count: number): void => SharedVariables.set(M06_KEYS_FOUND_KEY, count);

export const readM06KeysFound = (): number => SharedVariables.get<number>(M06_KEYS_FOUND_KEY) ?? 0;

export const setM06ShellStruckOff = (struckOff: boolean): void =>
    SharedVariables.set(M06_SHELL_STRUCK_OFF_KEY, struckOff);

export const isM06ShellStruckOff = (): boolean =>
    SharedVariables.get<boolean>(M06_SHELL_STRUCK_OFF_KEY) === true;

export const setM06DoorOpen = (open: boolean): void => SharedVariables.set(M06_DOOR_OPEN_KEY, open);

export const isM06DoorOpen = (): boolean => SharedVariables.get<boolean>(M06_DOOR_OPEN_KEY) === true;

export const readM06DoorFails = (): number => SharedVariables.get<number>(M06_DOOR_FAILS_KEY) ?? 0;

export const readM06DoorLockUntil = (): number => SharedVariables.get<number>(M06_DOOR_LOCK_KEY) ?? 0;

export const recordM06DoorFailure = (failures: number, lockUntil: number): void => {
    SharedVariables.set(M06_DOOR_FAILS_KEY, failures);
    SharedVariables.set(M06_DOOR_LOCK_KEY, lockUntil);
};

export const clearM06Progress = (): void => {
    SharedVariables.remove(M06_STAGE_KEY);
    SharedVariables.remove(M06_KEYS_FOUND_KEY);
    SharedVariables.remove(M06_SHELL_STRUCK_OFF_KEY);
    SharedVariables.remove(M06_DOOR_OPEN_KEY);
    SharedVariables.remove(M06_DOOR_FAILS_KEY);
    SharedVariables.remove(M06_DOOR_LOCK_KEY);
};
