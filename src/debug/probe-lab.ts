import {
    Command,
    Events,
    Network,
    NetworkDeviceType,
    SaveStorage,
    Scheduler,
    Shell,
    Time,
    UI,
    Website,
    type ChildSubnetDefinition,
    type CommandAutoComplete,
    type CommandTools,
    type DynamicWebsitePageDefinition,
    type NetworkFileMap,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { OPEN_FILE_READ_EVENT } from "../commands/open.js";
import { isBreachActive, resetBreach, startBreach, type BreachSpec } from "../components/desktop-breach.js";
import { buildIncidentLog } from "../components/kernel-layout.js";
import { openSealedBytes, readableText, sealText } from "../components/text-seal.js";
import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

const PROBE_LAB_REV = "r3 session probes, close and breach";
const PROBE_LAB_ROUTER_IP = "198.18.2.1";
const PROBE_LAB_DEVICE_IP = "198.18.2.2";
const PROBE_LAB_DEVICE_LAN_IP = "192.168.1.2";
const PROBE_LAB_RDP_PORT = 46721;
const PROBE_LAB_RDP_INTERNAL_PORT = 3389;
const PROBE_LAB_RDP_VERSION = "1.0.0";
const PROBE_LAB_RDP_SERVICE = "FreeRDP";
const PROBE_LAB_MODULE = "exploit/rdp/cve_2019_0708_bluekeep";
const PROBE_LAB_NOTE_NAME = "probe_note";
const PROBE_LAB_NOTE_EXTENSION = "txt";
const PROBE_LAB_NOTE_TEXT = "Probe note. If open prints this line at the meterpreter prompt, P3 passes.";
const PROBE_LAB_LEDGER_NAME = "ledger_probe";
const PROBE_LAB_LEDGER_EXTENSION = "enc";
const PROBE_LAB_LEDGER_DATA = "5a1f00c3e97b24d8";
const PROBE_LAB_TIMER_JOB = "flatline.probelab.timer";
const PROBE_LAB_LAST_KEY = "flatline.probelab.last";
const PROBE_LAB_DEFAULT_SECONDS = 60;
const PROBE_LAB_CLOSE_DEFAULT_SECONDS = 20;
const PROBE_LAB_BREACH_DELAY_SECONDS = 25;
const PROBE_LAB_BREACH_HOLD_SECONDS = 30;
const PROBE_LAB_BREACH_RELEASE_JOB = "flatline.probelab.breachRelease";
const PROBE_LAB_BREACH_MISSION = "probe-lab";
const PROBE_LAB_BREACH_ALIAS = "probe-lab";
const PROBE_LAB_MAX_SECONDS = 600;
const PROBE_LAB_HOST = "probe-lab.pacificcare-health.org";
const PROBE_LAB_TOKEN_KEY = "PROBE-KEY-01";
const PROBE_LAB_TOKEN_PLAIN = "labuser:Lab-Pass-0000:192.168.1.40:LAB-0000-00:LAB-TAG-01";
const PROBE_LAB_LONG_KEY = "PROBE-KEY-02";
const PROBE_LAB_LONG_PLAIN = "Probe long seal. ".repeat(12).slice(0, 190);
const PROBE_LAB_INVALID = "That is not valid ciphertext. Expected hexadecimal text.";
const PROBE_LAB_UNREADABLE = "The result is not readable text. Check the passphrase.";
const PROBE_LAB_DECRYPTED = "Decrypted.";
const PROBE_LAB_PROFILE_TARGETS = 3;
const PROBE_LAB_PROFILE_DOCS = 6;
const PROBE_LAB_PROFILE_DOC_CHARS = 700;
const PROBE_LAB_HEX_WIDTH = 48;
const PROBE_LAB_HEX_MIN_WIDTH = 8;
const PROBE_LAB_HEX_MAX_WIDTH = 200;

type ProbeLabCloseCommand = "exit" | "back";
type ProbeLabAction = ProbeLabCloseCommand | "breach";

interface ProbeLabTimer {
    readonly label: string;
    readonly seconds: number;
    readonly armedAt: number;
    readonly scale: number;
    readonly action?: ProbeLabAction;
    readonly holdSeconds?: number;
}

interface ProbeLabSeal {
    readonly ok: boolean;
    readonly msg: string;
    readonly received: number;
    readonly length: number;
    readonly match: "token" | "long" | "none";
    readonly text?: string;
}

interface ProbeLabLong {
    readonly length: number;
    readonly sum: number;
    readonly head: string;
    readonly tail: string;
}

interface ProbeLabProfile {
    readonly id: string;
    readonly targets: readonly {
        readonly tag: string;
        readonly lanIp: string;
        readonly change: string;
        readonly hasDisplay: boolean;
        readonly users: readonly string[];
    }[];
    readonly docs: readonly { readonly id: string; readonly title: string; readonly body: string }[];
}

interface ProbeLabOpenRead {
    readonly id: string;
    readonly name: string;
    readonly extension?: string;
}

const checksum = (text: string): number =>
    Array.from({ length: text.length }, (_unused, index) => text.charCodeAt(index)).reduce(
        (sum, code) => (sum * 31 + code) >>> 0,
        7,
    );

const describeLong = (value: unknown): ProbeLabLong => {
    const text = typeof value === "string" ? value : "";
    return { length: text.length, sum: checksum(text), head: text.slice(0, 8), tail: text.slice(-8) };
};

const isProbeLabUp = (): boolean => Network.getSubnet(PROBE_LAB_ROUTER_IP) !== null;

interface ProbeLabQueuedAction {
    readonly action: ProbeLabAction;
    readonly seconds: number;
    readonly holdSeconds?: number;
}

let probeSessionOpen = false;
let queuedAction: ProbeLabQueuedAction | null = null;

const labFileNames = (): readonly NetworkFileMap[] => [
    { name: PROBE_LAB_NOTE_NAME, extension: PROBE_LAB_NOTE_EXTENSION, data: PROBE_LAB_NOTE_TEXT },
    { name: PROBE_LAB_LEDGER_NAME, extension: PROBE_LAB_LEDGER_EXTENSION, data: PROBE_LAB_LEDGER_DATA },
];

const buildProbeLabDevice = (): ChildSubnetDefinition => ({
    ip: PROBE_LAB_DEVICE_IP,
    lanIp: PROBE_LAB_DEVICE_LAN_IP,
    type: NetworkDeviceType.Device,
    name: "PROBE-LAB: session host",
    users: [Network.createUser({ username: "guest", online: true })],
    ports: [
        {
            external: PROBE_LAB_RDP_PORT,
            internal: PROBE_LAB_RDP_INTERNAL_PORT,
            active: true,
            service: "rdp",
            version: `${PROBE_LAB_RDP_SERVICE} ${PROBE_LAB_RDP_VERSION}`,
        },
    ],
    rootFiles: [...labFileNames()],
});

const createProbeLab = (): void => {
    Network.createSubnetNetwork({
        ip: PROBE_LAB_ROUTER_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [buildProbeLabDevice()],
    });
    const deviceRows = Network.getSubnet(PROBE_LAB_DEVICE_IP)?.ports ?? [];
    trace("PROBELAB", `up router=${PROBE_LAB_ROUTER_IP} device=${PROBE_LAB_DEVICE_IP} deviceRows=${JSON.stringify(deviceRows)}`);
};

const describeAction = (action: ProbeLabAction): string =>
    action === "breach" ? "startBreach" : `Shell.exec("${action}")`;

const armTimer = (label: string, seconds: number, action?: ProbeLabAction, holdSeconds?: number): string => {
    Scheduler.cancelKind(PROBE_LAB_TIMER_JOB);
    const timer: ProbeLabTimer = {
        label,
        seconds,
        armedAt: Date.now(),
        scale: Time.scale(),
        ...(action === undefined ? {} : { action }),
        ...(holdSeconds === undefined ? {} : { holdSeconds }),
    };
    Scheduler.schedule(PROBE_LAB_TIMER_JOB, timer, { realMs: seconds * 1000 });
    const following = action === undefined ? "" : `, then ${describeAction(action)}`;
    const text = `timer "${label}" armed for ${seconds} s${following} (clock scale ${timer.scale}, running=${Time.isRunning()})`;
    trace("PROBELAB", text);
    UI.toast(`probelab: ${text}`, "info");
    return text;
};

const disarmTimer = (reason: string): string => {
    const jobs = Scheduler.list(PROBE_LAB_TIMER_JOB);
    if (jobs.length === 0) return `${reason}: no timer was armed`;

    const remaining = Scheduler.remaining(jobs[0].id);
    const left = remaining === null ? "unknown" : `${Math.round(Time.toRealMs(remaining))} ms`;
    Scheduler.cancelKind(PROBE_LAB_TIMER_JOB);

    const text = `${reason}: timer disarmed with ${left} left, pending now ${Scheduler.list(PROBE_LAB_TIMER_JOB).length}`;
    SaveStorage.set(PROBE_LAB_LAST_KEY, text);
    trace("PROBELAB", text);
    UI.toast(`probelab: ${text}`, "success");
    return text;
};

const closeSession = async (command: ProbeLabCloseCommand): Promise<string> => {
    if (!probeSessionOpen) return `close ${command} skipped: no open session is tracked, nothing was sent`;

    const startedAt = Date.now();
    try {
        await Shell.exec(command);
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);
        return `close ${command} rejected after ${Date.now() - startedAt} ms: ${reason}`;
    }

    return `close ${command} resolved after ${Date.now() - startedAt} ms, session tracked open=${probeSessionOpen}`;
};

