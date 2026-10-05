import type { RdcArchiveDoc, RdcProfile, RdcTarget } from "../global/rdc.js";
import { GRETA_SHORT_NAME, VIVIEN_ORCHID_FULL_NAME } from "../global/characters.js";
import { M01_LEDGERVAULT_PROJECT_LABEL } from "../global/case.js";
import { RANSOM_BATCH_HOSPITAL, formatUsd } from "../global/finance.js";
import {
    M05_BEDSIDE_ASSET_TAG,
    M05_BEDSIDE_CHANGE,
    M05_BEDSIDE_CODENAME,
    M05_BEDSIDE_LAN_IP,
    M05_COLD_CHART_CHANGE,
    M05_COLD_CHART_CODENAME,
    M05_COLD_CHART_LAN_IP,
    M05_COLD_CHART_TAG,
    M05_GRETA_PASSWORD,
    M05_GRETA_USERNAME,
    M05_HOLD_MATTER,
    M05_LEAD_APRON_CHANGE,
    M05_LEAD_APRON_CODENAME,
    M05_LEAD_APRON_LAN_IP,
    M05_LEAD_APRON_TAG,
    M05_PAY_STATION_CHANGE,
    M05_PAY_STATION_CODENAME,
    M05_PAY_STATION_LAN_IP,
    M05_PAY_STATION_TAG,
} from "./network.js";

export const M05_MISSION = "m05";
export const M05_RDC_ADVANCE_CODE = 1;

export const M05_ARCHIVE_STATEMENT = "acknowledgement_rnatnaree.txt";
export const M05_ARCHIVE_MEMO = "decision_memo.txt";
export const M05_ARCHIVE_TICKET = `usb_ticket_${M05_BEDSIDE_ASSET_TAG}.txt`;

const IR_DIR = "/ir/2026-08-14";
const TICKET_DIR = "/ir/tickets";
const HOME_DIR = "/home/rnatnaree";

const caseRef = RANSOM_BATCH_HOSPITAL.caseRef;
const amount = formatUsd(RANSOM_BATCH_HOSPITAL.gross);

const M05_RDC_TARGETS: readonly RdcTarget[] = [
    {
        code: 1,
        name: M05_COLD_CHART_CODENAME,
        tag: M05_COLD_CHART_TAG,
        lanIp: M05_COLD_CHART_LAN_IP,
        change: M05_COLD_CHART_CHANGE,
        os: "Debian 12",
        hasDisplay: true,
    },
    {
        code: 2,
        name: M05_BEDSIDE_CODENAME,
        tag: M05_BEDSIDE_ASSET_TAG,
        lanIp: M05_BEDSIDE_LAN_IP,
        change: M05_BEDSIDE_CHANGE,
        os: "Windows 11",
        hasDisplay: false,
    },
    {
        code: 3,
        name: M05_LEAD_APRON_CODENAME,
        tag: M05_LEAD_APRON_TAG,
        lanIp: M05_LEAD_APRON_LAN_IP,
        change: M05_LEAD_APRON_CHANGE,
        os: "Ubuntu 22.04",
        hasDisplay: false,
    },
    {
        code: 4,
        name: M05_PAY_STATION_CODENAME,
        tag: M05_PAY_STATION_TAG,
        lanIp: M05_PAY_STATION_LAN_IP,
        change: M05_PAY_STATION_CHANGE,
        os: "Ubuntu 22.04",
        hasDisplay: false,
    },
];

const DECISION_MEMO = [
    "CONFIDENTIAL — OFFICE OF THE CHIEF RISK OFFICER",
    `Incident ${caseRef} — decision record`,
    `Prepared by ${VIVIEN_ORCHID_FULL_NAME}, CRO`,
    "",
    "Timeline (UTC, 2026-08-14):",
    "  02:41  systems locked",
    "  02:55  theatre scheduling and records offline",
    "  03:20  crisis team convened",
    "  03:58  insurer notified",
    "  04:35  appointed negotiator engaged (Brightwater Resolutions)",
    "  05:12  Clinical incident logged, Operating Theatre 3. Escalated to Legal.",
    "         Excluded from external statement.",
    `  06:10  demand confirmed at ${amount}`,
    "  07:30  insurer agreed to settle",
    "  08:40  CRO authorised payment",
    "  09:02  payment released",
    "",
    "Decision: the incident is to be classified as employee negligence.",
    "Rationale: a classification of external attack leaves the policy's",
    "cyber endorsement open to dispute. A negligence classification keeps",
    "the claim inside cover and closes the matter within the quarter.",
    "",
    "Attachment A (finding draft v1) is superseded. Do not circulate it.",
].join("\n");

