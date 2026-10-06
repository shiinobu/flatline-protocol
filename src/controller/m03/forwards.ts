import { Network, type NetworkPortInfo } from "@hotbunny/hackhub-content-sdk";

import { M03_FORWARD_TARGETS, type M03ForwardTarget } from "../../content/m03/network.js";
import type { M03Forward, M03QuestData } from "../../content/m03/state.js";

interface MatchedForward {
    readonly target: M03ForwardTarget;
    readonly port: NetworkPortInfo;
    readonly forward: M03Forward;
}

const findTarget = (port: NetworkPortInfo): M03ForwardTarget | undefined =>
    M03_FORWARD_TARGETS.find(
        (target) => target.lanIp === port.lanIp?.trim() && target.internal === port.internal,
    );

const findTargetOf = (forward: M03Forward): M03ForwardTarget | undefined =>
    M03_FORWARD_TARGETS.find((target) => target.ip === forward.ip && target.internal === forward.internal);

const bannerAllowed = (target: M03ForwardTarget, data: M03QuestData): boolean =>
    target.gatedBy === undefined || data[target.gatedBy];

const hasBanner = (target: M03ForwardTarget, port: NetworkPortInfo): boolean =>
    port.service === target.service && port.version === target.version;

const writeForward = (target: M03ForwardTarget, forward: M03Forward): void => {
    Network.removePort(forward.ip, forward.external);
    Network.addPort(forward.ip, {
        external: forward.external,
        internal: forward.internal,
        active: forward.active,
        service: target.service,
        version: target.version,
    });
};

const matchForwards = (ports: readonly NetworkPortInfo[], data: M03QuestData): readonly MatchedForward[] =>
    ports.flatMap((port) => {
        const target = findTarget(port);
        if (!target) return [];

        const forward: M03Forward = {
            ip: target.ip,
            external: port.external,
            internal: port.internal,
            active: port.active === true,
            bannered: bannerAllowed(target, data),
        };
        return [{ target, port, forward }];
    });

export const syncForwards = (ports: readonly NetworkPortInfo[], data: M03QuestData): readonly M03Forward[] => {
    const matched = matchForwards(ports, data);

    for (const { target, port, forward } of matched) {
        if (forward.bannered && !hasBanner(target, port)) writeForward(target, forward);
    }

    return matched.map(({ forward }) => forward);
};

export const releaseForwards = (data: M03QuestData): readonly M03Forward[] =>
    data.forwards.map((forward) => {
        const target = findTargetOf(forward);
        if (!target || forward.bannered || !bannerAllowed(target, data)) return forward;

        const released: M03Forward = { ...forward, bannered: true };
        writeForward(target, released);
        return released;
    });

export const restoreForwards = (forwards: readonly M03Forward[]): void => {
    for (const forward of forwards) {
        const target = findTargetOf(forward);
        if (target && forward.bannered) writeForward(target, forward);
    }
};
