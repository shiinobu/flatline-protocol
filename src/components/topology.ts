import {
    Network,
    NetworkDeviceType,
    type ChildSubnetDefinition,
    type NetworkFileMap,
    type NetworkUser,
    type NetworkVulnerability,
    type SubnetNetworkDefinition,
} from "@hotbunny/hackhub-content-sdk";

import type { DeviceSpec, PortRef, RouterSpec } from "../core/types.js";
import { LOG_TYPE, asLogData, parseLog, type LogDay, type LogOptions } from "./log-file.js";

export const existingNetworkIps = (ips: readonly string[]): readonly string[] =>
    ips.filter((ip) => Network.getSubnet(ip) !== null);

export const networksExist = (ips: readonly string[]): boolean =>
    existingNetworkIps(ips).length === ips.length;

export const destroyNetworksInOrder = async (ips: readonly string[]): Promise<void> => {
    for (const ip of existingNetworkIps(ips)) {
        await Network.destroyNetwork(ip);
    }
};

export const resetMissionNetworks = (ips: readonly string[]): void => {
    for (const ip of ips) Network.destroyNetwork(ip);
};

interface LogTyping {
    readonly neutral?: readonly string[];
    readonly typed?: readonly { readonly name: string; readonly type: string }[];
}

const optionsFor = (name: string, { neutral = [], typed = [] }: LogTyping): LogOptions => {
    const fixed = typed.find((entry) => entry.name === name);
    if (fixed !== undefined) return { type: fixed.type };

    return neutral.includes(name) ? { type: LOG_TYPE.event } : {};
};

const withLogEntries = (file: NetworkFileMap, day: LogDay, typing: LogTyping = {}): NetworkFileMap => {
    if (file.children !== undefined) {
        return { ...file, children: file.children.map((child) => withLogEntries(child, day, typing)) };
    }
    if (file.extension !== "log" || typeof file.data !== "string") return file;

    return { ...file, data: asLogData(parseLog(file.data, day, optionsFor(file.name, typing))) };
};

const rootLogs = (spec: DeviceSpec): { rootFiles?: NetworkFileMap[] } => {
    const { rootFiles, rootLogDay, neutralLogs, typedLogs } = spec;
    if (rootFiles === undefined || rootLogDay === undefined) return {};

    const typing: LogTyping = { neutral: neutralLogs, typed: typedLogs };
    return { rootFiles: rootFiles.map((file) => withLogEntries(file, rootLogDay, typing)) };
};

const toUser = (user: Partial<NetworkUser>, day: LogDay | undefined): NetworkUser => {
    if (day === undefined || user.files === undefined) return Network.createUser(user);

    return Network.createUser({ ...user, files: user.files.map((file) => withLogEntries(file, day)) });
};

const toChild = (spec: DeviceSpec): ChildSubnetDefinition => {
    const { kind, users, children, vulnerabilities, userLogDay, rootLogDay, neutralLogs, typedLogs, ...rest } = spec;
    const base = { ...rest, ...rootLogs(spec), users: users.map((user) => toUser(user, userLogDay)) };

    switch (kind) {
        case "router":
            return { ...base, type: NetworkDeviceType.Router, children: (children ?? []).map(toChild) };
        case "splitter":
            return { ...base, type: NetworkDeviceType.Splitter, children: (children ?? []).map(toChild) };
        case "firewall":
            return { ...base, type: NetworkDeviceType.Firewall, rules: rest.rules ?? [] };
        case "printer":
            return { ...base, type: NetworkDeviceType.Printer };
        case "device":
            return { ...base, type: NetworkDeviceType.Device };
    }
};

const toNetwork = (spec: RouterSpec): SubnetNetworkDefinition => {
    const { kind, users, children, vulnerabilities, userLogDay, rootLogDay, neutralLogs, typedLogs, ...rest } = spec;
    return {
        ...rest,
        ...rootLogs(spec),
        users: users.map((user) => toUser(user, userLogDay)),
        type: NetworkDeviceType.Router,
        children: children.map(toChild),
    };
};

const vulnerabilitiesOf = (spec: DeviceSpec): readonly (readonly [string, readonly NetworkVulnerability[]])[] => [
    ...(spec.vulnerabilities ? [[spec.ip, spec.vulnerabilities] as const] : []),
    ...(spec.children ?? []).flatMap(vulnerabilitiesOf),
];

export const buildNetworks = (specs: readonly RouterSpec[]): void => {
    for (const spec of specs) {
        Network.createSubnetNetwork(toNetwork(spec));
        for (const [ip, vulnerabilities] of vulnerabilitiesOf(spec)) {
            Network.setVulnerabilities(ip, [...vulnerabilities]);
        }
    }
};

export const removeFirewallRules = (refs: readonly PortRef[]): void => {
    for (const ref of refs) Network.removeFirewallRule(ref.ip, ref.port);
};

export const openPorts = (refs: readonly PortRef[]): void => {
    for (const ref of refs) Network.openPort(ref.ip, ref.port);
};
