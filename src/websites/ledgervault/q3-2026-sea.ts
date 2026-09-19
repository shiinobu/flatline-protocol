import { M01_CASE_ID, M01_NETWORK_MAP_CONTENT } from "../../content/m01.js";

export const Q3_2026_SEA_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>LedgerVault — Q3-2026-SEA</title>
<style>
    body { background:#0d0f12; color:#c8d0d8; font-family: monospace; padding: 32px; }
    h1 { color:#7fb0ff; }
    .tag { color:#888; }
    .file { border:1px solid #223; background:#12151a; padding:12px; margin-bottom:12px; white-space: pre-wrap; }
    a { color:#7fb0ff; }
</style>
</head>
<body>
<h1>Q3-2026-SEA</h1>

<p class="tag">network_map.txt</p>
<div class="file">${M01_NETWORK_MAP_CONTENT}</div>

<p class="tag">case_id.txt</p>
<div class="file">${M01_CASE_ID}</div>

<p><a href="/">back to vault</a></p>
</body>
</html>
`;
