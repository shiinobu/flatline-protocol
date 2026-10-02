import { Mail, SaveStorage, Scheduler, UI, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";
import {
    dismissIncidentBanner,
    resolveIncidentBanner,
    showIncidentBanner,
    type IncidentOutcome,
} from "./incident-banner.js";

export type IntrusionMail = MailDefinition;

export interface IntrusionBannerText {
    readonly label: string;
    readonly criticalLabel: string;
    readonly detail: string;
    readonly severedLabel: string;
    readonly severedDetail: string;
    readonly breachedLabel: string;
    readonly breachedDetail: string;
}

export interface StrikeSpec {
    readonly scope: string;
    readonly prefix: string;
    readonly strikeId: string;
    readonly ip: string;
    readonly alias: string;
    readonly deadlineRealMs: number;
    readonly banner: IntrusionBannerText;
    readonly mail?: IntrusionMail;
    readonly toast?: string;
}

interface ActiveStrike {
    readonly scope: string;
    readonly prefix: string;
    readonly strikeId: string;
    readonly ip: string;
    readonly alias: string;
}

export interface IntrusionHandlers {
    readonly onExpired: (strike: ActiveStrike) => void | Promise<void>;
}

const activeKey = (prefix: string): string => `${prefix}.activeStrike`;
const ACTIVE_PREFIX_KEY = "flatline.intrusion.activePrefix";
const DEADLINE_JOB = "flatline.intrusion.deadline";

export interface RepelTarget {
    readonly prefix: string;
    readonly scope: string;
    readonly strikeId: string;
    readonly ip: string;
}

const handlers = new Map<string, IntrusionHandlers>();
const bannerTexts = new Map<string, IntrusionBannerText>();
const repelTargets = new Map<string, RepelTarget>();

export const registerIntrusionHandlers = (prefix: string, next: IntrusionHandlers): void => {
    handlers.set(prefix, next);
};

export const registerRepelTarget = (target: RepelTarget): void => {
    repelTargets.set(target.ip, target);
};

export const clearRepelTarget = (ip: string): void => {
    repelTargets.delete(ip);
};

export const repelTargetFor = (ip: string): RepelTarget | null => repelTargets.get(ip) ?? null;

export const activeStrike = (prefix: string): ActiveStrike | null =>
    SaveStorage.get<ActiveStrike | null>(activeKey(prefix)) ?? null;

export const currentStrike = (): ActiveStrike | null => {
    const prefix = SaveStorage.get<string | null>(ACTIVE_PREFIX_KEY) ?? null;
    return prefix === null ? null : activeStrike(prefix);
};

const clearActiveStrike = (prefix: string): void => {
    SaveStorage.set(activeKey(prefix), null);
    if ((SaveStorage.get<string | null>(ACTIVE_PREFIX_KEY) ?? null) === prefix) {
        SaveStorage.set(ACTIVE_PREFIX_KEY, null);
    }
};

export const beginStrike = (spec: StrikeSpec): void => {
    const strike: ActiveStrike = {
        scope: spec.scope,
        prefix: spec.prefix,
        strikeId: spec.strikeId,
        ip: spec.ip,
        alias: spec.alias,
    };
    SaveStorage.set(activeKey(spec.prefix), strike);
    SaveStorage.set(ACTIVE_PREFIX_KEY, spec.prefix);
    bannerTexts.set(spec.prefix, spec.banner);

    Scheduler.cancelKind(DEADLINE_JOB);
    Scheduler.schedule(DEADLINE_JOB, { prefix: spec.prefix, ip: spec.ip }, { realMs: spec.deadlineRealMs });

    showIncidentBanner({
        scope: spec.scope,
        ip: spec.ip,
        totalRealMs: spec.deadlineRealMs,
        label: spec.banner.label,
        criticalLabel: spec.banner.criticalLabel,
        detail: spec.banner.detail,
    });

    if (spec.mail !== undefined) Mail.send(spec.mail);
    if (spec.toast !== undefined) UI.toast(spec.toast, "warning");

    trace(spec.scope, `strike ${spec.strikeId} started ip=${spec.ip} deadlineMs=${spec.deadlineRealMs}`);
};

const finishStrike = (prefix: string, outcome: IncidentOutcome): ActiveStrike | null => {
    const strike = activeStrike(prefix);
    if (strike === null) return null;

    const text = bannerTexts.get(prefix);
    Scheduler.cancelKind(DEADLINE_JOB);
    clearActiveStrike(prefix);

    if (text === undefined) {
        dismissIncidentBanner();
        return strike;
    }

    resolveIncidentBanner({
        scope: strike.scope,
        outcome,
        label: outcome === "severed" ? text.severedLabel : text.breachedLabel,
        detail: outcome === "severed" ? text.severedDetail : text.breachedDetail,
    });
    return strike;
};

export const repelStrike = (prefix: string): ActiveStrike | null => finishStrike(prefix, "severed");

export const abandonStrike = (prefix: string): void => {
    Scheduler.cancelKind(DEADLINE_JOB);
    clearActiveStrike(prefix);
    dismissIncidentBanner();
};

const runDeadline = async (payload: { readonly prefix: string; readonly ip: string }): Promise<void> => {
    const strike = activeStrike(payload.prefix);
    if (strike === null || strike.ip !== payload.ip) return;

    const expired = finishStrike(payload.prefix, "breached");
    if (expired === null) return;

    trace(expired.scope, `strike ${expired.strikeId} deadline expired ip=${expired.ip}`);
    await handlers.get(payload.prefix)?.onExpired(expired);
};

Scheduler.register<{ prefix: string; ip: string }>(DEADLINE_JOB, (payload) => runDeadline(payload));

export const strikeRemainingRealMs = (): number | null => {
    const jobs = Scheduler.list(DEADLINE_JOB);
    if (jobs.length === 0) return null;
    const remaining = Scheduler.remaining(jobs[0].id);
    return remaining === null ? null : remaining;
};
