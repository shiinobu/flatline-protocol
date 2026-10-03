import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { M04_GATES } from "../../content/m04/gates.js";
import {
    M04_NIGHT_SHIFT_IP,
    M04_QUIET_MIRROR_IP,
    M04_R1_IP,
    M04_R1_PANEL_USERNAME,
    M04_STATIC_HOP_IP,
} from "../../content/m04/network.js";
import { M04_LOG_ORIGIN, M04_LOG_RELAY1, M04_LOG_RELAY2, M04_LOG_CONTROL } from "../../content/m04/quest-logs.js";
import {
    M04_AUTH_LOG_FILE_EXTENSION,
    M04_AUTH_LOG_FILE_NAME,
    M04_WATCHDOG_CONF_FILE_EXTENSION,
    M04_WATCHDOG_CONF_FILE_NAME,
} from "../../content/m04/server-files.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M04Quest } from "./types.js";
import { M04_WORLD } from "./world.js";

const isAuthLog = (file: ReadFile): boolean =>
    isNamedFile(file, M04_AUTH_LOG_FILE_NAME, M04_AUTH_LOG_FILE_EXTENSION);

const isWatchdogConf = (file: ReadFile): boolean =>
    isNamedFile(file, M04_WATCHDOG_CONF_FILE_NAME, M04_WATCHDOG_CONF_FILE_EXTENSION);

const markRelayLog = (quest: M04Quest): void => {
    advanceStep(quest, M04_GATES, "relayLogRead", () => unlock(M04_WORLD, "quietMirrorSsh"));
};

const markControl = (quest: M04Quest): void => {
    advanceStep(quest, M04_GATES, "controlFound", () => {
        traceBacktraceFinding("m4", "control", M04_LOG_CONTROL());
        unlock(M04_WORLD, "controlHost");
    });
};

const bindProfile = (quest: M04Quest): void => {
    const profiled = (): void => {
        advanceStep(quest, M04_GATES, "relayProfiled", () => unlock(M04_WORLD, "routerCrack"));
    };

    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain !== M04_STATIC_HOP_IP) return;
        profiled();
    });

    quest.Events.on("Terminal.Geoip", (data) => {
        if (data !== M04_STATIC_HOP_IP) return;
        profiled();
    });

    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M04_STATIC_HOP_IP && data.ip !== M04_R1_IP) return;
        profiled();
    });
};

const bindHydra = (quest: M04Quest): void => {
    quest.Events.on("Terminal.Hydra", (data) => {
        if (data.ip !== M04_R1_IP) return;
        if (data.credentials.username !== M04_R1_PANEL_USERNAME) return;

        advanceStep(quest, M04_GATES, "hydraRun", () => unlock(M04_WORLD, "staticHopSsh"));
    });
};

const bindSessions = (quest: M04Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "SSH") return;

        if (data.targetIp === M04_STATIC_HOP_IP) {
            advanceStep(quest, M04_GATES, "relay1Accessed", () =>
                traceBacktraceFinding("m4", "relay1", M04_LOG_RELAY1()),
            );
            return;
        }

        if (data.targetIp === M04_QUIET_MIRROR_IP) {
            advanceStep(quest, M04_GATES, "relay2Accessed", () =>
                traceBacktraceFinding("m4", "relay2", M04_LOG_RELAY2()),
            );
        }
    });
};

const bindFiles = (quest: M04Quest): void => {
    onFileRead(quest.Events, (file) => {
        if (isAuthLog(file)) markRelayLog(quest);
        if (isWatchdogConf(file)) markControl(quest);
    });
};

const bindOrigin = (quest: M04Quest): void => {
    const linked = (): void => {
        advanceStep(quest, M04_GATES, "originLinked", () => traceBacktraceFinding("m4", "origin", M04_LOG_ORIGIN()));
    };

    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain !== M04_NIGHT_SHIFT_IP) return;
        linked();
    });

    quest.Events.on("Terminal.Geoip", (data) => {
        if (data !== M04_NIGHT_SHIFT_IP) return;
        linked();
    });
};

export const bindM04Relay = (quest: M04Quest): void => {
    bindProfile(quest);
    bindHydra(quest);
    bindSessions(quest);
    bindFiles(quest);
    bindOrigin(quest);
};
