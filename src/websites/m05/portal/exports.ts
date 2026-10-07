import { Events } from "@hotbunny/hackhub-content-sdk";

import {
    M05_ROXANNE_LEGACY_PASSWORD,
    M05_ROXANNE_PASSWORD,
    M05_PRINTER_PASSWORD,
} from "../../../content/m05/network.js";
import {
    M05_LOGIN_EVENT,
    M05_PORTAL_CONTRACTOR_USER,
    M05_PORTAL_LOGIN_USER,
    M05_PORTAL_SEEN_EVENT,
    isM05PortalKind,
} from "../../../content/m05/portal.js";
import { areMissionSitesOpen } from "../../../context/global/site-access.js";
import { getM05PortalMin, getM05PortalUser, setM05PortalUser } from "../../../context/m05/progress.js";
import type { PortalView } from "./render.js";

const MAX_FIELD_LENGTH = 128;

export type PortalLoginResult = PortalView | "denied" | "retired";

export interface PortalState {
    readonly user: string;
    readonly min: number;
}

const clip = (value: unknown): string => String(value).slice(0, MAX_FIELD_LENGTH);

const signIn = (user: string, view: PortalLoginResult): PortalLoginResult => {
    setM05PortalUser(user);
    Events.emit(M05_LOGIN_EVENT, { user });

    return view;
};

export const portalLogin = (user: unknown, password: unknown): PortalLoginResult => {
    if (!areMissionSitesOpen("m05")) return "denied";

    const name = clip(user);
    const secret = clip(password);

    if (name === M05_PORTAL_LOGIN_USER && secret === M05_ROXANNE_PASSWORD) return signIn(name, "portal");
    if (name === M05_PORTAL_CONTRACTOR_USER && secret === M05_PRINTER_PASSWORD) return signIn(name, "contractor");

    if (name === M05_PORTAL_LOGIN_USER && secret === M05_ROXANNE_LEGACY_PASSWORD) {
        return "retired";
    }

    return "denied";
};

export const portalSeen = (kind: unknown, ref: unknown): number => {
    if (!areMissionSitesOpen("m05") || getM05PortalUser() !== M05_PORTAL_LOGIN_USER) return getM05PortalMin();

    const observed = clip(kind);
    if (isM05PortalKind(observed)) Events.emit(M05_PORTAL_SEEN_EVENT, { kind: observed, ref: clip(ref) });

    return getM05PortalMin();
};

export const portalState = (): PortalState => ({ user: getM05PortalUser(), min: getM05PortalMin() });
