import {
    M05_COLD_CHART_CHANGE,
    M05_FOOTHOLD_SOURCE_IP,
    M05_GARETH_USERNAME,
    M05_GRETA_USERNAME,
} from "./network.js";

export const M05_LOGIN_EVENT = "flatline.m05.login";
export const M05_PORTAL_SEEN_EVENT = "flatline.m05.portalSeen";

export interface M05LoginPayload {
    readonly user: string;
}

export interface M05PortalSeenPayload {
    readonly kind: string;
    readonly ref: string;
}

export type M05PortalKind = "foothold" | "usb" | "separation" | "controls" | "hold" | "systems";

export const M05_PORTAL_KINDS: readonly M05PortalKind[] = [
    "foothold",
    "usb",
    "separation",
    "controls",
    "hold",
    "systems",
];

export const M05_ROLLBACK_CHANGE = "CHG-2606-022";
export const M05_USB_TICKET = "HD-4481";
export const M05_SEPARATION_TICKET = "HD-4503";
export const M05_SAMPLE_TICKET = "HD-4496";
export const M05_SYSTEMS_REF = "systems";

const PORTAL_REFS: Readonly<Record<M05PortalKind, string>> = {
    foothold: M05_FOOTHOLD_SOURCE_IP,
    usb: M05_USB_TICKET,
    separation: M05_SEPARATION_TICKET,
    controls: M05_ROLLBACK_CHANGE,
    hold: M05_COLD_CHART_CHANGE,
    systems: M05_SYSTEMS_REF,
};

export const isM05PortalKind = (value: string): value is M05PortalKind =>
    (M05_PORTAL_KINDS as readonly string[]).includes(value);

export const matchesM05PortalObservation = (kind: string, ref: string): boolean =>
    isM05PortalKind(kind) && PORTAL_REFS[kind] === ref;

export const M05_PORTAL_LOGIN_USER = M05_GRETA_USERNAME;
export const M05_PORTAL_CONTRACTOR_USER = M05_GARETH_USERNAME;
export const M05_PORTAL_MIN_STEPS: readonly M05PortalKind[] = ["foothold", "usb", "separation", "controls", "hold"];
