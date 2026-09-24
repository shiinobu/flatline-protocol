import {
    Command,
    Files,
    Localization,
    RegisterCommand,
    RegisterWebsite,
    SaveStorage,
    Website,
    type CommandAutoComplete,
    type CommandTools,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import {
    BACKTRACE_STORAGE_KEY,
    setBacktraceMission,
    type BacktraceMissionId,
    type BacktraceMissionStatus,
    type BacktraceState,
} from "../applications/backtrace-state.js";
import { M01_I18N_KEY } from "../content/m01-i18n.js";
import { M01_TIP_SUBJECT } from "../content/m01.js";
import { trace } from "../helpers/logger.js";

@RegisterCommand({ default: true, scope: "both" })
export class ScratchLocCommand extends Command {
    CommandName = "scratchloc";
    Description = "scratch: diagnose why zh translations aren't showing";

    async Run(tools: CommandTools) {
        const lang = Localization.language();
        const liveT = Localization.t(M01_I18N_KEY.MAIL_TIP_SUBJECT);
        const moduleConst = M01_TIP_SUBJECT;

        trace("scratch", "language()", lang);
        trace("scratch", "live t(MAIL_TIP_SUBJECT)", liveT);
        trace("scratch", "module-level M01_TIP_SUBJECT", moduleConst);

        tools.println(`language: ${lang}`);
        tools.println(`live t(): ${liveT}`);
        tools.println(`module const: ${moduleConst}`);
    }
}

@RegisterCommand({ default: true, scope: "both" })
export class ScratchImageTestCommand extends Command {
    CommandName = "scratchimg";
    Description = "scratch: test what ImageViewer needs in `data` to render a real .png";

    async Run(tools: CommandTools) {
        const moduleUrl = import.meta.url;
        trace("scratch", "import.meta.url", moduleUrl);
        tools.println(`import.meta.url: ${moduleUrl}`);

        const testImageUrl = "https://via.placeholder.com/300x200.png?text=scratchimg+test";
        const file = await Files.create({
            name: "test_public_url",
            extension: "png",
            data: testImageUrl,
        });
        trace("scratch", "created test_public_url.png", file);
        tools.println(`created ~/test_public_url.png with data = ${testImageUrl}`);

        const modAssetUrl = "mod-asset://flatline-protocol/assets/q1-evidence.png";
        const file2 = await Files.create({
            name: "test_mod_asset_url",
            extension: "png",
            data: modAssetUrl,
        });
        trace("scratch", "created test_mod_asset_url.png", file2);
        tools.println(`created ~/test_mod_asset_url.png with data = ${modAssetUrl}`);

        tools.println("open both via FileExplorer (double-click) and check: real image, or broken-image icon?");
    }
}

const SCRATCH_WEB_HOST = "scratchweb.test";

const SCRATCH_WEB_HOME_HTML = `<!doctype html>
<html>
<head>
<style>
  body { background: #111; color: #ddd; font-family: monospace; padding: 20px; }
  #dropzone { border: 2px dashed #555; padding: 40px; text-align: center; margin-bottom: 16px; }
  #dropzone.drag { border-color: #7fb0ff; }
  img { max-width: 100%; margin-top: 16px; }
</style>
</head>
<body>
  <h2>scratch: local file pull/upload test</h2>
  <p>1) click to pick a file, or 2) drag a file (e.g. from FileExplorer) onto the box below.</p>
  <input type="file" id="picker" accept="image/*" />
  <div id="dropzone">drag a file here</div>
  <div id="result"></div>
  <script>
    const result = document.getElementById("result");
    function show(file) {
      result.innerHTML = "<p>name: " + file.name + ", type: " + file.type + ", size: " + file.size + "</p>";
      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = url;
      result.appendChild(img);
    }
    document.getElementById("picker").addEventListener("change", (e) => {
      if (e.target.files[0]) show(e.target.files[0]);
    });
    const dz = document.getElementById("dropzone");
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("drag"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("drag");
      if (e.dataTransfer.files[0]) show(e.dataTransfer.files[0]);
    });
  </script>
</body>
</html>`;

@RegisterWebsite
export class ScratchWebViewerWebsite extends Website {
    SiteName = "scratch-viewer";
    Host = SCRATCH_WEB_HOST;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (): PageMetadata => ({
                title: "scratch viewer",
                description: "scratch: test pulling a local/virtual file into a website page.",
                html: SCRATCH_WEB_HOME_HTML,
            }),
        },
    ];
}

const BACKTRACE_MISSION_IDS: readonly BacktraceMissionId[] = ["m1", "m2", "m3", "m4"];
const BACKTRACE_STATUSES: readonly BacktraceMissionStatus[] = ["locked", "progress", "complete"];

const isBacktraceMission = (value: string | undefined): value is BacktraceMissionId =>
    BACKTRACE_MISSION_IDS.some((id) => id === value);

const isBacktraceStatus = (value: string | undefined): value is BacktraceMissionStatus =>
    BACKTRACE_STATUSES.some((status) => status === value);

const readBacktraceStatus = (mission: BacktraceMissionId): BacktraceMissionStatus =>
    SaveStorage.get<Partial<BacktraceState>>(BACKTRACE_STORAGE_KEY)?.[mission]?.status ?? "locked";

const nextBacktraceMission = (mission: BacktraceMissionId): BacktraceMissionId | undefined =>
    BACKTRACE_MISSION_IDS[BACKTRACE_MISSION_IDS.indexOf(mission) + 1];

@RegisterCommand({ default: true, scope: "both" })
export class ScratchBacktraceCommand extends Command {
    CommandName = "scratchbt";
    Description = "scratch: set, inspect or reset the BACKTRACE mission state";
    Autocomplete: CommandAutoComplete[] = [
        { label: "scratchbt", type: "STRING" },
        { label: "<m1|m2|m3|m4|reset> <locked|progress|complete>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const [first, second] = tools.getArgs();

        if (first === undefined) {
            tools.println(JSON.stringify(SaveStorage.get(BACKTRACE_STORAGE_KEY) ?? {}));
            return;
        }

        if (first === "reset") {
            SaveStorage.remove(BACKTRACE_STORAGE_KEY);
            tools.printSuccess("BACKTRACE state cleared.");
            return;
        }

        if (!isBacktraceMission(first) || !isBacktraceStatus(second)) {
            tools.printError("Usage: scratchbt [<m1|m2|m3|m4> <locked|progress|complete> | reset]");
            return;
        }

        setBacktraceMission(first, second);
        tools.printSuccess(`${first} -> ${second}`);

        const next = second === "complete" ? nextBacktraceMission(first) : undefined;
        if (next === undefined || readBacktraceStatus(next) !== "locked") return;

        setBacktraceMission(next, "progress");
        tools.printInfo(`${next} -> progress (auto-start after ${first})`);
    }
}
