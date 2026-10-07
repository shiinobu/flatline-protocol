import { Desktop, Events, SaveStorage, Scheduler, Time, Variables } from "@hotbunny/hackhub-content-sdk";

import { burstDesktop, setGlitchLevel } from "./desktop-glitch.js";
import { isDesktopMounted, onSessionLeft } from "./session-guard.js";

export type IncidentPhase = "warning" | "critical" | "severed" | "breached";
export type IncidentOutcome = "severed" | "breached";
export type IncidentVariant = "broadcast";

export interface IncidentBannerSpec {
    readonly scope: string;
    readonly ip: string;
    readonly totalRealMs: number;
    readonly label: string;
    readonly criticalLabel: string;
    readonly detail: string;
    readonly variant?: IncidentVariant;
    readonly clockEnd?: string;
}

export interface IncidentBannerResolution {
    readonly scope: string;
    readonly outcome: IncidentOutcome;
    readonly label: string;
    readonly detail: string;
    readonly holdRealMs?: number;
}

interface StoredIncident {
    readonly scope: string;
    readonly ip: string;
    readonly endsAtGameMs: number;
    readonly totalRealMs: number;
    readonly label: string;
    readonly criticalLabel: string;
    readonly detail: string;
    readonly variant?: IncidentVariant;
    readonly clockEnd?: string;
}

interface IncidentView {
    readonly phase: IncidentPhase;
    readonly label: string;
    readonly detail: string;
    readonly remainingRealMs: number;
    readonly totalRealMs: number;
    readonly publishedAt: number;
    readonly variant?: IncidentVariant;
    readonly clockEnd?: string;
}

const WIDGET_ID = "flatline.incidentBanner";
const WIDGET_SRC = "components/incident-banner.html";
const VIEW_KEY = "flatlineIncidentView";
const INCIDENT_KEY = "flatline.incidentBanner";
const TICK_JOB = "flatline.incidentBanner.tick";
const CLEAR_JOB = "flatline.incidentBanner.clear";
const WIDGET_WIDTH = 540;
const WIDGET_HEIGHT = 112;
const WIDGET_TOP = 12;
const WIDGET_MIN_LEFT = 8;
const TICK_REAL_MS = 1000;
const RESOLVED_REAL_MS = 4000;
const CRITICAL_FRACTION = 0.35;
const STRIKE_BURST_POWER = 2.6;
const BREACHED_BURST_POWER = 2.2;

const centeredLeft = (): number =>
    typeof window === "undefined"
        ? WIDGET_MIN_LEFT
        : Math.max(WIDGET_MIN_LEFT, Math.round((window.innerWidth - WIDGET_WIDTH) / 2));

const ensureWidget = (): void => {
    if (!isDesktopMounted()) return;
    if (Desktop.getWidgets().some((widget) => widget.id === WIDGET_ID)) return;

    Desktop.addWidget({
        id: WIDGET_ID,
        src: WIDGET_SRC,
        width: WIDGET_WIDTH,
        height: WIDGET_HEIGHT,
        position: { x: centeredLeft(), y: WIDGET_TOP },
        transparent: true,
    });
};

const storedIncident = (): StoredIncident | null =>
    SaveStorage.get<StoredIncident | null>(INCIDENT_KEY) ?? null;

const publish = (view: IncidentView): void => Variables.set(VIEW_KEY, view);

const remainingRealMsOf = (incident: StoredIncident): number =>
    Math.max(0, Time.toRealMs(incident.endsAtGameMs - Time.now()));

const publishLive = (incident: StoredIncident): void => {
    const remaining = remainingRealMsOf(incident);
    const critical = remaining <= incident.totalRealMs * CRITICAL_FRACTION;
    setGlitchLevel(critical ? 3 : 2);
    publish({
        phase: critical ? "critical" : "warning",
        label: critical ? incident.criticalLabel : incident.label,
        detail: incident.detail,
        remainingRealMs: remaining,
        totalRealMs: incident.totalRealMs,
        publishedAt: Date.now(),
        variant: incident.variant,
        clockEnd: incident.clockEnd,
    });
};

const scheduleTick = (): void => {
    Scheduler.schedule(TICK_JOB, {}, { realMs: TICK_REAL_MS });
};

const runTick = (): void => {
    const incident = storedIncident();
    if (incident === null) return;

    ensureWidget();
    publishLive(incident);
    scheduleTick();
};

const removeBanner = (): void => {
    Desktop.removeWidget(WIDGET_ID);
    Variables.remove(VIEW_KEY);
};

Scheduler.register(TICK_JOB, runTick);
Scheduler.register(CLEAR_JOB, removeBanner);

export const showIncidentBanner = (spec: IncidentBannerSpec): void => {
    const incident: StoredIncident = {
        scope: spec.scope,
        ip: spec.ip,
        totalRealMs: spec.totalRealMs,
        endsAtGameMs: Time.now() + Time.toGameMs(spec.totalRealMs),
        label: spec.label,
        criticalLabel: spec.criticalLabel,
        detail: spec.detail,
        variant: spec.variant,
        clockEnd: spec.clockEnd,
    };

    Scheduler.cancelKind(CLEAR_JOB);
    Scheduler.cancelKind(TICK_JOB);
    SaveStorage.set(INCIDENT_KEY, incident);
    ensureWidget();
    publishLive(incident);
    burstDesktop(STRIKE_BURST_POWER);
    scheduleTick();
};

export const resolveIncidentBanner = (resolution: IncidentBannerResolution): void => {
    const incident = storedIncident();
    if (incident === null) return;

    Scheduler.cancelKind(TICK_JOB);
    Scheduler.cancelKind(CLEAR_JOB);
    SaveStorage.set(INCIDENT_KEY, null);
    setGlitchLevel(0);
    ensureWidget();
    publish({
        phase: resolution.outcome,
        label: resolution.label,
        detail: resolution.detail,
        remainingRealMs: 0,
        totalRealMs: incident.totalRealMs,
        publishedAt: Date.now(),
        variant: incident.variant,
        clockEnd: incident.clockEnd,
    });
    Scheduler.schedule(CLEAR_JOB, {}, { realMs: resolution.holdRealMs ?? RESOLVED_REAL_MS });
    if (resolution.outcome === "breached") burstDesktop(BREACHED_BURST_POWER);
};

export const dismissIncidentBanner = (): void => {
    Scheduler.cancelKind(TICK_JOB);
    Scheduler.cancelKind(CLEAR_JOB);
    SaveStorage.set(INCIDENT_KEY, null);
    setGlitchLevel(0);
    removeBanner();
};

onSessionLeft(() => Desktop.removeWidget(WIDGET_ID));

Events.on("Game.SessionStarted", () => {
    if (storedIncident() !== null) return;

    setGlitchLevel(0);
    if (Desktop.getWidgets().some((widget) => widget.id === WIDGET_ID)) removeBanner();
});
