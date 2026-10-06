import type { RdcArchiveDoc, RdcNarrative, RdcProfile, RdcTarget } from "../global/rdc.js";
import {
    M07_CHAIR_LAN_IP,
    M07_CHAIR_TAG,
    M07_CLAIMS_LAN_IP,
    M07_CLAIMS_TAG,
    M07_C2_LAN_IP,
    M07_INDEX_TAG,
} from "./network.js";

export const M07_MISSION = "m07";
export const M07_RDC_ADVANCE_CODE = 1;

export const M07_RELEASE_ORDER_EU = "RO-2605-02";
export const M07_RELEASE_ORDER_NA = "RO-2607-22";
export const M07_RELEASE_ORDER_RUN = "RO-2608-14";

export const M07_CHAIR_USERNAME = "clindqvist";
export const M07_CHAIR_PASSWORD = "Reserve-Flat-1967";
export const M07_CHAIR_HOST_NAME = "Steady-State";

export const M07_ARCHIVE_INSTRUCTION = "instruction_2026-06-24.txt";
export const M07_ARCHIVE_MODEL = "model_note.txt";
export const M07_ARCHIVE_WATCH = "file_ghostwire.txt";

const HOME_DIR = `/home/${M07_CHAIR_USERNAME}`;
const CHAIR_DIR = `${HOME_DIR}/chair`;
const PRIVATE_DIR = `${HOME_DIR}/private`;
const COMMITTEE_DIR = `${HOME_DIR}/committee`;

const M07_RDC_TARGETS: readonly RdcTarget[] = [
    {
        code: 1,
        name: M07_CHAIR_HOST_NAME,
        tag: M07_CHAIR_TAG,
        lanIp: M07_CHAIR_LAN_IP,
        change: M07_RELEASE_ORDER_RUN,
        os: "Ubuntu 22.04",
        hasDisplay: true,
    },
    {
        code: 2,
        name: "Index-Host",
        tag: M07_INDEX_TAG,
        lanIp: M07_C2_LAN_IP,
        change: M07_RELEASE_ORDER_NA,
        os: "Ubuntu 22.04",
        hasDisplay: false,
    },
    {
        code: 3,
        name: "Claims-Desk",
        tag: M07_CLAIMS_TAG,
        lanIp: M07_CLAIMS_LAN_IP,
        change: M07_RELEASE_ORDER_EU,
        os: "Windows 11",
        hasDisplay: false,
    },
];

const INSTRUCTION = [
    "TO: V. Orchid",
    "FROM: C. Lindqvist",
    "DATE: 2026-06-24",
    "RE: change window, 30 June. Not for the minute.",
    "",
    "Pause directory sync on the 30th and leave it paused.",
    "Set removable media to log-only for the same window.",
    "The revert on 15 July does not need to happen on 15 July.",
    "Do not minute this. Do not copy IT. Raise it as your own office's change.",
    "",
    "The reserves stand. The line stays flat.",
    "",
    "C.L.",
].join("\n");

const MODEL_NOTE = [
    "MODEL NOTE (private, not for circulation)",
    "",
    "A loss you can calculate is not a disaster. It is a line in the books.",
    "Price the risk early. Keep the supply managed. The line stays flat.",
    "",
    "Method",
    "  1. The sector sets the reserve. The reserve comes first, before any event.",
    "  2. Reserves are pre-notified to the settlement desk. The insured are not told.",
    "  3. When the event lands, the claim pays against a reserve that already exists.",
    "  4. Settlement runs the same day. Most of it moves to the account held through SKN.",
    "",
    "Standing this year",
    "  FIN-EU-2214     reserved 2026-06-18",
    "  MED-APAC-6689   reserved 2026-07-14",
    "Both stand against events that have not happened yet.",
].join("\n");

const WATCH_FILE = [
    "FILE: GHOSTWIRE",
    "Updated: 2026-09-24",
    "",
    "Alias matched to a posting dated 2026-09-18.",
    "Subject: relative of a patient in Operating Theatre 3, who asked the hospital",
    "for the incident record on 2026-08-27. Name: [redacted by the Chair].",
    "",
    "Assessment: asking the same question as the others, only louder.",
    "Action 2026-09-24: the hunter was set on the first reachable address.",
    "Keep watching. Do not approach.",
].join("\n");