const FINDING_DRAFT = [
    "INCIDENT FINDING — DRAFT v1 — 2026-08-15",
    `Incident ${caseRef}`,
    "",
    "Probable cause: a third-party remote support tool with a standing",
    "connection into the records network.",
    "Classification: external attack.",
    "",
    "Note: no evidence of staff action has been identified at this time.",
    "",
    "STATUS: SUPERSEDED. See the decision record.",
].join("\n");

const FINDING_FINAL = [
    "INCIDENT FINDING — FINAL — 2026-08-19",
    `Incident ${caseRef}`,
    "",
    `Cause: unauthorised USB media introduced to ${M05_BEDSIDE_ASSET_TAG} by ${GRETA_SHORT_NAME},`,
    "contrary to IT policy 7.2.",
    "Classification: employee negligence. Retained risk.",
    "",
    `Personnel: ${GRETA_SHORT_NAME} separated from the organisation 2026-08-19.`,
    "Investigation closed 2026-08-24.",
].join("\n");

const ACKNOWLEDGEMENT = [
    "ACKNOWLEDGEMENT — 2026-08-18",
    "",
    "I acknowledge that on 2026-08-11 I connected personal USB media to",
    `${M05_BEDSIDE_ASSET_TAG}, contrary to IT policy 7.2, and that this is recorded as the`,
    `cause of incident ${caseRef}.`,
    "",
    `Signed: ${GRETA_SHORT_NAME}`,
    "Drafted by: Office of the Chief Risk Officer",
].join("\n");

const USB_TICKET = [
    `TICKET IR-${M05_BEDSIDE_ASSET_TAG} — opened 2026-08-18`,
    "",
    `Asset: ${M05_BEDSIDE_ASSET_TAG}`,
    "Reported by: Office of the Chief Risk Officer",
    "",
    `Removable media connected 2026-08-11 00:12 UTC by account ${M05_GRETA_USERNAME}.`,
    `Device label as recorded by the user: ${M01_LEDGERVAULT_PROJECT_LABEL}`,
    "An unsigned binary on the device executed on connection.",
    "",
    "Resolution: recorded as cause. No technical remediation requested.",
].join("\n");

const ASSET_REGISTER = [
    "IT ASSET REGISTER — extract",
    "",
    `${M05_BEDSIDE_ASSET_TAG}   assigned   ${GRETA_SHORT_NAME}   Systems Administrator`,
    "PC-IT-014   assigned   G. Teoh   IT Contractor (contract ended 2026-07-31)",
    "PC-IT-021   spare      -",
].join("\n");

const GRETA_NOTES = [
    "I keep writing this out and deleting it.",
    "",
    `It was on my desk. It said ${M01_LEDGERVAULT_PROJECT_LABEL} on the side in marker, which looked like`,
    "one of our project codes, and I wanted to know what it was. That is the whole",
    "reason. I plugged it into my own machine to read the label properly.",
    "",
    "I told them exactly that. What came back written down says I introduced",
    "unauthorised media, which is true, and leaves out why, which is the only part",
    "that was mine.",
    "",
    "They keep saying the systems came back. Theatre 3 is not a system.",
].join("\n");

const M05_RDC_DOCS: readonly RdcArchiveDoc[] = [
    { name: M05_ARCHIVE_MEMO, dir: IR_DIR, gate: 2, label: "Decision memo", text: DECISION_MEMO },
    { name: "finding_draft_v1.txt", dir: IR_DIR, gate: 0, text: FINDING_DRAFT },
    { name: "finding_final.txt", dir: IR_DIR, gate: 0, text: FINDING_FINAL },
    { name: M05_ARCHIVE_STATEMENT, dir: IR_DIR, gate: 1, label: "Acknowledgement", text: ACKNOWLEDGEMENT },
    { name: M05_ARCHIVE_TICKET, dir: TICKET_DIR, gate: 3, label: "USB ticket", text: USB_TICKET },
    { name: "asset_register.txt", dir: TICKET_DIR, gate: 0, text: ASSET_REGISTER },
    { name: "notes.txt", dir: HOME_DIR, gate: 0, text: GRETA_NOTES },
];

export const buildM05RdcProfile = (): RdcProfile => ({
    id: M05_MISSION,
    mission: M05_MISSION,
    key: M05_HOLD_MATTER,
    user: M05_GRETA_USERNAME,
    password: M05_GRETA_PASSWORD,
    advanceCode: M05_RDC_ADVANCE_CODE,
    targets: M05_RDC_TARGETS,
    docs: M05_RDC_DOCS,
});