const probeBreachSpec = (): BreachSpec => ({
    scope: "PROBELAB",
    mission: PROBE_LAB_BREACH_MISSION,
    ip: PROBE_LAB_DEVICE_IP,
    alias: PROBE_LAB_BREACH_ALIAS,
    buildIncidentLog: (expectedSrcversion, source) =>
        buildIncidentLog({ ip: source, expectedSrcversion, gateway: PROBE_LAB_ROUTER_IP }),
});

const runBreachProbe = async (holdSeconds: number): Promise<string> => {
    if (isBreachActive()) return "breach skipped: another breach is already active";

    const started = await startBreach(probeBreachSpec());
    if (!started) return "breach not started: startBreach returned false";

    if (holdSeconds === 0) return `breach started, session tracked open=${probeSessionOpen}, no auto release, repair it in the recovery console`;

    Scheduler.cancelKind(PROBE_LAB_BREACH_RELEASE_JOB);
    Scheduler.schedule(PROBE_LAB_BREACH_RELEASE_JOB, {}, { realMs: holdSeconds * 1000 });
    return `breach started, session tracked open=${probeSessionOpen}, auto release in ${holdSeconds} s`;
};

const runBreachRelease = (): void => {
    const wasActive = isBreachActive();
    resetBreach();
    const text = `breach release: was active=${wasActive}, session tracked open=${probeSessionOpen}`;
    SaveStorage.set(PROBE_LAB_LAST_KEY, text);
    trace("PROBELAB", text);
    UI.toast(`probelab: ${text}`, "success");
};

