import type { Shell } from "@hotbunny/hackhub-content-sdk";

import { M05_HTTP_PORT, M05_HTTPS_PORT } from "./network.js";

export const M05_SITE_NMAP_RESULT: Shell.NmapPort[] = [
    { port: M05_HTTP_PORT, status: "CLOSE", service: "http" },
    { port: M05_HTTPS_PORT, status: "OPEN", service: "https" },
];