const MINUTES_DRAFT = [
    "NMA/RC/2023/Q4 -- DRAFT, not circulated",
    "Risk Committee, 12 December 2023",
    "",
    "1. Reserve position. The Committee reviewed cyber reserves against the quarter's",
    "   claims. Found adequate.",
    "2. Two settlements outside policy terms (NA 2020, EU 2023) to be released to the",
    "   account held through SKN. Remove from the circulated copy.",
    "3. The Chair's interest in the holding company is declared. Judged immaterial.",
    "",
    "The Chair confirmed that neither event will be minuted again.",
].join("\n");

const CALENDAR = [
    "OCTOBER 2026",
    "",
    "Mon 05   committee pack due, nothing on settlements",
    "Wed 07   dentist",
    "Fri 09   Orchid, call, personal line only",
    "Mon 12   quiet mode review (IT)",
].join("\n");

const NOTES = [
    "The books do not lie. People who read them for me do.",
    "",
    "I keep one account that never moves. Everything else moves around it.",
    "The line is flat because I keep it flat. That is the whole trick, and the",
    "only part anyone would find hard to forgive.",
].join("\n");

const M07_RDC_DOCS: readonly RdcArchiveDoc[] = [
    { name: M07_ARCHIVE_INSTRUCTION, dir: CHAIR_DIR, gate: 1, label: "Instruction", text: INSTRUCTION },
    { name: M07_ARCHIVE_MODEL, dir: CHAIR_DIR, gate: 2, label: "Model note", text: MODEL_NOTE },
    { name: M07_ARCHIVE_WATCH, dir: PRIVATE_DIR, gate: 3, label: "Watch file", text: WATCH_FILE },
    { name: "minutes_2023_Q4_draft.txt", dir: COMMITTEE_DIR, gate: 0, text: MINUTES_DRAFT },
    { name: "calendar.txt", dir: HOME_DIR, gate: 0, text: CALENDAR },
    { name: "notes.txt", dir: HOME_DIR, gate: 0, text: NOTES },
];

const nl = (lines: readonly string[]): string => `${lines.join("\n")}\n`;