const runAction = (timer: ProbeLabTimer, action: ProbeLabAction): Promise<string> =>
    action === "breach" ? runBreachProbe(timer.holdSeconds ?? PROBE_LAB_BREACH_HOLD_SECONDS) : closeSession(action);

const runTimerExpired = async (timer: ProbeLabTimer): Promise<void> => {
    const wantedMs = timer.seconds * 1000;
    const elapsedMs = Date.now() - timer.armedAt;
    const text = `timer "${timer.label}" expired: elapsed ${elapsedMs} ms, wanted ${wantedMs} ms, drift ${elapsedMs - wantedMs} ms, scale ${timer.scale} to ${Time.scale()}, running=${Time.isRunning()}`;
    SaveStorage.set(PROBE_LAB_LAST_KEY, text);
    trace("PROBELAB", text);
    UI.toast(`probelab: ${timer.label} expired after ${(elapsedMs / 1000).toFixed(1)} s (wanted ${timer.seconds} s)`, "warning");
    if (timer.action === undefined) return;

    const actionText = await runAction(timer, timer.action);
    SaveStorage.set(PROBE_LAB_LAST_KEY, `${text}; ${actionText}`);
    trace("PROBELAB", actionText);
    UI.toast(`probelab: ${actionText}`, "warning");
};

