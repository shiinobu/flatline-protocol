import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead } from "../../components/file-reads.js";
import { M02_ADMINS_TABLE, M02_AFFILIATE_TABLE } from "../../content/m02/database.js";
import { M02_GATES } from "../../content/m02/gates.js";
import { M02_DEV_IP, M02_DEV_SUBDOMAIN } from "../../content/m02/network.js";
import { M02_LOG_DEFAULT, M02_LOG_DEVELOPER, M02_LOG_RANSOM, M02_LOG_HOME } from "../../content/m02/quest.js";
import {
    M02_DEPLOY_LOG_FILE_EXTENSION,
    M02_DEPLOY_LOG_FILE_NAME,
    M02_SYNC_SCRIPT_FILE_EXTENSION,
    M02_SYNC_SCRIPT_FILE_NAME,
} from "../../content/m02/server-files.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M02Quest } from "./types.js";

const bindDumps = (quest: M02Quest): void => {
    quest.Events.on("Sqlmap.DumpTable", (data) => {
        if (data.host !== M02_DEV_IP && data.host !== M02_DEV_SUBDOMAIN) return;

        if (data.tableName === M02_ADMINS_TABLE) {
            advanceStep(quest, M02_GATES, "adminsDumped", () =>
                traceBacktraceFinding("m2", "developer", M02_LOG_DEVELOPER()),
            );
        }

        if (data.tableName === M02_AFFILIATE_TABLE) {
            advanceStep(quest, M02_GATES, "affiliatesDumped", () =>
                traceBacktraceFinding("m2", "ransom", M02_LOG_RANSOM()),
            );
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
    onFileRead(quest.Events, (file) => {
        if (isNamedFile(file, M02_DEPLOY_LOG_FILE_NAME, M02_DEPLOY_LOG_FILE_EXTENSION)) {
            advanceStep(quest, M02_GATES, "deployLogRead", () =>
                traceBacktraceFinding("m2", "deployLog", M02_LOG_DEFAULT()),
            );
        }

        if (isNamedFile(file, M02_SYNC_SCRIPT_FILE_NAME, M02_SYNC_SCRIPT_FILE_EXTENSION)) {
            advanceStep(quest, M02_GATES, "homeLeadRead", () =>
                traceBacktraceFinding("m2", "homeLead", M02_LOG_HOME()),
            );
        }
    });
};

export const bindM02Devbox = (quest: M02Quest): void => {
    bindDumps(quest);
    bindSession(quest);
    bindFiles(quest);
};
