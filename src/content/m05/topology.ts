import type { NetworkFileMap } from "@hotbunny/hackhub-content-sdk";

import type { DeviceSpec, RouterSpec } from "../../core/types.js";

import {
    M05_BEDSIDE_CODENAME,
    M05_BEDSIDE_IP,
    M05_BEDSIDE_LAN_IP,
    M05_BEDSIDE_RDP_VERSION,
    M05_BEDSIDE_USERNAME,
    M05_COLD_CHART_CODENAME,
    M05_COLD_CHART_IP,
    M05_COLD_CHART_LAN_IP,
    M05_EDGE_IP,
    M05_EDGE_LAN_IP,
    M05_FIREWALL_IP,
    M05_FIREWALL_LAN_IP,
    M05_GRETA_PASSWORD,
    M05_GRETA_USERNAME,
    M05_HTTP_PORT,
    M05_HTTPS_PORT,
    M05_LEAD_APRON_CODENAME,
    M05_LEAD_APRON_IP,
    M05_LEAD_APRON_LAN_IP,
    M05_LEAD_APRON_PASSWORD,
    M05_LEAD_APRON_USERNAME,
    M05_PAY_STATION_CODENAME,
    M05_PAY_STATION_IP,
    M05_PAY_STATION_LAN_IP,
    M05_PAY_STATION_PASSWORD,
    M05_PAY_STATION_USERNAME,
    M05_PRINTER_IP,
    M05_PRINTER_LAN_IP,
    M05_PRINTER_PASSWORD,
    M05_PRINTER_PORT,
    M05_PRINTER_USERNAME,
    M05_RDP_PORT,
    M05_SPLITTER_IP,
    M05_SPLITTER_LAN_IP,
    M05_SSH_PORT,
} from "./network.js";
import {
    M05_ACKNOWLEDGEMENT_CONTENT,
    M05_ACKNOWLEDGEMENT_FILE_NAME,
    M05_ASSET_REGISTER_CONTENT,
    M05_ASSET_REGISTER_FILE_NAME,
    M05_DECISION_MEMO_CONTENT,
    M05_DECISION_MEMO_FILE_NAME,
    M05_DECOY_BILLING_CONTENT,
    M05_DECOY_PACS_CONTENT,
    M05_FINDING_DRAFT_CONTENT,
    M05_FINDING_DRAFT_FILE_NAME,
    M05_FINDING_FINAL_CONTENT,
    M05_FINDING_FINAL_FILE_NAME,
    M05_FOUND_NOTE_CONTENT,
    M05_FOUND_NOTE_FILE_NAME,
    M05_GRETA_NOTES_CONTENT,
    M05_GRETA_NOTES_FILE_NAME,
    M05_IR_DATE_FOLDER,
    M05_IR_FOLDER,
    M05_IR_TICKETS_FOLDER,
    M05_LOG,
    M05_TXT,
    M05_USB_HISTORY_CONTENT,
    M05_USB_HISTORY_FILE_NAME,
    M05_USB_TICKET_CONTENT,
    M05_USB_TICKET_FILE_NAME,
    M05_VAR_FOLDER,
} from "./server-files.js";

const folder = (name: string, children: NetworkFileMap[]): NetworkFileMap => ({
    name,
    isFolder: true,
    children,
});

const txt = (name: string, data: string): NetworkFileMap => ({ name, extension: M05_TXT, data });

const buildColdChartFiles = (): NetworkFileMap[] => [
    folder(M05_VAR_FOLDER, [
        folder(M05_IR_FOLDER, [
            folder(M05_IR_DATE_FOLDER, [
                txt(M05_DECISION_MEMO_FILE_NAME, M05_DECISION_MEMO_CONTENT()),
                txt(M05_FINDING_DRAFT_FILE_NAME, M05_FINDING_DRAFT_CONTENT()),
                txt(M05_FINDING_FINAL_FILE_NAME, M05_FINDING_FINAL_CONTENT()),
                txt(M05_ACKNOWLEDGEMENT_FILE_NAME, M05_ACKNOWLEDGEMENT_CONTENT()),
            ]),
            folder(M05_IR_TICKETS_FOLDER, [
                txt(M05_USB_TICKET_FILE_NAME, M05_USB_TICKET_CONTENT()),
                txt(M05_ASSET_REGISTER_FILE_NAME, M05_ASSET_REGISTER_CONTENT()),
            ]),
        ]),
    ]),
];

