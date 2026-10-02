import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M06_STAGE_KEY = "flatline.m06.stage";
const M06_SHELL_STRUCK_OFF_KEY = "flatline.m06.shellStruckOff";

export const M06_STAGE = {
    closed: 0,
    register: 1,
    archive: 2,
    filings: 3,
    ownership: 4,
    identity: 5,
} as const;

export const readM06Stage = (): number => SharedVariables.get<number>(M06_STAGE_KEY) ?? M06_STAGE.closed;

export const setM06Stage = (stage: number): void => {
    if (stage <= readM06Stage()) return;

    SharedVariables.set(M06_STAGE_KEY, stage);
};

export const isM06StageOpen = (stage: number): boolean => readM06Stage() >= stage;

export const setM06ShellStruckOff = (struckOff: boolean): void =>
    SharedVariables.set(M06_SHELL_STRUCK_OFF_KEY, struckOff);

export const isM06ShellStruckOff = (): boolean =>
    SharedVariables.get<boolean>(M06_SHELL_STRUCK_OFF_KEY) === true;

export const clearM06Progress = (): void => {
    SharedVariables.remove(M06_STAGE_KEY);
    SharedVariables.remove(M06_SHELL_STRUCK_OFF_KEY);
};
