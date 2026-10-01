import type { Gate, Unlock } from "../core/types.js";

export interface StepHost<D extends object> {
    readonly Data: D;
    SetData<K extends keyof D>(key: K, value: D[K]): void;
}

export const missingFlags = <D extends object>(
    gates: readonly Gate<D>[],
    step: keyof D & string,
    data: D,
): readonly (keyof D & string)[] =>
    gates
        .filter((gate) => gate.step === step)
        .flatMap((gate) => gate.requires.filter((flag) => !data[flag]));

export const canAdvance = <D extends object>(
    gates: readonly Gate<D>[],
    step: keyof D & string,
    data: D,
): boolean => missingFlags(gates, step, data).length === 0;

export const firstUnmetStep = <D extends object>(
    order: readonly (keyof D & string)[],
    data: D,
): (keyof D & string) | undefined => order.find((step) => !data[step]);

export const advanceStep = <D extends object>(
    host: StepHost<D>,
    gates: readonly Gate<D>[],
    step: keyof D & string,
    onAdvance?: () => void,
): boolean => {
    if (host.Data[step]) return false;

    if (missingFlags(gates, step, host.Data).length > 0) return false;

    host.SetData(step, true as D[keyof D & string]);
    onAdvance?.();
    return true;
};

export const reachedUnlocks = <D extends object>(
    unlocks: readonly Unlock<D>[],
    data: D,
): readonly string[] => unlocks.filter((unlock) => Boolean(data[unlock.when])).map((unlock) => unlock.name);