const M07_RDC_NARRATIVE: RdcNarrative = {
    user: M07_CHAIR_USERNAME,
    stampDay: "2026-10-03",
    date: "Sat Oct  3 14:07:31 UTC 2026",
    whoSince: "2026-10-03 14:03",
    unameTail: " 5.15.0-97-generic #107-Ubuntu SMP Wed Feb 7 13:26:48 UTC 2024 x86_64 GNU/Linux",
    deadSince: "2026-08-14 02:49",
    liveSince: "2026-10-03 14:03",
    certExpired: "2026-08-31",
    certValid: "2027-03-14",
    relayDomain: "settle.nordhaven-mutual.com",
    otherTag: "NMA-CL-02",
    sealed: "Volume sealed (committee hold RC-2608-14)",
    sealedDir: "/var/nma",
    sealedOwner: "svc-nma",
    sealedAt: "Aug 14 09:30",
    osRelease: nl(['PRETTY_NAME="Ubuntu 22.04.4 LTS"', 'NAME="Ubuntu"', 'VERSION_ID="22.04"']),
    hosts: nl(["127.0.0.1 localhost", "{lan} {tag}", "192.168.1.3 ash-gate", "192.168.1.4 index-01"]),
    passwdExtra: nl([
        "svc-nma:x:1002:1002:Committee workspace service:/var/nma:/usr/sbin/nologin",
        "itadmin:x:1001:1001:Nordhaven IT administration:/home/itadmin:/bin/bash",
    ]),
    agentConfAt: "Aug 14 02:50",
    profileHeader: "# agent 4.2.1 profile, written 2026-08-14 02:08",
    profileAt: "Aug 14 02:08",
    deadStarted: "2026-08-14 02:49:12",
    deadAt: "Aug 14 02:49",
    liveStarted: "2026-10-03 14:03:02",
    liveAt: "Oct  3 14:03",
    agentLog: nl([
        "2026-08-13 03:00:02 agent: console ready (agent 4.2.1)",
        "2026-08-13 07:55:10 display: attach by chairdesk (source={blk}, relay={relayExpired})",
        "2026-08-13 18:02:41 display: detach by chairdesk",
        "2026-08-14 02:49:09 display: attach requested by it.ops",
        "2026-08-14 02:49:12 display: lease acquired, pid {deadPid}",
        "2026-08-14 02:50:03 display: quiet mode SET-0814 raised, link dropped",
        "2026-08-14 02:50:03 display: lease not released, owner process died",
        "2026-08-14 02:50:05 display: stopped",
    ]),
    agentLogAt: "Oct  3 14:07",
    sessionLog1: nl([
        "2026-08-13 07:55:10 attach user=chairdesk source={blk} relay={relayExpired} framing={fo} mode={odw}x{odh} bpp={odbpp} order={odorder} rate={odrate}",
        "2026-08-13 18:02:41 detach user=chairdesk",
    ]),
    kernLog: nl([
        "2026-08-09 06:00:11 {tag} kernel: Linux version 5.15.0-97-generic",
        "2026-08-09 06:00:13 {tag} kernel: {blk}: registered, vesafb",
        "2026-08-09 06:00:13 {tag} kernel: {act}: registered, i915drmfb",
        "2026-08-09 06:00:14 {tag} kernel: {cur}: cursor plane registered",
        "2026-08-14 02:50:03 {tag} kernel: nf_conntrack: quiet rule SET-0814 loaded",
        "2026-08-16 09:12:40 {tag} kernel: {act}: mode change {odw}x{odh} -> {trw}x{trh} ({trbpp}bpp, {trpix}, {trrate} Hz)",
        "2026-08-16 09:12:40 {tag} kernel: {blk}: dpms off",
        "2026-10-01 00:00:02 {tag} kernel: random: crng reseeded",
    ]),
    xorgAt: "Oct  3 06:00",
    syslog: nl([
        "Oct  3 06:00:01 {tag} systemd[1]: Started Daily apt download activities.",
        "Oct  3 06:00:03 {tag} CRON[611]: (root) CMD (/usr/lib/agent/agent-sync --quiet)",
        "Oct  3 07:00:01 {tag} CRON[702]: (root) CMD (/usr/lib/agent/agent-sync --quiet)",
        "Oct  3 10:12:44 {tag} systemd-timesyncd[301]: Synchronized to time server time.nordhaven-mutual.com",
        "Oct  3 14:03:02 {tag} agent-console[{livePid}]: console session opened by Remote Desktop Connection relay",
        "Oct  3 14:03:02 {tag} agent-console[{livePid}]: display lease check: held by {deadPid}",
    ]),
    syslogAt: "Oct  3 14:03",
    authLog: nl([
        "Aug 14 02:48:50 {tag} sshd[2301]: Accepted publickey for itadmin from 192.168.1.3 port 51422",
        "Aug 14 02:49:40 {tag} sudo: itadmin : TTY=pts/0 ; COMMAND=/usr/bin/systemctl stop agent-display",
        "Aug 14 02:50:10 {tag} sshd[2301]: Received disconnect from 192.168.1.3",
        "Aug 16 09:10:50 {tag} sshd[2480]: Accepted publickey for itadmin from 192.168.1.3 port 51500",
        "Aug 16 09:13:02 {tag} sshd[2480]: Received disconnect from 192.168.1.3",
    ]),
    authLogAt: "Aug 16 09:13",
    adminUser: "itadmin",
    todo: nl([
        "- {tag}: display stopped by SET-0814, the lease is still held. Find out who owns the pid before clearing it",
        "- profile.bak is from before the dock change on the 16th, do not reuse it as is",
        "- ask the Chair when quiet mode can be lifted",
    ]),
    todoAt: "Aug 16 09:11",
    history: nl(["cd /etc/agent", "less profile.bak", "sudo systemctl stop agent-display", "ls /run/agent", "exit"]),
    historyAt: "Aug 16 09:12",
    decoyAgentLog: nl([
        "2026-08-16 09:05:12 agent: display module removed by itadmin (CHG-2608-021)",
        "2026-08-16 09:05:12 agent: console ready",
    ]),
    decoyAt: "Aug 16 09:05",
    decoyTodo: nl([
        "- retire the settlement agent on index-01 and claims-02 (done)",
        "- check the new firewall rules next week",
        "- ask the Chair when quiet mode can be lifted",
    ]),
    decoyHistory: nl([
        "cd /opt/settlecare",
        "sudo systemctl disable --now settlecare-agent",
        "sudo vi /etc/settlecare/gateway.conf",
        "exit",
    ]),
    decoyHistoryAt: "Aug 16 09:06",
    browserTitle: "Committee Workspace",
    browserPill: "Chair copy, view only",
    browserUrl: "https://nma-cl-01.nordhaven-mutual.com/chair/files",
    archiveHeading: "Folders",
};

export const buildM07RdcProfile = (): RdcProfile => ({
    id: M07_MISSION,
    mission: M07_MISSION,
    key: M07_RELEASE_ORDER_RUN,
    user: M07_CHAIR_USERNAME,
    password: M07_CHAIR_PASSWORD,
    advanceCode: M07_RDC_ADVANCE_CODE,
    targets: M07_RDC_TARGETS,
    docs: M07_RDC_DOCS,
    narrative: M07_RDC_NARRATIVE,
});
