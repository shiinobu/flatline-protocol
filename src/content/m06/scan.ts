import type { Shell } from "@hotbunny/hackhub-content-sdk";

import { M06_HTTP_PORT, M06_HTTPS_PORT } from "./network.js";

export const M06_REGISTRY_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M06_HTTP_PORT, status: "CLOSE", service: "http" },
    { port: M06_HTTPS_PORT, status: "OPEN", service: "https" },
];
