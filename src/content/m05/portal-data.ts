import { sealText } from "../../components/text-seal.js";
import {
    M05_BEDSIDE_ASSET_TAG,
    M05_BEDSIDE_CHANGE,
    M05_BEDSIDE_IP,
    M05_BEDSIDE_LAN_IP,
    M05_COLD_CHART_CHANGE,
    M05_COLD_CHART_IP,
    M05_COLD_CHART_LAN_IP,
    M05_COLD_CHART_TAG,
    M05_FIREWALL_IP,
    M05_FIREWALL_LAN_IP,
    M05_HOLD_MATTER,
    M05_HTTP_PORT,
    M05_LEAD_APRON_CHANGE,
    M05_LEAD_APRON_IP,
    M05_LEAD_APRON_LAN_IP,
    M05_LEAD_APRON_TAG,
    M05_PAY_STATION_IP,
    M05_PAY_STATION_LAN_IP,
    M05_PAY_STATION_TAG,
    M05_PRINTER_IP,
    M05_PRINTER_LAN_IP,
    M05_PRINTER_PORT,
    M05_RDP_PORT,
    M05_SSH_PORT,
} from "./network.js";
import { M05_ROLLBACK_CHANGE, M05_SEPARATION_TICKET, M05_USB_TICKET } from "./portal.js";
import { M05_ROLLBACK_KEY, M05_ROLLBACK_PLAINTEXT, M05_SAMPLE_PLAINTEXT } from "./sealed.js";

export const M05_PORTAL_TODAY = "2026-09-27";

export interface PortalAccount {
    readonly a: string;
    readonly n: string;
    readonly role: string;
    readonly pw: string;
    readonly mfa: boolean;
    readonly svc?: boolean;
    readonly from?: string;
    readonly to?: string;
    readonly p?: number;
    readonly home?: string;
    readonly geo?: string;
}

export const M05_PORTAL_ACCOUNTS: readonly PortalAccount[] = [
    { a: "rnatnaree", n: "Roxanne Anindita Natnaree", role: "Systems Administrator", pw: "2019-11-04", mfa: false, from: "2026-07-01", to: "2026-08-18", p: 0.4, home: "175.139.20.84", geo: "Residential, Kuala Lumpur" },
    { a: "gteoh", n: "Gideon Bayu Teoh", role: "IT Contractor", pw: "2025-12-02", mfa: false, from: "2026-07-01", to: "2026-07-31", p: 0.3, home: "60.54.118.9", geo: "Residential, Petaling Jaya" },
    { a: "valerie.dizon", n: "Valerie Kirana Dizon", role: "Service Desk Lead", pw: "2026-03-18", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.3, home: "121.122.40.17", geo: "Residential, Subang Jaya" },
    { a: "rafael.bautista", n: "Rafael Surya Bautista", role: "Network Engineer", pw: "2026-02-09", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.3, home: "110.159.88.201", geo: "Residential, Shah Alam" },
    { a: "skrishnan", n: "Silas Gandewa Krishnan", role: "Radiology IT", pw: "2026-04-21", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.22, home: "202.188.77.14", geo: "Residential, Klang" },
    { a: "anastasia.santiago", n: "Anastasia Wulan Santiago", role: "Finance Systems", pw: "2026-05-30", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.22, home: "103.18.64.52", geo: "Residential, Cheras" },
    { a: "lchaiyasit", n: "Linnea Ghita Chaiyasit", role: "HR Operations", pw: "2026-01-12", mfa: false, from: "2026-07-01", to: "2026-09-26", p: 0.2, home: "175.144.9.33", geo: "Residential, Ampang" },
    { a: "kieran.pradipta", n: "Kieran Arka Pradipta", role: "Facilities", pw: "2025-10-27", mfa: false, from: "2026-07-01", to: "2026-09-26", p: 0.15, home: "60.50.201.90", geo: "Residential, Puchong" },
    { a: "kaelenp", n: "Kaelen Danu Phromsorn", role: "Ward Systems", pw: "2026-06-03", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.2, home: "219.93.14.71", geo: "Residential, Kajang" },
    { a: "hazel.t", n: "Hazel Ratna Tolentino", role: "Clinical Informatics", pw: "2026-07-14", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.2, home: "58.26.115.9", geo: "Residential, Bangsar" },
    { a: "v.orchid", n: "Vivien Orchid", role: "Chief Risk Officer", pw: "2026-08-20", mfa: true, from: "2026-07-01", to: "2026-09-26", p: 0.12, home: "103.6.150.44", geo: "Residential, Damansara" },
    { a: "dlau", n: "Dante Raksa Lau", role: "Facilities (left 2026-07-14)", pw: "2025-08-11", mfa: false, from: "2026-07-01", to: "2026-07-14", p: 0.25, home: "42.61.20.8", geo: "Residential, Seri Kembangan" },
    { a: "y.boonmee", n: "Yvette Tirta Boonmee", role: "Radiology Technician (left 2026-08-28)", pw: "2026-02-24", mfa: false, from: "2026-07-01", to: "2026-08-28", p: 0.22, home: "61.6.77.130", geo: "Residential, Kepong" },
    { a: "svc-vendor", n: "VendorCare support gateway", role: "Service account", pw: "2025-09-15", mfa: false, svc: true },
    { a: "svc-backup", n: "Backup relay", role: "Service account", pw: "2026-01-05", mfa: false, svc: true },
    { a: "svc-sync", n: "Directory sync", role: "Service account", pw: "2026-06-30", mfa: false, svc: true },
];

