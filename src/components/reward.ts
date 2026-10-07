import { Bank } from "@hotbunny/hackhub-content-sdk";

export interface RewardSpec {
    readonly scope: string;
    readonly amount: number;
    readonly description: string;
    readonly skip: boolean;
}

export const payReward = (spec: RewardSpec): boolean => {
    if (spec.skip) {
        return false;
    }

    Bank.transaction({ amount: spec.amount, description: spec.description });
    return true;
};

export const penalty = (amount: number, description: string): number => {
    const charged = Math.min(Bank.getBalance(), amount);
    if (charged <= 0) {
        return 0;
    }

    Bank.withdraw({ amount: charged, description });
    return charged;
};