const fileLabel = (name: string, extension: string | undefined): string =>
    extension === undefined || extension === "" ? name : `${name}.${extension}`;

const registerProbeLabListeners = (): void => {
    Scheduler.register<ProbeLabTimer>(PROBE_LAB_TIMER_JOB, runTimerExpired);
    Scheduler.register(PROBE_LAB_BREACH_RELEASE_JOB, runBreachRelease);

    Events.on("RemoteConnection.Established", (connection) => {
        if (!isProbeLabUp() || connection.t !== "METASPLOIT" || connection.targetIp !== PROBE_LAB_DEVICE_IP) return;

        probeSessionOpen = true;
        trace("PROBELAB", `session established target=${connection.targetIp}:${connection.targetPort ?? "-"} from=${connection.fromIp}`);
        const queued = queuedAction;
        queuedAction = null;
        if (queued === null) armTimer("session", PROBE_LAB_DEFAULT_SECONDS);
        else armTimer(`probe-${queued.action}`, queued.seconds, queued.action, queued.holdSeconds);
    });

    Events.on("RemoteConnection.Disconnected", (connection) => {
        if (!isProbeLabUp() || connection.targetIp !== PROBE_LAB_DEVICE_IP) return;

        probeSessionOpen = false;
        trace("PROBELAB", `session closed target=${connection.targetIp} type=${connection.t} pendingTimers=${Scheduler.list(PROBE_LAB_TIMER_JOB).length}`);
        UI.toast(`probelab: Disconnected event seen (${connection.t})`, "info");
    });

    Events.on("Files.Transfer", (transfer) => {
        if (!isProbeLabUp()) return;

        const label = fileLabel(transfer.file.name, transfer.file.extension);
        trace("PROBELAB", `transfer ${transfer.type} ${label} id=${transfer.file.id} parent=${transfer.file.parent ?? "-"}`);
        UI.toast(`probelab: ${transfer.type} ${label} seen`, "info");
        if (transfer.type === "DOWNLOAD" && transfer.file.name === PROBE_LAB_LEDGER_NAME) disarmTimer("download");
    });

    Events.on(OPEN_FILE_READ_EVENT, (read: ProbeLabOpenRead) => {
        if (!isProbeLabUp() || read.name !== PROBE_LAB_NOTE_NAME) return;

        trace("PROBELAB", `open event ${fileLabel(read.name, read.extension)} id=${read.id}`);
        UI.toast("probelab: open event seen for the remote note", "info");
    });
};

if (isDebug) {
    registerProbeLabListeners();
    trace("PROBELAB", `loaded rev=${PROBE_LAB_REV}`);
}

const buildProbeLabProfile = (): ProbeLabProfile => ({
    id: "probe",
    targets: Array.from({ length: PROBE_LAB_PROFILE_TARGETS }, (_unused, index) => ({
        tag: `LAB-TAG-0${index + 1}`,
        lanIp: `192.168.1.${40 + index}`,
        change: `LAB-0000-0${index + 1}`,
        hasDisplay: index === 0,
        users: ["labuser", "labadmin"],
    })),
    docs: Array.from({ length: PROBE_LAB_PROFILE_DOCS }, (_unused, index) => ({
        id: `doc-${index + 1}`,
        title: `Probe document ${index + 1}`,
        body: `Probe body ${index + 1}. `.repeat(PROBE_LAB_PROFILE_DOC_CHARS).slice(0, PROBE_LAB_PROFILE_DOC_CHARS),
    })),
});

