import { COMPOSITOR_VERSION } from "../../components/desktop-breach.js";

const INCIDENT_CLOCK: readonly string[] = [
    "03:14:07",
    "03:14:08",
    "03:14:08",
    "03:14:09",
    "03:14:09",
    "03:14:10",
    "03:14:10",
    "03:14:11",
    "03:14:11",
    "03:14:12",
];

export const buildM07IncidentLog = (expectedBuild: string, ip: string): string =>
    [
        `${INCIDENT_CLOCK[0]} compositord[812]: inbound session from ${ip}:443 accepted`,
        `${INCIDENT_CLOCK[1]} compositord[812]: session ${ip} holds uid 0`,
        `${INCIDENT_CLOCK[2]} compositor[1140]: loaded module compositor v${COMPOSITOR_VERSION} build ${expectedBuild}`,
        `${INCIDENT_CLOCK[3]} compositor[1140]: remote session requested module unload`,
        `${INCIDENT_CLOCK[4]} compositor[1140]: ~/compositor/modules/compositor.mod removed`,
        `${INCIDENT_CLOCK[5]} compositor[1140]: ~/compositor/config/display.cfg rewritten by remote session`,
        `${INCIDENT_CLOCK[6]} compositor[1140]: display.cfg: profile table unreadable`,
        `${INCIDENT_CLOCK[7]} compositord[812]: desktop session terminated`,
        `${INCIDENT_CLOCK[8]} compositord[812]: recovery tools available: sysdiag, sysrepair`,
        `${INCIDENT_CLOCK[9]} compositord[812]: session ${ip} dropped by peer`,
    ].join("\n");