const buildHospitalDevices = (): DeviceSpec[] => [
    {
        kind: "firewall",
        ip: M05_FIREWALL_IP,
        lanIp: M05_FIREWALL_LAN_IP,
        isIpHidden: true,
        users: [{ username: M05_GRETA_USERNAME, password: M05_GRETA_PASSWORD }],
        ports: [{ external: M05_HTTP_PORT, internal: M05_HTTP_PORT, active: true, service: "http" }],
        rules: [
            { allowed: false, port: M05_SSH_PORT, destination: M05_COLD_CHART_LAN_IP },
            { allowed: false, port: M05_RDP_PORT, destination: M05_BEDSIDE_LAN_IP },
        ],
    },
    {
        kind: "device",
        ip: M05_COLD_CHART_IP,
        lanIp: M05_COLD_CHART_LAN_IP,
        name: M05_COLD_CHART_CODENAME,
        users: [
            {
                username: M05_GRETA_USERNAME,
                password: M05_GRETA_PASSWORD,
                files: [txt(M05_GRETA_NOTES_FILE_NAME, M05_GRETA_NOTES_CONTENT())],
            },
            { username: "root" },
        ],
        ports: [{ external: M05_SSH_PORT, internal: M05_SSH_PORT, active: false, service: "ssh" }],
        rootFiles: buildColdChartFiles(),
    },
    {
        kind: "device",
        ip: M05_BEDSIDE_IP,
        lanIp: M05_BEDSIDE_LAN_IP,
        name: M05_BEDSIDE_CODENAME,
        users: [{ username: M05_BEDSIDE_USERNAME, online: true }, { username: "root" }],
        ports: [
            {
                external: M05_RDP_PORT,
                internal: M05_RDP_PORT,
                active: false,
                service: "rdp",
                version: M05_BEDSIDE_RDP_VERSION,
            },
        ],
        rootFiles: [
            txt(M05_FOUND_NOTE_FILE_NAME, M05_FOUND_NOTE_CONTENT()),
            { name: M05_USB_HISTORY_FILE_NAME, extension: M05_LOG, data: M05_USB_HISTORY_CONTENT() },
        ],
        vulnerabilities: [{ type: "RCE", version: M05_BEDSIDE_RDP_VERSION }],
    },
    {
        kind: "device",
        ip: M05_LEAD_APRON_IP,
        lanIp: M05_LEAD_APRON_LAN_IP,
        name: M05_LEAD_APRON_CODENAME,
        users: [
            {
                username: M05_LEAD_APRON_USERNAME,
                password: M05_LEAD_APRON_PASSWORD,
                files: [txt("readme", M05_DECOY_PACS_CONTENT())],
            },
        ],
        ports: [{ external: M05_SSH_PORT, internal: M05_SSH_PORT, active: false, service: "ssh" }],
    },
    {
        kind: "device",
        ip: M05_PAY_STATION_IP,
        lanIp: M05_PAY_STATION_LAN_IP,
        name: M05_PAY_STATION_CODENAME,
        users: [
            {
                username: M05_PAY_STATION_USERNAME,
                password: M05_PAY_STATION_PASSWORD,
                files: [txt("readme", M05_DECOY_BILLING_CONTENT())],
            },
        ],
        ports: [{ external: M05_SSH_PORT, internal: M05_SSH_PORT, active: false, service: "ssh" }],
    },
    {
        kind: "printer",
        ip: M05_PRINTER_IP,
        lanIp: M05_PRINTER_LAN_IP,
        users: [{ username: M05_PRINTER_USERNAME, password: M05_PRINTER_PASSWORD }],
        ports: [{ external: M05_PRINTER_PORT, internal: M05_PRINTER_PORT, active: false, service: "printer" }],
    },
];

const buildHospitalEdge = (): RouterSpec => ({
    kind: "router",
    ip: M05_EDGE_IP,
    lanIp: M05_EDGE_LAN_IP,
    users: [],
    ports: [
        { external: M05_HTTP_PORT, internal: M05_HTTP_PORT, active: false, service: "http" },
        { external: M05_HTTPS_PORT, internal: M05_HTTPS_PORT, active: true, service: "https" },
    ],
    children: [
        {
            kind: "splitter",
            ip: M05_SPLITTER_IP,
            lanIp: M05_SPLITTER_LAN_IP,
            users: [],
            children: buildHospitalDevices(),
        },
    ],
});

export const buildM05Topology = (): readonly RouterSpec[] => [buildHospitalEdge()];