const openProbeSeal = (hex: string, key: string): ProbeLabSeal => {
    const bytes = openSealedBytes(hex, key);
    if (bytes === null) return { ok: false, msg: PROBE_LAB_INVALID, received: hex.length, length: 0, match: "none" };

    const text = readableText(bytes);
    if (text === null) return { ok: false, msg: PROBE_LAB_UNREADABLE, received: hex.length, length: bytes.length, match: "none" };

    const match = text === PROBE_LAB_TOKEN_PLAIN ? "token" : text === PROBE_LAB_LONG_PLAIN ? "long" : "none";
    return { ok: true, msg: PROBE_LAB_DECRYPTED, received: hex.length, length: bytes.length, match, text };
};

const PROBE_LAB_SCRIPT = `
var out = document.getElementById("out");
function line(text) {
    var row = document.createElement("div");
    row.textContent = text;
    out.insertBefore(row, out.firstChild);
    if (typeof flatlineProbeReport === "function") flatlineProbeReport(text);
}
function sum(text) {
    var h = 7, i;
    for (i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
}
function hexRun(count) {
    var s = "", i = 0, v;
    while (s.length < count) { v = (i * 37 + 11) & 255; s += (v < 16 ? "0" : "") + v.toString(16); i++; }
    return s.slice(0, count);
}
function guard(name, work) {
    try { work(); } catch (e) { line(name + " THREW " + e); }
}
document.getElementById("decode").addEventListener("click", function () {
    guard("decode", function () {
        var hex = document.getElementById("hex").value, key = document.getElementById("key").value;
        var r = flatlineProbeOpen(hex, key);
        line("decode: page sent " + hex.length + " chars, mod received " + r.received + ", ok=" + r.ok + ", match=" + r.match + ", " + (r.text || r.msg));
    });
});
document.getElementById("long").addEventListener("click", function () {
    guard("long", function () {
        var text = hexRun(380), r = flatlineProbeLong(text);
        var same = r.length === text.length && r.sum === sum(text) && r.head === text.slice(0, 8) && r.tail === text.slice(-8);
        line("long 380 digits: mod saw " + r.length + (same ? " OK" : " MISMATCH"));
    });
});
document.getElementById("profile").addEventListener("click", function () {
    guard("profile", function () {
        var profile = flatlineProbeProfile(), info = flatlineProbeProfileInfo(), json = JSON.stringify(profile);
        var same = json.length === info.length && sum(json) === info.sum;
        line("profile: " + profile.targets.length + " targets, " + profile.docs.length + " docs, " + json.length + " chars of " + info.length + (same ? " OK" : " MISMATCH"));
    });
});
line("loaded: " + ["flatlineProbeOpen", "flatlineProbeLong", "flatlineProbeProfile"].map(function (n) { return n + " " + typeof window[n]; }).join(", "));
`;

const renderProbeLabPage = (): string =>
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:32px;font:15px sans-serif;background:#0d1218;color:#e6ebf2">' +
    "<h1>Session probes</h1>" +
    "<p>P4: run <b>probelab hex</b> in the terminal, select every line of one seal with the mouse, copy them, paste them below with the key printed above them.</p>" +
    '<p><textarea id="hex" rows="5" style="width:100%;font:13px monospace" placeholder="paste hex here"></textarea></p>' +
    '<p><input id="key" style="width:60%;font:13px monospace" placeholder="key"> ' +
    '<button id="decode" style="padding:8px 14px;font:inherit">Decode</button></p>' +
    "<p>P5 and P6: " +
    '<button id="profile" style="margin-right:8px;padding:8px 14px;font:inherit">Fetch the large profile object</button>' +
    '<button id="long" style="padding:8px 14px;font:inherit">Send 380 hex digits</button></p>' +
    '<div id="out" style="font:13px monospace;color:#9fe3c0"></div>' +
    `<script>${PROBE_LAB_SCRIPT}</script></body></html>`;

@registerDebugWebsite
export class ProbeLabWebsite extends Website {
    SiteName = "Session Probe Lab";
    Host = PROBE_LAB_HOST;
    Icon = "";

