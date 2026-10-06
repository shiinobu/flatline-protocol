import { Mail } from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { M06_ARCHIVE_PATH } from "../../content/m06/archive.js";
import { M06_GATES } from "../../content/m06/gates.js";
import { M06_HOSTS_LEAD_MAIL } from "../../content/m06/mail.js";
import {
    M06_DOOR_HOST,
    M06_DOOR_MINUTES_PATH,
    M06_ECHOLINE_DOMAIN,
    M06_FILINGS_ARCHIVE_PATH,
    M06_HOLDINGS_PATH,
    M06_MUTUAL_PATH,
    M06_NOMINEES_PATH,
    M06_REGISTRY_DOMAIN,
} from "../../content/m06/network.js";
import {
    M06_LOG_CAPTURE,
    M06_LOG_IDENTITY,
    M06_LOG_INSURER,
    M06_LOG_NOMINEES,
} from "../../content/m06/quest-logs.js";
import type { M06Step } from "../../content/m06/gates.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M06Quest } from "./types.js";
import { M06_WORLD } from "./world.js";

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const REGISTRY_STEPS: readonly (readonly [string, M06Step])[] = [
    [M06_NOMINEES_PATH, "nomineesRead"],
    [M06_FILINGS_ARCHIVE_PATH, "hiddenFilingsFound"],
    [M06_HOLDINGS_PATH, "holdingsRead"],
    [M06_MUTUAL_PATH, "insurerLinked"],
];

const afterStep = (step: M06Step): void => {
    if (step === "nomineesRead") {
        traceBacktraceFinding("m6", "nominees", M06_LOG_NOMINEES());
        return;
    }

    if (step === "insurerLinked") {
        traceBacktraceFinding("m6", "insurer", M06_LOG_INSURER());
        unlock(M06_WORLD, "infraRecords");
        Mail.send(M06_HOSTS_LEAD_MAIL());
    }
};

const visitRegistry = (quest: M06Quest, pathname: string): void => {
    advanceStep(quest, M06_GATES, "registryReached", () => unlock(M06_WORLD, "nomineesRecord"));

    const path = normalizePath(pathname);
    const match = REGISTRY_STEPS.find(([candidate]) => normalizePath(candidate) === path);
    if (match === undefined) return;

    const step = match[1];
    advanceStep(quest, M06_GATES, step, () => afterStep(step));
};

const visitDoor = (quest: M06Quest, pathname: string): void => {
    const path = normalizePath(pathname);

    if (path === normalizePath(M06_DOOR_MINUTES_PATH)) {
        advanceStep(quest, M06_GATES, "identityProven", () =>
            traceBacktraceFinding("m6", "architect", M06_LOG_IDENTITY()),
        );
        return;
    }

    if (path === "") advanceStep(quest, M06_GATES, "doorSeen");
};

const visitArchive = (quest: M06Quest, pathname: string): void => {
    if (normalizePath(pathname) !== normalizePath(M06_ARCHIVE_PATH)) return;
    if (quest.Data.captureSeen) return;

    quest.SetData("captureSeen", true);
    appendBacktraceLogs("m6", M06_LOG_CAPTURE());
};

export const bindM06Pages = (quest: M06Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:") return;

        if (data.hostname === M06_REGISTRY_DOMAIN) {
            visitRegistry(quest, data.pathname);
            return;
        }

        if (data.hostname === M06_DOOR_HOST) {
            visitDoor(quest, data.pathname);
            return;
        }

        if (data.hostname === M06_ECHOLINE_DOMAIN) {
            visitArchive(quest, data.pathname);
        }
    });
};
