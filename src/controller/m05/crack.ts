import { M05_GATES } from "../../content/m05/gates.js";
import { M05_CORRECT_LEAK_RECORD_ID, M05_LEAK_OPENED_EVENT } from "../../content/m05/leakindex.js";
import { M05_GRETA_HASH, M05_GRETA_PASSWORD } from "../../content/m05/network.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M05Quest } from "./types.js";

export const bindM05Crack = (quest: M05Quest): void => {
    quest.Events.on(M05_LEAK_OPENED_EVENT, (data: { readonly id: number }) => {
        if (data.id !== M05_CORRECT_LEAK_RECORD_ID) {
            trace("M05", `probe:leak-record-opened id=${data.id} (decoy)`);
            return;
        }

        trace("M05", `probe:leak-record-opened id=${data.id} (match)`);
        advanceStep(quest, M05_GATES, "credentialFound");
    });

    quest.Events.on("John.DecryptHash", (data) => {
        if (data.hash !== M05_GRETA_HASH) return;
        if (data.password !== M05_GRETA_PASSWORD) return;

        trace("M05", "probe:password-cracked");
        advanceStep(quest, M05_GATES, "passwordCracked");
    });
};