    Exports = {
        flatlineProbeOpen: (hex: string, key: string): ProbeLabSeal => {
            const result = openProbeSeal(String(hex), String(key));
            trace(
                "PROBELAB",
                `seal received=${String(hex).length} chars key=${JSON.stringify(String(key))} ok=${result.ok} length=${result.length} match=${result.match}`,
            );
            return result;
        },
        flatlineProbeLong: (text: string): ProbeLabLong => {
            const result = describeLong(text);
            trace("PROBELAB", `long type=${typeof text} length=${result.length} sum=${result.sum}`);
            return result;
        },
        flatlineProbeProfile: (): ProbeLabProfile => {
            const profile = buildProbeLabProfile();
            trace("PROBELAB", `profile served chars=${JSON.stringify(profile).length}`);
            return profile;
        },
        flatlineProbeProfileInfo: (): { readonly length: number; readonly sum: number } => {
            const json = JSON.stringify(buildProbeLabProfile());
            return { length: json.length, sum: checksum(json) };
        },
        flatlineProbeReport: (text: string): void => {
            trace("PROBELAB", `page saw ${text}`);
        },
    };

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (): PageMetadata => ({
                title: "Session Probes",
                description: "Debug probe for pasted hex, a large Exports object and a long Exports string.",
                html: renderProbeLabPage(),
            }),
        },
    ];
}

const printProbeLabSheet = (tools: CommandTools): void => {
    tools.println(`probelab rev ${PROBE_LAB_REV}`);
    tools.println(`Host    : ${PROBE_LAB_DEVICE_IP} (RDP external ${PROBE_LAB_RDP_PORT} -> internal ${PROBE_LAB_RDP_INTERNAL_PORT}, ${PROBE_LAB_RDP_SERVICE} ${PROBE_LAB_RDP_VERSION}), router ${PROBE_LAB_ROUTER_IP}`);
    tools.println(`Exploit : msfconsole, use ${PROBE_LAB_MODULE}, set RHOST ${PROBE_LAB_DEVICE_IP}, RPORT ${PROBE_LAB_RDP_PORT}, VERSION ${PROBE_LAB_RDP_VERSION}, run`);
    tools.println(`Files   : /${fileLabel(PROBE_LAB_NOTE_NAME, PROBE_LAB_NOTE_EXTENSION)} and /${fileLabel(PROBE_LAB_LEDGER_NAME, PROBE_LAB_LEDGER_EXTENSION)}`);
    tools.println(`Site    : https://${PROBE_LAB_HOST}`);
    tools.println("P1a: open a session, do nothing, a toast must say the 60 s timer expired about 60 s later.");
    tools.println("P1b: open a session, run download on the .enc file in time, a toast must say the timer was disarmed and nothing fires later.");
    tools.println("P1c: probelab arm 60, then stand on the site page (or any page) until the toast.");
    tools.println("P2 : the download in P1b must show a DOWNLOAD transfer toast and a transfer line in the log.");
    tools.println("P3 : at the meterpreter prompt run open on the .txt file, it must print the note and a toast must confirm the open event.");
    tools.println("P4 : probelab hex [width], copy every line of one seal, paste into the site page, Decode. Repeat in Cipher Desk.");
    tools.println("P5 and P6: press the two buttons on the site page, each line must end with OK.");
    tools.println("P7a: probelab close exit 20, then open a session. 20 s after it opens the timer sends exit. Check: explorer window closed, terminal still open on a normal prompt, one Disconnected toast.");
    tools.println("P7b: same with probelab close back 20. Note what stays open and what the prompt says afterwards.");
    tools.println("P7c: probelab close exit 20, open two terminals, run the exploit in the second one. Note which terminal exited.");
    tools.println("P7d: probelab close exit 30, open a session, type exit yourself before 30 s. The toast must say skipped and no window may close.");
    tools.println("P8 : probelab breach 25 30, open a session and run explorer. 25 s after the session opens the breach starts. Check: are the terminal and the explorer hidden, is the recovery console on top, do they come back after the 30 s release, is the session still alive (status says tracked open).");
    tools.println("P8b: probelab breach 25 0 keeps the breach until you repair it in the recovery console. If you get stuck, probelab breach off.");
};

