import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M03_GATES } from "../../content/m03/gates.js";
import { M03_LEDGER_TABLE } from "../../content/m03/ledger.js";
import { M03_COINDRIFT_IP, M03_LEDGER_DOMAIN, M03_PFSENSE_IP } from "../../content/m03/network.js";
import { M03_LOG_LEDGER, M03_LOG_PORTAL, M03_LOG_PIVOT } from "../../content/m03/quest.js";
import { advanceStep } from "../../middleware/gate.js";
import { releaseForwards, syncForwards } from "./forwards.js";
import type { M03Quest } from "./types.js";

const isLedgerHost = (host: string): boolean => host === M03_COINDRIFT_IP || host === M03_LEDGER_DOMAIN;

const dumpLedger = (quest: M03Quest): void => {
    advanceStep(quest, M03_GATES, "ledgerDumped", () => {
        traceBacktraceFinding("m3", "parentEntity", M03_LOG_LEDGER());
        quest.SetData("forwards", releaseForwards(quest.Data));
    });
};

const bindRouter = (quest: M03Quest): void => {
    quest.Events.on("Network.PortChanges", (data) => {
        if (data.subnet.ip !== M03_PFSENSE_IP) return;

        advanceStep(quest, M03_GATES, "portalReached", () =>
            traceBacktraceFinding("m3", "portal", M03_LOG_PORTAL()),
        );
        if (!quest.Data.portalReached) return;

        const forwards = syncForwards(data.newPorts, quest.Data);
        quest.SetData("forwards", forwards);

        if (forwards.some((forward) => forward.bannered && forward.active)) {
            advanceStep(quest, M03_GATES, "natPivotDone", () =>
                traceBacktraceFinding("m3", "pivot", M03_LOG_PIVOT()),
            );
        }
    });
};

const bindLedger = (quest: M03Quest): void => {
    quest.Events.on("Sqlmap.DumpTable", (data) => {
        if (!isLedgerHost(data.host) || data.tableName !== M03_LEDGER_TABLE) return;

        dumpLedger(quest);
    });

    quest.Events.on("Database.Connected", (data) => {
        if (!isLedgerHost(data.host)) return;

        dumpLedger(quest);
    });
};

export const bindM03Pivot = (quest: M03Quest): void => {
    bindRouter(quest);
    bindLedger(quest);
};
