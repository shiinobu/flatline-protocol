import {
    Command,
    Website,
    type CommandAutoComplete,
    type CommandTools,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";
import { notFoundMetadata } from "../websites/global/page-guards.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

type SeoLabMode = "open" | "404" | "null" | "gate";

const SEO_LAB_REV = "r2 gate";
const SEO_LAB_HOST = "seo-lab.pacificcare-health.org";
const SEO_LAB_SITE_NAME = "Seoprobe Lab";
const SEO_LAB_TITLE = "Seo Probe";
const SEO_LAB_MODES: readonly string[] = ["open", "404", "null", "gate"];
const SEO_LAB_HTML =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:40px;font:16px sans-serif;background:#0d1218;color:#e6ebf2">' +
    "<h1>Seo probe: open</h1><p>This page answers while the probe mode is open.</p></body></html>";

let seoLabMode: SeoLabMode = "open";

const isSeoLabMode = (value: string): value is SeoLabMode => SEO_LAB_MODES.includes(value);

const seoLabMetadata = (context: PageContext): PageMetadata | null => {
    trace("SEOLAB", `metadata mode=${seoLabMode} searchStr=${context.searchStr ?? "-"} url=${context.url}`);
    if (seoLabMode === "null") return null;
    if (seoLabMode === "404") return notFoundMetadata();
    if (seoLabMode === "gate") return context.searchStr === undefined ? notFoundMetadata() : null;

    return { title: SEO_LAB_TITLE, description: "Debug probe for closed seo pages.", html: SEO_LAB_HTML };
};

const printSeoLabSheet = (tools: CommandTools): void => {
    tools.println(`Site   : https://${SEO_LAB_HOST} (site name "${SEO_LAB_SITE_NAME}", open title "${SEO_LAB_TITLE}")`);
    tools.println(`Mode   : ${seoLabMode}  (open = real page, 404 = notFoundMetadata object, null = metadata returns null)`);
    tools.println("         gate = null when Goagle asks (searchStr set), notFoundMetadata when the address is opened directly");
    tools.println('Search : "seoprobe", "seo probe", "not found", "404" on Goagle, then open the site by its address.');
};

@registerDebugWebsite
export class SeoLabWebsite extends Website {
    SiteName = SEO_LAB_SITE_NAME;
    Host = SEO_LAB_HOST;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = [{ path: "/", seo: true, metadata: seoLabMetadata }];
}

@registerDebugCommand({ default: true, scope: "both" })
export class SeoLabCommand extends Command {
    CommandName = "seolab";
    Description = "debug: switch the closed seo page probe between open, 404 (notFoundMetadata), null and gate";
    Autocomplete: CommandAutoComplete[] = [
        { label: "seolab", type: "STRING" },
        { label: "<open|404|null|gate>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const requested = tools.getArgs()[0];
        trace("SEOLAB", `run rev=${SEO_LAB_REV} args=[${requested ?? ""}] mode=${seoLabMode}`);
        tools.println(`seolab rev ${SEO_LAB_REV}`);

        if (requested === undefined) {
            printSeoLabSheet(tools);
            return;
        }

        if (!isSeoLabMode(requested)) {
            tools.printError("Usage: seolab [open|404|null|gate]");
            return;
        }

        seoLabMode = requested;
        trace("SEOLAB", `mode set to ${seoLabMode}`);
        tools.printSuccess(`seolab mode: ${seoLabMode}`);
        printSeoLabSheet(tools);
    }
}
