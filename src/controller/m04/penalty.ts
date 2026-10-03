import { Localization, UI } from "@hotbunny/hackhub-content-sdk";

import { penalty } from "../../components/reward.js";
import { M04_SCOPE } from "../../content/m04/quest.js";
import { M04_I18N_KEY } from "../../i18n/m04/core.js";

export const chargeM04Penalty = (amount: number, description: string): number => {
    const charged = penalty(M04_SCOPE, amount, description);
    if (charged > 0) UI.toast(Localization.t(M04_I18N_KEY.TOAST_PENALTY, { amount: charged }), "error");
    return charged;
};
