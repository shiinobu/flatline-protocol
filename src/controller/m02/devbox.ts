import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M02_ADMINS_TABLE, M02_AFFILIATE_TABLE } from "../../content/m02/database.js";
import { M02_GATES } from "../../content/m02/gates.js";
import { M02_DEV_IP, M02_DEV_SUBDOMAIN } from "../../content/m02/network.js";
import { M02_LOG_DEFAULT } from "../../content/m02/quest.js";
import {
    M02_DEPLOY_LOG_CONTENT,
    M02_DEPLOY_LOG_FILE_NAME,
    M02_SYNC_SCRIPT_CONTENT,
    M02_SYNC_SCRIPT_FILE_NAME,
} from "../../content/m02/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M02Quest } from "./types.js";

const bindDumps = (quest: M02Quest): void => {
    quest.Events.on("Sqlmap.DumpTable", (data) => {
        if (data.host !== M02_DEV_IP && data.host !== M02_DEV_SUBDOMAIN) return;

        if (data.tableName === M02_ADMINS_TABLE) {
            advanceStep(quest, M02_GATES, "adminsDumped", () => traceBacktraceFinding("m2", "developer"));
        }

        if (data.tableName === M02_AFFILIATE_TABLE) {
            advanceStep(quest, M02_GATES, "affiliatesDumped", () => traceBacktraceFinding("m2", "ransom"));
        }
    });
};

const bindSession = (quest: M02Quest): void => {
    quest.Events.on("Terminal.SSH.Connected", (data) => {
        if (data !== M02_DEV_IP) return;

        advanceStep(quest, M02_GATES, "devboxAccessed");
    });
};

const bindFiles = (quest: M02Quest): void => {
    quest.Events.on("Terminal.Cat", (data) => {
        if (data.name !== M02_DEPLOY_LOG_FILE_NAME || data.data !== M02_DEPLOY_LOG_CONTENT()) return;

        advanceStep(quest, M02_GATES, "deployLogRead", () => {
            traceBacktraceFinding("m2", "deployLog");
            appendBacktraceLogs("m2", M02_LOG_DEFAULT());
        });
    });

    quest.Events.on("Terminal.Cat", (data) => {
        if (data.name !== M02_SYNC_SCRIPT_FILE_NAME || data.data !== M02_SYNC_SCRIPT_CONTENT()) return;

        advanceStep(quest, M02_GATES, "homeLeadRead", () => traceBacktraceFinding("m2", "homeLead"));
    });
};

export const bindM02Devbox = (quest: M02Quest): void => {
    bindDumps(quest);
    bindSession(quest);
    bindFiles(quest);
};
