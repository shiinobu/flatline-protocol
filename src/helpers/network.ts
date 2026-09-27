import { Network } from "@hotbunny/hackhub-content-sdk";

export const resetMissionNetworks = (ips: readonly string[]): void => {
    for (const ip of ips) Network.destroyNetwork(ip);
};