export interface PortalHrEntry {
    readonly a: string;
    readonly d: string;
    readonly why: string;
}

export const M05_PORTAL_HR_FEED: readonly PortalHrEntry[] = [
    { a: "dlau", d: "2026-07-14", why: "Resigned" },
    { a: "gteoh", d: "2026-07-31", why: "Contract ended" },
    { a: "rnatnaree", d: "2026-08-19", why: "Separated" },
    { a: "y.boonmee", d: "2026-08-28", why: "Resigned" },
];

export interface PortalSystem {
    readonly h: string;
    readonly tag: string;
    readonly role: string;
    readonly lan: string;
    readonly pub: string;
    readonly own: string;
    readonly stt: string;
    readonly svc: string;
}

export const M05_PORTAL_SYSTEMS: readonly PortalSystem[] = [
    { h: "fw-edge", tag: "fw-edge", role: "Perimeter firewall (pfSense)", lan: M05_FIREWALL_LAN_IP, pub: M05_FIREWALL_IP, own: "Network", stt: "Administrators only", svc: `http:${M05_HTTP_PORT}` },
    { h: "Cold-Chart", tag: M05_COLD_CHART_TAG, role: "Clinical incident archive (IR)", lan: M05_COLD_CHART_LAN_IP, pub: M05_COLD_CHART_IP, own: "Legal / IR", stt: "Held (IR-22)", svc: `ssh:${M05_SSH_PORT}` },
    { h: "Bedside-17", tag: M05_BEDSIDE_ASSET_TAG, role: "IT admin workstation", lan: M05_BEDSIDE_LAN_IP, pub: M05_BEDSIDE_IP, own: "IT", stt: "Isolated (IR-3389)", svc: `rdp:${M05_RDP_PORT}` },
    { h: "Lead-Apron", tag: M05_LEAD_APRON_TAG, role: "Imaging archive (PACS)", lan: M05_LEAD_APRON_LAN_IP, pub: M05_LEAD_APRON_IP, own: "Radiology", stt: "Local console only", svc: `ssh:${M05_SSH_PORT}` },
    { h: "Pay-Station", tag: M05_PAY_STATION_TAG, role: "Billing and claims staging", lan: M05_PAY_STATION_LAN_IP, pub: M05_PAY_STATION_IP, own: "Finance", stt: "Local console only", svc: `ssh:${M05_SSH_PORT}` },
    { h: "prn-03", tag: "prn-03", role: "Ward printer", lan: M05_PRINTER_LAN_IP, pub: M05_PRINTER_IP, own: "Facilities", stt: "Operational", svc: `raw:${M05_PRINTER_PORT}` },
];

export interface PortalRule {
    readonly id: string;
    readonly port: number;
    readonly dst: string;
    readonly at: string;
    readonly why: string;
    readonly due: string;
}

export const M05_PORTAL_RULES: readonly PortalRule[] = [
    { id: "IR-3389", port: M05_RDP_PORT, dst: M05_BEDSIDE_LAN_IP, at: "2026-08-14 02:58", why: `Containment: isolate ${M05_BEDSIDE_ASSET_TAG}`, due: "2026-08-21" },
    { id: "IR-22", port: M05_SSH_PORT, dst: M05_COLD_CHART_LAN_IP, at: "2026-08-14 05:20", why: `Legal hold, matter ${M05_HOLD_MATTER}`, due: "2026-08-21" },
    { id: "VND-22", port: M05_SSH_PORT, dst: M05_LEAD_APRON_LAN_IP, at: "2026-08-15 11:05", why: "Vendor lockdown: imaging archive", due: "2026-08-22" },
    { id: "VND-23", port: M05_SSH_PORT, dst: M05_PAY_STATION_LAN_IP, at: "2026-08-15 11:05", why: "Vendor lockdown: billing", due: "2026-08-22" },
];