const printProbeLabStatus = (tools: CommandTools): void => {
    tools.println(`Lab network : ${isProbeLabUp() ? "up" : "down"}`);
    tools.println(`Session     : ${probeSessionOpen ? "tracked open" : "none tracked"}`);
    tools.println(`Queued      : ${queuedAction === null ? "none" : `${queuedAction.action} after ${queuedAction.seconds} s`}`);
    tools.println(`Breach      : ${isBreachActive() ? "active" : "none"}`);
    const jobs = Scheduler.list(PROBE_LAB_TIMER_JOB);
    if (jobs.length === 0) tools.println("Timer       : none pending");
    for (const job of jobs) {
        const remaining = Scheduler.remaining(job.id);
        tools.println(`Timer       : ${remaining === null ? "unknown" : `${Math.round(Time.toRealMs(remaining))} ms`} left`);
    }
    tools.println(`Last result : ${SaveStorage.get<string>(PROBE_LAB_LAST_KEY) ?? "none"}`);
};

const wrapHex = (hex: string, width: number): readonly string[] =>
    Array.from({ length: Math.ceil(hex.length / width) }, (_unused, index) => hex.slice(index * width, (index + 1) * width));

const printWrappedHex = (tools: CommandTools, label: string, hex: string, width: number): void => {
    const rows = wrapHex(hex, width);
    tools.println(`${label}, ${hex.length} digits in ${rows.length} lines:`);
    for (const row of rows) tools.println(row);
};

const printProbeLabHex = (tools: CommandTools, width: number): void => {
    printWrappedHex(tools, `Seal A, key ${PROBE_LAB_TOKEN_KEY}`, sealText(PROBE_LAB_TOKEN_PLAIN, PROBE_LAB_TOKEN_KEY), width);
    printWrappedHex(tools, `Seal B, key ${PROBE_LAB_LONG_KEY}`, sealText(PROBE_LAB_LONG_PLAIN, PROBE_LAB_LONG_KEY), width);
};

const parseBoundedInteger = (raw: string | undefined, fallback: number, min: number, max: number): number | null => {
    if (raw === undefined) return fallback;

    const value = Number(raw);
    return Number.isInteger(value) && value >= min && value <= max ? value : null;
};

const parseSeconds = (raw: string | undefined): number | null =>
    parseBoundedInteger(raw, PROBE_LAB_DEFAULT_SECONDS, 1, PROBE_LAB_MAX_SECONDS);

const parseHexWidth = (raw: string | undefined): number | null =>
    parseBoundedInteger(raw, PROBE_LAB_HEX_WIDTH, PROBE_LAB_HEX_MIN_WIDTH, PROBE_LAB_HEX_MAX_WIDTH);

const parseCloseCommand = (raw: string | undefined): ProbeLabCloseCommand | null => {
    if (raw === undefined || raw === "exit") return "exit";

    return raw === "back" ? "back" : null;
};

