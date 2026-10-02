import { Scheduler } from "@hotbunny/hackhub-content-sdk";

import { ATTRCHECK_REVEALED_EVENT } from "../../commands/attrcheck.js";
import { M07_C2_IP } from "../../content/m07/network.js";
import {
    M07_LEDGER_FILE_NAME,
    M07_MANIFEST_FILE_EXTENSION,
    M07_MANIFEST_FILE_NAME,
} from "../../content/m07/server-files.js";
import { trace } from "../../helpers/logger.js";
import type { M07Quest } from "./types.js";

const PROBE_SCOPE = "M07";
const TRACKING_PROBE_KIND = "flatline.m07.probe.tracking";
const TRACKING_PROBE_DELAY = { realMs: 60000 };

Scheduler.register(TRACKING_PROBE_KIND, () => {
    trace(PROBE_SCOPE, "probe:tracking-expired", { kind: TRACKING_PROBE_KIND });
});

const armTrackingProbe = (): void => {
    Scheduler.cancelKind(TRACKING_PROBE_KIND);
    const id = Scheduler.schedule(TRACKING_PROBE_KIND, {}, TRACKING_PROBE_DELAY);
    trace(PROBE_SCOPE, "probe:tracking-armed", { id, delay: TRACKING_PROBE_DELAY });
};

const disarmTrackingProbe = (): void => {
    Scheduler.cancelKind(TRACKING_PROBE_KIND);
    trace(PROBE_SCOPE, "probe:tracking-disarmed", { kind: TRACKING_PROBE_KIND });
};

export const bindM07Probes = (quest: M07Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "METASPLOIT" || data.targetIp !== M07_C2_IP) return;

        trace(PROBE_SCOPE, "probe:metasploit-session", {
            targetIp: data.targetIp,
            targetPort: data.targetPort,
            fromIp: data.fromIp,
            user: data.user?.username,
        });
        armTrackingProbe();
    });

    quest.Events.on("Terminal.Cat", (data) => {
        if (data.name !== M07_MANIFEST_FILE_NAME || data.extension !== M07_MANIFEST_FILE_EXTENSION) return;

        trace(PROBE_SCOPE, "probe:manifest-cat", { name: data.name, extension: data.extension });
    });

    quest.Events.on(ATTRCHECK_REVEALED_EVENT, (data: { readonly id: string; readonly name: string }) => {
        trace(PROBE_SCOPE, "probe:attrcheck-revealed", { id: data.id, name: data.name });
    });

    quest.Events.on("Files.Transfer", (data) => {
        if (data.type !== "DOWNLOAD" || data.file.name !== M07_LEDGER_FILE_NAME) return;

        trace(PROBE_SCOPE, "probe:ledger-download", {
            type: data.type,
            name: data.file.name,
            extension: data.file.extension,
        });
        disarmTrackingProbe();
    });
};
