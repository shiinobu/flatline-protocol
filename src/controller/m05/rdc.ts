import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import {
    RDC_ATTACHED_EVENT,
    RDC_LOGIN_EVENT,
    RDC_READ_EVENT,
    RDC_SEED_EVENT,
    type RdcAttachedPayload,
    type RdcLoginPayload,
    type RdcReadPayload,
    type RdcSeedPayload,
} from "../../content/global/rdc.js";
import { M05_GATES, type M05Step } from "../../content/m05/gates.js";
import {
    M05_LOG_ARCHIVE,
    M05_LOG_MEMO,
    M05_LOG_STATEMENT,
    M05_LOG_TICKET,
} from "../../content/m05/quest-logs.js";
import { M05_MISSION, M05_RDC_ADVANCE_CODE } from "../../content/m05/rdc.js";
import { rdcSeedOf } from "../../content/m05/state.js";
import { setM05RdcState } from "../../context/m05/progress.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import { settleM05 } from "./portal.js";
import type { M05Quest } from "./types.js";
import { M05_WORLD } from "./world.js";

interface ReadStep {
    readonly step: M05Step;
    readonly key: "statement" | "decisionMemo" | "usbTicket";
    readonly log: () => readonly string[];
}

const READ_STEPS: Readonly<Record<number, ReadStep>> = {
    1: { step: "statementRead", key: "statement", log: M05_LOG_STATEMENT },
    2: { step: "memoRead", key: "decisionMemo", log: M05_LOG_MEMO },
    3: { step: "ticketRead", key: "usbTicket", log: M05_LOG_TICKET },
};

const docsRead = (quest: M05Quest): readonly number[] => {
    const read: number[] = [];
    if (quest.Data.statementRead) read.push(1);
    if (quest.Data.memoRead) read.push(2);
    if (quest.Data.ticketRead) read.push(3);
    return read;
};

const writeMirror = (quest: M05Quest): void => {
    setM05RdcState({
        loggedIn: quest.Data.rdcLoggedIn,
        attached: quest.Data.displayAttached,
        docs: docsRead(quest),
        seed: rdcSeedOf(quest.Data),
    });
};

const bindLogin = (quest: M05Quest): void => {
    quest.Events.on(RDC_LOGIN_EVENT, (data: RdcLoginPayload) => {
        if (data.mission !== M05_MISSION || data.code !== M05_RDC_ADVANCE_CODE) return;

        settleM05(quest);
        advanceStep(quest, M05_GATES, "rdcLoggedIn", () => writeMirror(quest));
    });
};

const bindSeed = (quest: M05Quest): void => {
    quest.Events.on(RDC_SEED_EVENT, (data: RdcSeedPayload) => {
        if (data.mission !== M05_MISSION || rdcSeedOf(quest.Data) > 0) return;

        quest.SetData("rdcSeed", data.seed);
        writeMirror(quest);
    });
};

const bindAttach = (quest: M05Quest): void => {
    quest.Events.on(RDC_ATTACHED_EVENT, (data: RdcAttachedPayload) => {
        if (data.mission !== M05_MISSION) return;

        advanceStep(quest, M05_GATES, "displayAttached", () => {
            unlock(M05_WORLD, "hospitalShells");
            traceBacktraceFinding("m5", "archive", M05_LOG_ARCHIVE());
            writeMirror(quest);
        });
    });
};

const bindRead = (quest: M05Quest): void => {
    quest.Events.on(RDC_READ_EVENT, (data: RdcReadPayload) => {
        if (data.mission !== M05_MISSION || !quest.Data.displayAttached) return;

        const read = READ_STEPS[data.gate];
        if (!read) return;

        advanceStep(quest, M05_GATES, read.step, () => {
            traceBacktraceFinding("m5", read.key, read.log());
            writeMirror(quest);
        });
    });
};

export const bindM05Rdc = (quest: M05Quest): void => {
    bindLogin(quest);
    bindSeed(quest);
    bindAttach(quest);
    bindRead(quest);
};
