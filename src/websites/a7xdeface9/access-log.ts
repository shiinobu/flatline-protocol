import { M01_SESSION_JWT } from "../../content/m01.js";

const DECOY_TOKENS: Record<string, string> = {
    "/lot-88/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJndWVzdCIsInJvbGUiOiJidXllciJ9.1a2b3c4d5e6f7890",
    "/lot-91/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbm9uIiwicm9sZSI6InZpZXdlciJ9.2b3c4d5e6f7890a1",
    "/opn-14/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvcHMxNCIsInJvbGUiOiJyZWFkb25seSJ9.3c4d5e6f7890a1b2",
    "/acc-52/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhY2M1MiIsInJvbGUiOiJzdHVkZW50In0.4d5e6f7890a1b2c3",
    "/lot-94/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcmNoaXZlZCIsInJvbGUiOiJub25lIn0.5e6f7890a1b2c3d4",
    "/req-33/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJyZXEzMyIsInJvbGUiOiJidXllciJ9.6f7890a1b2c3d4e5",
    "/pkg-77/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwa2c3NyIsInJvbGUiOiJidXllciJ9.7890a1b2c3d4e5f6",
    "/acc-19/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhY2MxOSIsInJvbGUiOiJyZXNlbGxlciJ9.890a1b2c3d4e5f67",
    "/lot-05/": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsb3QwNSIsInJvbGUiOiJidXllciJ9.90a1b2c3d4e5f678",
};

const LOG_ORDER = [
    "/lot-91/",
    "/pkg-77/",
    "/opn-14/",
    "/opn-102/",
    "/lot-94/",
    "/acc-52/",
    "/req-33/",
    "/lot-88/",
    "/lot-05/",
    "/acc-19/",
];

const tokenFor = (path: string): string =>
    path === "/opn-102/" ? M01_SESSION_JWT : DECOY_TOKENS[path];

const logLine = (path: string): string =>
    `203.0.113.90 - - [GET ${path}] 200 - Cookie: session=${tokenFor(path)}`;

export const ACCESS_LOG_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>VerifiedAccess — access.log</title>
<style>
    body { background:#0b0b0f; color:#8f8; font-family: monospace; padding: 24px; font-size: 13px; }
    .line { white-space: pre-wrap; word-break: break-all; margin-bottom: 6px; }
    h1 { color:#7fffd4; font-size: 16px; }
</style>
</head>
<body>
<h1>access.log (unrotated)</h1>
${LOG_ORDER.map((path) => `<div class="line">${logLine(path)}</div>`).join("\n")}
</body>
</html>
`;
