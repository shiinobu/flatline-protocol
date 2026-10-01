import {
    Network,
    NetworkDeviceType,
    type ChildSubnetDefinition,
    type SubnetNetworkDefinition,
} from "@hotbunny/hackhub-content-sdk";

import type { DeviceSpec, PortRef, RouterSpec } from "../core/types.js";

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

const toChild = (spec: DeviceSpec): ChildSubnetDefinition => {
    const { kind, users, children, ...rest } = spec;
    const base = { ...rest, users: users.map((user) => Network.createUser(user)) };

    switch (kind) {
        case "router":
            return { ...base, type: NetworkDeviceType.Router, children: (children ?? []).map(toChild) };
        case "firewall":
            return { ...base, type: NetworkDeviceType.Firewall, rules: rest.rules ?? [] };
        case "device":
            return { ...base, type: NetworkDeviceType.Device };
    }
};

const toNetwork = (spec: RouterSpec): SubnetNetworkDefinition => {
    const { kind, users, children, ...rest } = spec;
    return {
        ...rest,
        users: users.map((user) => Network.createUser(user)),
        type: NetworkDeviceType.Router,
        children: children.map(toChild),
    };
};

export const buildNetworks = (specs: readonly RouterSpec[]): void => {
    for (const spec of specs) Network.createSubnetNetwork(toNetwork(spec));
};

export const removeFirewallRules = (refs: readonly PortRef[]): void => {
    for (const ref of refs) Network.removeFirewallRule(ref.ip, ref.port);
};

export const openPorts = (refs: readonly PortRef[]): void => {
    for (const ref of refs) Network.openPort(ref.ip, ref.port);
};
