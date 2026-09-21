import {
    type DynamicWebsitePageDefinition,
    Events,
    Files,
    type PageContext,
    type PageMetadata,
    RegisterWebsite,
    Website,
} from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";

const SCRATCH_DL_DOMAIN = "scratch-dl.corp";
const SCRATCH_DL_PATH = "/scratch-dl";
const SCRATCH_DL_NAME = "probe";
const SCRATCH_DL_EXTENSION = "lst";
const SCRATCH_DL_CONTENT = "hello-from-events-bridge";
const SCRATCH_DL_EVENT_TRIGGER = "scratch.dl.trigger";
const SCRATCH_DL_EVENT_DONE = "scratch.dl.done";

interface ScratchDlResult {
    readonly ok: boolean;
    readonly path?: string;
    readonly error?: string;
}

Events.on(SCRATCH_DL_EVENT_TRIGGER, async () => {
    try {
        let folder = await Files.getByPath(SCRATCH_DL_PATH);
        if (!folder) {
            folder = await Files.create({ name: "scratch-dl", isFolder: true, parentPath: "/" });
        }

        const filePath = `${SCRATCH_DL_PATH}/${SCRATCH_DL_NAME}.${SCRATCH_DL_EXTENSION}`;
        let file = await Files.getByPath(filePath);
        if (!file) {
            file = await Files.create({
                name: SCRATCH_DL_NAME,
                extension: SCRATCH_DL_EXTENSION,
                parentPath: SCRATCH_DL_PATH,
                data: SCRATCH_DL_CONTENT,
            });
        } else {
            Files.write(file.id, SCRATCH_DL_CONTENT);
        }

        trace("scratch-dl", `SUCCESS id=${file.id} path=${filePath}`);
        Events.emit<typeof SCRATCH_DL_EVENT_DONE>(SCRATCH_DL_EVENT_DONE, { ok: true, path: filePath });
    } catch (error) {
        const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
        trace("scratch-dl", `ERROR ${message}`);
        Events.emit<typeof SCRATCH_DL_EVENT_DONE>(SCRATCH_DL_EVENT_DONE, { ok: false, error: message });
    }
});

const scratchDlPageHtml = `
<style>
    body { background:#0b0b0f; color:#d8d8d8; font-family: monospace; padding: 32px; }
    h1 { color:#3ddc97; }
    button { background:#122; color:#3ddc97; border:1px solid #3ddc97; padding:8px 16px; cursor:pointer; font-family: monospace; }
    button:disabled { opacity:0.5; cursor:default; }
    .bar { width: 320px; height: 14px; border: 1px solid #3ddc97; margin-top: 16px; background:#0b0b0f; }
    .fill { height: 100%; width: 0%; background: #3ddc97; transition: width 1.6s linear; }
    .status { margin-top: 10px; }
    .done { color: #3ddc97; }
    .fail { color: #ff5555; }
</style>
<h1>Scratch DL</h1>
<button id="btn" onclick="startDownload()">Download probe.lst</button>
<div class="bar"><div class="fill" id="fill"></div></div>
<div class="status" id="status"></div>
<script>
async function startDownload() {
    const btn = document.getElementById("btn");
    const fill = document.getElementById("fill");
    const status = document.getElementById("status");
    btn.disabled = true;
    status.textContent = "Downloading...";
    status.className = "status";
    fill.style.width = "0%";
    void fill.offsetWidth;
    fill.style.width = "100%";
    const result = await scratchDl();
    status.textContent = result.ok ? ("Download complete: " + result.path) : ("Download failed: " + result.error);
    status.className = "status " + (result.ok ? "done" : "fail");
    btn.disabled = false;
}
</script>
`;

@RegisterWebsite
export class ScratchDownloadWebsite extends Website {
    override SiteName = "Scratch DL";
    override Host = SCRATCH_DL_DOMAIN;
    override Icon = "";
    override Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (_context: PageContext): PageMetadata => ({
                title: "Scratch DL",
                description: "Debug-only re-test: Events bridge + a real progress animation tied to actual completion.",
                html: scratchDlPageHtml,
            }),
        },
    ];
    override Exports = {
        scratchDl: (): Promise<ScratchDlResult> =>
            new Promise((resolve) => {
                const unsubscribe = Events.on<typeof SCRATCH_DL_EVENT_DONE>(SCRATCH_DL_EVENT_DONE, (result) => {
                    unsubscribe();
                    resolve(result as ScratchDlResult);
                });
                Events.emit(SCRATCH_DL_EVENT_TRIGGER);
            }),
    };
}
