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
import { asLogData, parseLog, type LogDay } from "./log-file.js";

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

const withLogEntries = (file: NetworkFileMap, day: LogDay): NetworkFileMap => {
    if (file.children !== undefined) {
        return { ...file, children: file.children.map((child) => withLogEntries(child, day)) };
    }
    if (file.extension !== "log" || typeof file.data !== "string") return file;

    return { ...file, data: asLogData(parseLog(file.data, day)) };
};

const toUser = (user: Partial<NetworkUser>, day: LogDay | undefined): NetworkUser => {
    if (day === undefined || user.files === undefined) return Network.createUser(user);

    return Network.createUser({ ...user, files: user.files.map((file) => withLogEntries(file, day)) });
};

const toChild = (spec: DeviceSpec): ChildSubnetDefinition => {
    const { kind, users, children, vulnerabilities, userLogDay, ...rest } = spec;
    const base = { ...rest, users: users.map((user) => toUser(user, userLogDay)) };

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
    const { kind, users, children, vulnerabilities, userLogDay, ...rest } = spec;
    return {
        ...rest,
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