@registerDebugCommand({ default: true, scope: "both" })
export class ProbeLabCommand extends Command {
    CommandName = "probelab";
    Description = "debug: M7 session probes (timer inside a session, download, remote open, pasted hex, large Exports)";
    Autocomplete: CommandAutoComplete[] = [
        { label: "probelab", type: "STRING" },
        { label: "<up|down|arm|close|breach|cancel|status|hex>", type: "STRING" },
        { label: "[seconds|width|exit|back|off]", type: "STRING" },
        { label: "[seconds]", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const args = tools.getArgs();
        trace("PROBELAB", `run rev=${PROBE_LAB_REV} args=[${args.join(" ")}]`);

        try {
            await this.execute(tools, args[0], args[1], args[2]);
        } catch (error: unknown) {
            const reason = error instanceof Error ? error.message : String(error);
            trace("PROBELAB", `run failed: ${reason}`);
            tools.printError(`probelab failed: ${reason}`);
        }
    }

    private async execute(
        tools: CommandTools,
        action: string | undefined,
        argument: string | undefined,
        extra: string | undefined,
    ): Promise<void> {
        if (action === undefined) {
            printProbeLabSheet(tools);
            return;
        }
        if (action === "status") {
            printProbeLabStatus(tools);
            return;
        }
        if (action === "hex") {
            const width = parseHexWidth(argument);
            if (width === null) {
                tools.printError(`Usage: probelab hex [${PROBE_LAB_HEX_MIN_WIDTH}-${PROBE_LAB_HEX_MAX_WIDTH}]`);
                return;
            }
            printProbeLabHex(tools, width);
            return;
        }
        if (action === "cancel") {
            queuedAction = null;
            tools.println(disarmTimer("manual"));
            return;
        }
        if (action === "arm") {
            const seconds = parseSeconds(argument);
            if (seconds === null) {
                tools.printError(`Usage: probelab arm [1-${PROBE_LAB_MAX_SECONDS}]`);
                return;
            }
            tools.println(armTimer("manual", seconds));
            return;
        }
        if (action === "close") {
            const command = parseCloseCommand(argument);
            const seconds = parseBoundedInteger(extra, PROBE_LAB_CLOSE_DEFAULT_SECONDS, 1, PROBE_LAB_MAX_SECONDS);
            if (command === null || seconds === null) {
                tools.printError(`Usage: probelab close [exit|back] [1-${PROBE_LAB_MAX_SECONDS}]`);
                return;
            }
            if (probeSessionOpen) {
                tools.println(armTimer(`close-${command}`, seconds, command));
                return;
            }
            queuedAction = { action: command, seconds };
            tools.println(`close ${command} queued: ${seconds} s after the next probe session opens, the timer sends Shell.exec("${command}")`);
            return;
        }
        if (action === "breach") {
            if (argument === "off") {
                runBreachRelease();
                tools.println("Breach released.");
                return;
            }
            const delay = parseBoundedInteger(argument, PROBE_LAB_BREACH_DELAY_SECONDS, 1, PROBE_LAB_MAX_SECONDS);
            const hold = parseBoundedInteger(extra, PROBE_LAB_BREACH_HOLD_SECONDS, 0, PROBE_LAB_MAX_SECONDS);
            if (delay === null || hold === null) {
                tools.printError(`Usage: probelab breach [off | delay 1-${PROBE_LAB_MAX_SECONDS}] [hold 0-${PROBE_LAB_MAX_SECONDS}, 0 = repair it yourself]`);
                return;
            }
            if (probeSessionOpen) {
                tools.println(armTimer("probe-breach", delay, "breach", hold));
                return;
            }
            queuedAction = { action: "breach", seconds: delay, holdSeconds: hold };
            tools.println(`breach queued: ${delay} s after the next probe session opens, held ${hold === 0 ? "until you repair it" : `${hold} s`}`);
            return;
        }
        if (action === "down") {
            if (!isProbeLabUp()) {
                tools.printWarning("Probe lab network is not up.");
                return;
            }
            await Network.destroyNetwork(PROBE_LAB_ROUTER_IP);
            trace("PROBELAB", `down router=${PROBE_LAB_ROUTER_IP}`);
            tools.printSuccess("Probe lab network torn down.");
            return;
        }
        if (action === "up") {
            if (isProbeLabUp()) {
                tools.printWarning("Probe lab network is already up. Run: probelab down");
                return;
            }
            if (Network.getSubnet(PROBE_LAB_DEVICE_IP) !== null) {
                tools.printError(`${PROBE_LAB_DEVICE_IP} is already used by another subnet, so the probe host cannot be created there.`);
                return;
            }
            createProbeLab();
            tools.printSuccess("Probe lab network is up.");
            printProbeLabSheet(tools);
            return;
        }
        tools.printError("Usage: probelab [up|down|arm [seconds]|close [exit|back] [seconds]|breach [off|delay] [hold]|cancel|status|hex [width]]");
    }
}
