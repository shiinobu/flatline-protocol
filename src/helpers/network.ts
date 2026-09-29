import { Network } from "@hotbunny/hackhub-content-sdk";

export const resetMissionNetworks = (ips: readonly string[]): void => {
    for (const ip of ips) Network.destroyNetwork(ip);
};

export const missionNetworksExist = (ips: readonly string[]): boolean =>
    ips.every((ip) => Network.getSubnet(ip) !== null);
