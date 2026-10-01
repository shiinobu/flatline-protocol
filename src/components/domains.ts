import { Network, NetworkDeviceType } from "@hotbunny/hackhub-content-sdk";

import type { DomainSpec, PersistentDomain } from "../core/types.js";

export const registerDomains = (
    persistent: readonly PersistentDomain[],
    records: readonly DomainSpec[],
): void => {
    for (const domain of persistent) {
        Network.removeDomain(domain.name);
        Network.registerDomain(domain.name, domain.ip);
    }

    for (const record of records) {
        if (record.needsSubnet) {
            Network.createSubnetNetwork({
                ip: record.ip,
                type: NetworkDeviceType.Device,
                users: [],
                ports: [],
            });
        }

        Network.removeDomain(record.name);
        if (record.vulnerabilities === undefined) {
            Network.registerDomain(record.name, record.ip);
        } else {
            Network.registerDomain(record.name, record.ip, [...record.vulnerabilities]);
        }
    }
};

export const removeDomains = (records: readonly DomainSpec[]): void => {
    for (const record of records) Network.removeDomain(record.name);
};
