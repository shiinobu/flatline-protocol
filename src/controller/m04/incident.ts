import { buildIncidentLog } from "../../components/kernel-layout.js";
import { M04_R1_IP } from "../../content/m04/network.js";

export const buildM04IncidentLog = (expectedSrcversion: string, ip: string): string =>
    buildIncidentLog({ ip, expectedSrcversion, gateway: M04_R1_IP });
