import { COMPOSITOR_VERSION } from "../../components/desktop-breach.js";
import { M04_R1_IP } from "../../content/m04/network.js";
import { M04_INCIDENT_CLOCK } from "../../content/m04/quest.js";

const SECOND_STEPS: readonly string[] = [
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

export const buildM04IncidentLog = (expectedBuild: string, ip: string): string =>
    [
        `${M04_INCIDENT_CLOCK} compositord[812]: inbound session from ${ip}:443 accepted (nat gateway ${M04_R1_IP})`,
        `${SECOND_STEPS[1]} compositord[812]: session ${ip} holds uid 0`,
        `${SECOND_STEPS[2]} compositor[1140]: loaded module compositor v${COMPOSITOR_VERSION} build ${expectedBuild}`,
        `${SECOND_STEPS[3]} compositor[1140]: remote session requested module unload`,
        `${SECOND_STEPS[4]} compositor[1140]: ~/compositor/modules/compositor.mod removed`,
        `${SECOND_STEPS[5]} compositor[1140]: ~/compositor/config/display.cfg rewritten by remote session`,
        `${SECOND_STEPS[6]} compositor[1140]: display.cfg: profile table unreadable`,
        `${SECOND_STEPS[7]} compositord[812]: desktop session terminated`,
        `${SECOND_STEPS[8]} compositord[812]: recovery tools available: sysdiag, sysrepair`,
        `${SECOND_STEPS[9]} compositord[812]: session ${ip} dropped by peer`,
    ].join("\n");
