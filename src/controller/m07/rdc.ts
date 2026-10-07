import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import {
    RDC_ATTACHED_EVENT,
    RDC_LOGIN_EVENT,
    RDC_READ_EVENT,
    RDC_SEED_EVENT,
    type RdcAttachedPayload,
    type RdcLoginPayload,
    type RdcMirror,
    type RdcReadPayload,
    type RdcSeedPayload,
} from "../../content/global/rdc.js";
import { M07_GATES, type M07Step } from "../../content/m07/gates.js";
import { M07_WHATNOW_MAIL } from "../../content/m07/mail.js";
import { M07_LOG_DOSSIER, M07_LOG_INSTRUCTION, M07_LOG_MODEL } from "../../content/m07/quest-logs.js";
import { M07_SCOPE } from "../../content/m07/quest.js";
import { M07_MISSION, M07_RDC_ADVANCE_CODE } from "../../content/m07/rdc.js";
import { rdcSeedOf } from "../../content/m07/state.js";
import { getM07RdcState, setM07LedgerRoomOpen, setM07RdcState } from "../../context/m07/progress.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep } from "../../middleware/gate.js";
import { isDuelTwoWon, settleDuelTwo, startDuelTwo } from "./duel.js";
import type { M07Quest } from "./types.js";

type M07RdcKey = "instruction" | "model" | "dossier";

interface ReadStep {
    readonly step: M07Step;
    readonly key: M07RdcKey;
    readonly log: () => readonly string[];
}

const READ_STEPS: Readonly<Record<number, ReadStep>> = {
    1: { step: "instructionRead", key: "instruction", log: M07_LOG_INSTRUCTION },
    2: { step: "modelRead", key: "model", log: M07_LOG_MODEL },
    3: { step: "dossierRead", key: "dossier", log: M07_LOG_DOSSIER },
};

const docsRead = (quest: M07Quest): readonly number[] => {
    const read: number[] = [];
    if (quest.Data.instructionRead) read.push(1);
    if (quest.Data.modelRead) read.push(2);
    if (quest.Data.dossierRead) read.push(3);
    return read;
};

const patchMirror = (patch: Partial<RdcMirror>): void =>
    setM07RdcState({ ...getM07RdcState(), ...patch });

const bindLogin = (quest: M07Quest): void => {
    quest.Events.on(RDC_LOGIN_EVENT, (data: RdcLoginPayload) => {
        if (data.mission !== M07_MISSION || data.code !== M07_RDC_ADVANCE_CODE) return;

        trace(M07_SCOPE, "probe:rdc-login chair");
        advanceStep(quest, M07_GATES, "workstationLoggedIn");
        if (quest.Data.workstationLoggedIn) patchMirror({ loggedIn: true, docs: docsRead(quest) });
    });
};

const bindSeed = (quest: M07Quest): void => {
    quest.Events.on(RDC_SEED_EVENT, (data: RdcSeedPayload) => {
        if (data.mission !== M07_MISSION || rdcSeedOf(quest.Data) > 0) return;

        quest.SetData("rdcSeed", data.seed);
        patchMirror({ seed: data.seed });
    });
};

const bindAttach = (quest: M07Quest): void => {
    quest.Events.on(RDC_ATTACHED_EVENT, (data: RdcAttachedPayload) => {
        if (data.mission !== M07_MISSION) return;

        trace(M07_SCOPE, "probe:rdc-attached");
        advanceStep(quest, M07_GATES, "displayAttached");
        if (!quest.Data.displayAttached) return;

        patchMirror({ attached: true, docs: docsRead(quest) });
        startDuelTwo(quest);
    });
};

const openLedgerRoom = (quest: M07Quest): void => {
    if (!isDuelTwoWon(quest.Data) || quest.Data.whatNowSent) return;

    quest.SetData("whatNowSent", true);
    setM07LedgerRoomOpen(true);
    Mail.send(M07_WHATNOW_MAIL());
    trace(M07_SCOPE, "ledger room opened after duel two");
};

const bindRead = (quest: M07Quest): void => {
    quest.Events.on(RDC_READ_EVENT, (data: RdcReadPayload) => {
        if (data.mission !== M07_MISSION || !quest.Data.displayAttached) return;

        const read = READ_STEPS[data.gate];
        if (!read) return;

        trace(M07_SCOPE, `probe:rdc-read gate=${data.gate}`);
        advanceStep(quest, M07_GATES, read.step, () => {
            traceBacktraceFinding("m7", read.key, read.log());
            patchMirror({ docs: docsRead(quest) });
        });
        settleDuelTwo(quest);
        openLedgerRoom(quest);
    });
};

export const bindM07Rdc = (quest: M07Quest): void => {
    bindLogin(quest);
    bindSeed(quest);
    bindAttach(quest);
    bindRead(quest);
};