export type PortalDiffLine = readonly [sign: "+" | "-", text: string];

export interface PortalChange {
    readonly id: string;
    readonly at: string;
    readonly sec: string;
    readonly by: string;
    readonly appr: string;
    readonly why: string;
    readonly lines: readonly PortalDiffLine[];
    readonly rev?: string;
    readonly state?: string;
    readonly tix?: string;
    readonly key?: string;
    readonly att?: string;
}

export const M05_PORTAL_CHANGES: readonly PortalChange[] = [
    { id: "CHG-2601-004", at: "2026-01-18 03:12", sec: "ntp", by: "it.ops", appr: "CAB-02", why: "Use the hospital time source.", lines: [["-", "ntp.server = 0.pool.ntp.org"], ["+", "ntp.server = time.pacificcare-health.org"]] },
    { id: "CHG-2602-011", at: "2026-02-22 03:20", sec: "portal", by: "it.ops", appr: "CAB-07", why: "Banner wording.", lines: [["-", 'portal.banner = "Authorised use only."'], ["+", 'portal.banner = "Authorised use only. Activity is logged."']] },
    { id: "CHG-2603-006", at: "2026-03-15 03:05", sec: "tls", by: "it.ops", appr: "CAB-11", why: "Certificate renewal.", lines: [["-", "tls.cert.serial = 4F:2A:91:0C"], ["+", "tls.cert.serial = 7B:D3:18:E5"]] },
    { id: "CHG-2604-009", at: "2026-04-12 03:30", sec: "dns", by: "rafael.bautista", appr: "CAB-14", why: "Resolver change.", lines: [["-", "dns.forwarders = 8.8.8.8, 8.8.4.4"], ["+", "dns.forwarders = 1.1.1.1, 9.9.9.9"]] },
    { id: "CHG-2605-003", at: "2026-05-03 03:10", sec: "vendor", by: "it.ops", appr: "CAB-16", why: "VendorCare support access (nightly sync).", lines: [["+", "vendor.allow_source = 203.0.113.77/32"], ["+", "vendor.gateway = enabled"]] },
    { id: "CHG-2605-014", at: "2026-05-31 03:02", sec: "vpn", by: "rafael.bautista", appr: "CAB-18", why: "Idle timeout complaints.", lines: [["-", "vpn.idle_timeout = 30m"], ["+", "vpn.idle_timeout = 60m"]] },
    {
        id: M05_ROLLBACK_CHANGE,
        at: "2026-06-30 03:00",
        sec: "directory / endpoint",
        by: "it.ops",
        appr: "Office of the CRO",
        why: "Identity migration window: pause directory sync and relax endpoint enforcement to avoid lockouts during cutover.",
        rev: "2026-07-15",
        state: "NOT REVERTED",
        tix: "HD-4417",
        key: "controls",
        att: "rollback_plan",
        lines: [["-", "directory.sync = enabled"], ["+", "directory.sync = paused  ; identity migration"], ["-", "endpoint.removable_media = enforce"], ["+", "endpoint.removable_media = log-only"], ["+", "endpoint.revert_due = 2026-07-15"]],
    },
    { id: "CHG-2607-008", at: "2026-07-26 03:15", sec: "logging", by: "it.ops", appr: "CAB-21", why: "Disk pressure on the log host.", lines: [["-", "log.retention_days = 90"], ["+", "log.retention_days = 60"]] },
    { id: M05_BEDSIDE_CHANGE, at: "2026-08-14 02:58", sec: "firewall", by: "rafael.bautista", appr: "valerie.dizon (on call)", why: `Containment: isolate ${M05_BEDSIDE_ASSET_TAG}.`, rev: "2026-08-21", state: "NOT REVIEWED", lines: [["+", `fw.rule IR-3389 deny tcp/${M05_RDP_PORT} -> ${M05_BEDSIDE_ASSET_TAG}`]] },
    {
        id: M05_COLD_CHART_CHANGE,
        at: "2026-08-14 05:20",
        sec: "firewall",
        by: "rafael.bautista",
        appr: "v.orchid (Chief Risk Officer)",
        why: `Legal hold, matter ${M05_HOLD_MATTER} (Office of the CRO). Restrict remote shell access to the clinical incident archive.`,
        rev: "2026-08-21",
        state: "NOT REVIEWED",
        key: "hold",
        lines: [["+", `fw.rule IR-22 deny tcp/${M05_SSH_PORT} -> ${M05_COLD_CHART_TAG}`]],
    },
    { id: M05_LEAD_APRON_CHANGE, at: "2026-08-15 11:05", sec: "vendor / firewall", by: "rafael.bautista", appr: "v.orchid (Chief Risk Officer)", why: "Retire the vendor support gateway; lock vendor-reachable hosts.", rev: "2026-08-22", state: "NOT REVIEWED", lines: [["-", "vendor.gateway = enabled"], ["+", "vendor.gateway = disabled"], ["+", `fw.rule VND-22 deny tcp/${M05_SSH_PORT} -> ${M05_LEAD_APRON_TAG}`], ["+", `fw.rule VND-23 deny tcp/${M05_SSH_PORT} -> ${M05_PAY_STATION_TAG}`]] },
];

