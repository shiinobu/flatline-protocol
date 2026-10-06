import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { SEALED_OPENED_EVENT, type SealedOpenedPayload } from "../../content/global/sealed.js";
import { M06_DOOR_OPENED_EVENT } from "../../content/m06/door.js";
import { M06_GATES } from "../../content/m06/gates.js";
import { M06_LOG_OWNERSHIP } from "../../content/m06/quest-logs.js";
import {
    M06_ARTIFACT_FILING_2019,
    M06_ARTIFACT_FILING_2024,
    M06_MISSION,
} from "../../content/m06/sealed.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M06Quest } from "./types.js";

export const bindM06Cipher = (quest: M06Quest): void => {
    quest.Events.on(SEALED_OPENED_EVENT, (data: SealedOpenedPayload) => {
        if (data.mission !== M06_MISSION) return;

        if (data.id === M06_ARTIFACT_FILING_2019) {
            advanceStep(quest, M06_GATES, "filing2019Opened");
            return;
        }

        if (data.id === M06_ARTIFACT_FILING_2024) {
            advanceStep(quest, M06_GATES, "filing2024Opened", () =>
                traceBacktraceFinding("m6", "ownershipChange", M06_LOG_OWNERSHIP()),
            );
        }
    });

    quest.Events.on(M06_DOOR_OPENED_EVENT, () => {
        advanceStep(quest, M06_GATES, "doorOpened");
    });
};
