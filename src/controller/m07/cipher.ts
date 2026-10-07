import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { SEALED_OPENED_EVENT, type SealedOpenedPayload } from "../../content/global/sealed.js";
import { M07_GATES } from "../../content/m07/gates.js";
import { M07_LOG_SEAL } from "../../content/m07/quest-logs.js";
import { M07_MISSION } from "../../content/m07/rdc.js";
import { M07_ARTIFACT_SEAL } from "../../content/m07/sealed.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M07Quest } from "./types.js";

export const bindM07Cipher = (quest: M07Quest): void => {
    quest.Events.on(SEALED_OPENED_EVENT, (data: SealedOpenedPayload) => {
        if (data.mission !== M07_MISSION) return;

        if (data.id !== M07_ARTIFACT_SEAL) return;

        advanceStep(quest, M07_GATES, "sealOpened", () => traceBacktraceFinding("m7", "seal", M07_LOG_SEAL()));
    });
};
