import { buildIncidentLog } from "../../components/kernel-layout.js";

export const buildM07IncidentLog = (expectedSrcversion: string, ip: string): string =>
    buildIncidentLog({ ip, expectedSrcversion });