export interface PortalTicket {
    readonly id: string;
    readonly at: string;
    readonly by: string;
    readonly title: string;
    readonly pr: string;
    readonly stt: string;
    readonly who: string;
    readonly notes: readonly string[];
    readonly key?: string;
}

const SAMPLE_HEX = sealText(M05_SAMPLE_PLAINTEXT, M05_HOLD_MATTER);

export const M05_PORTAL_TICKETS: readonly PortalTicket[] = [
    { id: "HD-4399", at: "2026-06-11 02:40", by: "kaelenp", title: "Ward 4 printer offline", pr: "P4", stt: "CLOSED", who: "it.ops", notes: ["2026-06-11 03:05 it.ops: Power supply replaced."] },
    { id: "HD-4417", at: "2026-06-30 03:14", by: "rnatnaree", title: "Directory sync job failed (03:00)", pr: "P3", stt: "OPEN", who: "unassigned", notes: ["2026-06-30 03:14 rnatnaree: Job exits non-zero after the identity migration change. Needs the migration owner.", "2026-07-02 09:10 it.ops: Parked until the migration window closes."] },
    { id: "HD-4436", at: "2026-07-08 08:20", by: "kieran.pradipta", title: "Badge reader, loading dock", pr: "P4", stt: "CLOSED", who: "it.ops", notes: ["2026-07-08 10:45 it.ops: Reader reseated."] },
    { id: "HD-4452", at: "2026-07-31 09:30", by: "rafael.bautista", title: "Disable accounts: G. Teoh (contract ended)", pr: "P3", stt: "OPEN", who: "it.ops", notes: ["2026-07-31 09:52 it.ops: Queued behind HD-4417. Manual closure not permitted during the migration window."] },
    { id: "HD-4468", at: "2026-08-03 07:15", by: "hazel.t", title: "VPN token for visiting consultant", pr: "P4", stt: "CLOSED", who: "rafael.bautista", notes: ["2026-08-03 08:00 rafael.bautista: Issued, expires in 14 days."] },
    { id: M05_USB_TICKET, at: "2026-08-10 09:02", by: "rnatnaree", title: "Unknown USB on my desk, whose is it?", pr: "P4", stt: "OPEN", who: "unassigned", key: "usb", notes: ["2026-08-10 09:02 rnatnaree: Found a USB stick on my desk. Label says Q3-2026-SEA. Is this ours? I do not want to plug it into anything without asking.", "(no reply)"] },
    { id: "HD-4490", at: "2026-08-12 13:40", by: "kaelenp", title: "Theatre 2 scheduling display flicker", pr: "P4", stt: "CLOSED", who: "it.ops", notes: ["2026-08-12 15:10 it.ops: Cable swapped."] },
    {
        id: "HD-4496",
        at: "2026-08-14 06:10",
        by: "valerie.dizon",
        title: "IR review access to PC-IT-017 (isolated)",
        pr: "P2",
        stt: "CLOSED",
        who: "it.ops",
        notes: [
            "2026-08-14 06:10 valerie.dizon: IR needs a look at PC-IT-017 while the isolation stands. Break-glass token issued through Remote Desktop Connection, sealed with the matter reference as agreed with Legal.",
            `2026-08-14 06:11 valerie.dizon: ${SAMPLE_HEX}`,
            "2026-08-14 07:40 it.ops: Review done. The token stays valid until the isolation is reviewed.",
        ],
    },
    {
        id: M05_SEPARATION_TICKET,
        at: "2026-08-19 10:20",
        by: "hr.ops",
        title: "Account closure: R. Natnaree (separation effective today)",
        pr: "P2",
        stt: "OPEN",
        who: "it.ops",
        key: "separation",
        notes: ["2026-08-19 10:20 hr.ops: Separation effective today. Close all access.", "2026-08-19 10:41 it.ops: Queued behind HD-4417 (directory sync). Manual closure not permitted during the migration window."],
    },
];

export const M05_PORTAL_ROLLBACK_HEX = sealText(M05_ROLLBACK_PLAINTEXT, M05_ROLLBACK_KEY);
