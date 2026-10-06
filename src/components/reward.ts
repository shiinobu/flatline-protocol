import { Bank } from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";

export interface RewardSpec {
    readonly scope: string;
    readonly amount: number;
    readonly description: string;
    readonly skip: boolean;
}

export const payReward = (spec: RewardSpec): boolean => {
    if (spec.skip) {
        trace(spec.scope, `reward skipped under focus: ${spec.amount}`);
        return false;
    }

    Bank.transaction({ amount: spec.amount, description: spec.description });
    trace(spec.scope, `reward paid: ${spec.amount}`);
    return true;
};

export const penalty = (scope: string, amount: number, description: string): number => {
    const charged = Math.min(Bank.getBalance(), amount);
    if (charged <= 0) {
        trace(scope, `penalty skipped, balance empty (asked ${amount})`);
        return 0;
    }

    Bank.withdraw({ amount: charged, description });
    trace(scope, `penalty charged: ${charged} of ${amount}`);
    return charged;
};
