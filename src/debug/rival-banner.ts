import { Desktop, SaveStorage, Scheduler, Time, Variables } from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";

type BannerPhase = "warning" | "critical" | "severed" | "breached";
type BannerOutcome = "severed" | "breached";

interface BannerIncident {
    ip: string;
    alias: string;
    endsAtGameMs: number;
    totalRealMs: number;
}

interface BannerView {
    phase: BannerPhase;
    ip: string;
    alias: string;
    remainingRealMs: number;
    totalRealMs: number;
    amount: number;
    publishedAt: number;
}

export interface IncidentBannerDetails {
    ip: string;
    alias: string;
    totalRealMs: number;
}

const BANNER_WIDGET_ID = "flatline.rivalBanner";
const BANNER_WIDGET_SRC = "debug/rival-banner.html";
const BANNER_VIEW_KEY = "rivalIncidentView";
const BANNER_INCIDENT_KEY = "rivalBannerIncident";
const BANNER_TICK_JOB = "flatline.rivalBannerTick";
const BANNER_CLEAR_JOB = "flatline.rivalBannerClear";
const BANNER_WIDTH = 520;
const BANNER_HEIGHT = 96;
const BANNER_TOP = 12;
const BANNER_MIN_LEFT = 8;
const BANNER_TICK_REAL_MS = 1_000;
const BANNER_RESOLVED_REAL_MS = 4_000;
const CRITICAL_FRACTION = 0.35;

const centeredLeft = (): number =>
    typeof window === "undefined"
        ? BANNER_MIN_LEFT
        : Math.max(BANNER_MIN_LEFT, Math.round((window.innerWidth - BANNER_WIDTH) / 2));

const isWidgetPresent = (): boolean => Desktop.getWidgets().some((widget) => widget.id === BANNER_WIDGET_ID);

const ensureWidget = (): void => {
    if (isWidgetPresent()) return;

    Desktop.addWidget({
        id: BANNER_WIDGET_ID,
        src: BANNER_WIDGET_SRC,
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        position: { x: centeredLeft(), y: BANNER_TOP },
        transparent: true,
    });
};

const getIncident = (): BannerIncident | null => SaveStorage.get<BannerIncident | null>(BANNER_INCIDENT_KEY) ?? null;

const publishView = (view: BannerView): void => Variables.set(BANNER_VIEW_KEY, view);

const remainingRealMsOf = (incident: BannerIncident): number =>
    Math.max(0, Time.toRealMs(incident.endsAtGameMs - Time.now()));

const publishLive = (incident: BannerIncident): void => {
    const remaining = remainingRealMsOf(incident);
    publishView({
        phase: remaining <= incident.totalRealMs * CRITICAL_FRACTION ? "critical" : "warning",
        ip: incident.ip,
        alias: incident.alias,
        remainingRealMs: remaining,
        totalRealMs: incident.totalRealMs,
        amount: 0,
        publishedAt: Date.now(),
    });
};

const scheduleBannerTick = (): void => {
    Scheduler.schedule(BANNER_TICK_JOB, {}, { realMs: BANNER_TICK_REAL_MS });
};

const runBannerTick = (): void => {
    const incident = getIncident();
    if (incident === null) return;

    ensureWidget();
    publishLive(incident);
    scheduleBannerTick();
};

const removeBanner = (): void => {
    Desktop.removeWidget(BANNER_WIDGET_ID);
    Variables.remove(BANNER_VIEW_KEY);
};

if (isDebug) {
    Scheduler.register(BANNER_TICK_JOB, runBannerTick);
    Scheduler.register(BANNER_CLEAR_JOB, removeBanner);
}

export const showIncidentBanner = (details: IncidentBannerDetails): void => {
    const incident: BannerIncident = {
        ip: details.ip,
        alias: details.alias,
        totalRealMs: details.totalRealMs,
        endsAtGameMs: Time.now() + Time.toGameMs(details.totalRealMs),
    };

    Scheduler.cancelKind(BANNER_CLEAR_JOB);
    Scheduler.cancelKind(BANNER_TICK_JOB);
    SaveStorage.set(BANNER_INCIDENT_KEY, incident);
    ensureWidget();
    publishLive(incident);
    scheduleBannerTick();
    trace("RIVALLAB", `banner shown ip=${incident.ip} totalMs=${incident.totalRealMs}`);
};

export const resolveIncidentBanner = (outcome: BannerOutcome, amount: number): void => {
    const incident = getIncident();
    if (incident === null) return;

    Scheduler.cancelKind(BANNER_TICK_JOB);
    Scheduler.cancelKind(BANNER_CLEAR_JOB);
    SaveStorage.set(BANNER_INCIDENT_KEY, null);
    ensureWidget();
    publishView({
        phase: outcome,
        ip: incident.ip,
        alias: incident.alias,
        remainingRealMs: 0,
        totalRealMs: incident.totalRealMs,
        amount,
        publishedAt: Date.now(),
    });
    Scheduler.schedule(BANNER_CLEAR_JOB, {}, { realMs: BANNER_RESOLVED_REAL_MS });
    trace("RIVALLAB", `banner resolved outcome=${outcome} amount=${amount}`);
};

export const dismissIncidentBanner = (): void => {
    Scheduler.cancelKind(BANNER_TICK_JOB);
    Scheduler.cancelKind(BANNER_CLEAR_JOB);
    SaveStorage.set(BANNER_INCIDENT_KEY, null);
    removeBanner();
};
