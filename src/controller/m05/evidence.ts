import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M05_GATES, type M05Step } from "../../content/m05/gates.js";
import { M05_LOG_DISMISSED, M05_LOG_GRETA } from "../../content/m05/quest-logs.js";
import type { M05QuestData } from "../../content/m05/state.js";
import { setM05ArchiveOpen } from "../../context/m05/progress.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M05Quest } from "./types.js";

interface EvidenceRule {
    readonly step: M05Step;
    readonly ready: (data: M05QuestData) => boolean;
    readonly effect?: () => void;
}

const EVIDENCE_RULES: readonly EvidenceRule[] = [
    { step: "changeRecordRead", ready: (data) => data.changeSeen, effect: () => setM05ArchiveOpen(true) },
    {
        step: "staffArchiveCompared",
        ready: (data) => data.captureEarlySeen && data.captureLateSeen,
        effect: () => traceBacktraceFinding("m5", "dismissed", M05_LOG_DISMISSED()),
    },
    {
        step: "gretaProfiled",
        ready: (data) => data.gretaSeen,
        effect: () => traceBacktraceFinding("m5", "greta", M05_LOG_GRETA()),
    },
    { step: "handoverOpened", ready: (data) => data.handoverDecrypted },
    { step: "policyRead", ready: (data) => data.formatDecrypted },
];

export const settleEvidence = (quest: M05Quest): void => {
    let advanced = true;
    while (advanced) {
        advanced = false;
        for (const rule of EVIDENCE_RULES) {
            if (!rule.ready(quest.Data)) continue;
            if (advanceStep(quest, M05_GATES, rule.step, rule.effect)) advanced = true;
        }
    }
};
