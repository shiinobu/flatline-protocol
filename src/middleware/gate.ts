import type { FlagKey, Gate, Unlock } from "../core/types.js";

export interface StepHost<D extends object> {
    readonly Data: D;
    SetData<K extends keyof D>(key: K, value: D[K]): void;
}

export const missingFlags = <D extends object>(
    gates: readonly Gate<D>[],
    step: FlagKey<D>,
    data: D,
): readonly FlagKey<D>[] =>
    gates
        .filter((gate) => gate.step === step)
        .flatMap((gate) => gate.requires.filter((flag) => !data[flag]));

export const canAdvance = <D extends object>(
    gates: readonly Gate<D>[],
    step: FlagKey<D>,
    data: D,
): boolean => missingFlags(gates, step, data).length === 0;

export const firstUnmetStep = <D extends object>(
    order: readonly FlagKey<D>[],
    data: D,
): FlagKey<D> | undefined => order.find((step) => !data[step]);

export const advanceStep = <D extends object>(
    host: StepHost<D>,
    gates: readonly Gate<D>[],
    step: FlagKey<D>,
    onAdvance?: () => void,
): boolean => {
    if (host.Data[step]) return false;

    if (missingFlags(gates, step, host.Data).length > 0) return false;

    host.SetData(step, true as D[FlagKey<D>]);
    onAdvance?.();
    return true;
};

export const reachedUnlocks = <D extends object>(
    unlocks: readonly Unlock<D>[],
    data: D,
): readonly string[] => unlocks.filter((unlock) => Boolean(data[unlock.when])).map((unlock) => unlock.name);
