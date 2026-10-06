import { M04_ARCHITECT_VPN_IP } from "../global/characters.js";
import {
    M06_AGENT_DOMAIN,
    M06_AGENT_IP,
    M06_CERT_FIRST_SEEN,
    M06_CERT_LAST_SEEN,
    M06_INSURER_PORTAL_HOST,
    M06_INSURER_PORTAL_IP,
    M06_SKN_VPN_HOST,
} from "./network.js";

export interface CertificateRecord {
    readonly host: string;
    readonly address: string;
    readonly fingerprint: string;
    readonly names: readonly string[];
    readonly firstSeen: string;
    readonly lastSeen: string;
}

export const M06_SHARED_FINGERPRINT = "9c:41:ab:7e:05:d2:68:f3:b1:0a:77:4c:e9:20:5d:86";
export const M06_AGENT_FINGERPRINT = "2f:b8:14:60:c7:a9:3d:51:ee:08:92:7b:46:cf:1a:33";

const SHARED_NAMES: readonly string[] = [M06_SKN_VPN_HOST, M06_INSURER_PORTAL_HOST];

export const M06_CERT_RECORDS: readonly CertificateRecord[] = [
    {
        host: M06_SKN_VPN_HOST,
        address: M04_ARCHITECT_VPN_IP,
        fingerprint: M06_SHARED_FINGERPRINT,
        names: SHARED_NAMES,
        firstSeen: M06_CERT_FIRST_SEEN,
        lastSeen: M06_CERT_LAST_SEEN,
    },
    {
        host: M06_INSURER_PORTAL_HOST,
        address: M06_INSURER_PORTAL_IP,
        fingerprint: M06_SHARED_FINGERPRINT,
        names: SHARED_NAMES,
        firstSeen: M06_CERT_FIRST_SEEN,
        lastSeen: M06_CERT_LAST_SEEN,
    },
    {
        host: M06_AGENT_DOMAIN,
        address: M06_AGENT_IP,
        fingerprint: M06_AGENT_FINGERPRINT,
        names: [M06_AGENT_DOMAIN],
        firstSeen: M06_CERT_FIRST_SEEN,
        lastSeen: M06_CERT_LAST_SEEN,
    },
];
