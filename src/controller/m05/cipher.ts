import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { SEALED_OPENED_EVENT, type SealedOpenedPayload } from "../../content/global/sealed.js";
import {
    M05_ARTIFACT_FORMAT,
    M05_ARTIFACT_ROXANNE_NOTE,
    M05_ARTIFACT_HANDOVER,
    M05_ARTIFACT_ROLLBACK,
    M05_ARTIFACT_SAMPLE,
} from "../../content/m05/sealed.js";
import { M05_LOG_ROXANNE_NOTE } from "../../content/m05/quest-logs.js";
import { M05_MISSION } from "../../content/m05/rdc.js";
import { settleM05 } from "./portal.js";
import type { M05Quest } from "./types.js";

export const bindM05Cipher = (quest: M05Quest): void => {
    quest.Events.on(SEALED_OPENED_EVENT, (data: SealedOpenedPayload) => {
        if (data.mission !== M05_MISSION) return;

        if (data.id === M05_ARTIFACT_HANDOVER && !quest.Data.handoverDecrypted) {
            quest.SetData("handoverDecrypted", true);
            settleM05(quest);
            return;
        }

        if (data.id === M05_ARTIFACT_FORMAT && !quest.Data.formatDecrypted) {
            quest.SetData("formatDecrypted", true);
            settleM05(quest);
            return;
        }

        if (data.id === M05_ARTIFACT_ROLLBACK && !quest.Data.rollbackOpened) {
            quest.SetData("rollbackOpened", true);
            settleM05(quest);
            return;
        }

        if (data.id === M05_ARTIFACT_SAMPLE && !quest.Data.sampleDecrypted) {
            quest.SetData("sampleDecrypted", true);
            settleM05(quest);
            return;
        }

        if (data.id === M05_ARTIFACT_ROXANNE_NOTE && !quest.Data.roxanneNoteOpened) {
            quest.SetData("roxanneNoteOpened", true);
            appendBacktraceLogs("m5", M05_LOG_ROXANNE_NOTE());
        }
    });
};
