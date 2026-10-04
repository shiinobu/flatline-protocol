import {
    Command,
    Network,
    Website,
    type CommandAutoComplete,
    type CommandTools,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { registerDomains, removeDomains } from "../components/domains.js";
import type { DomainSpec } from "../core/types.js";
import { trace } from "../helpers/logger.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

import dashboardPreview from "./dashboard-preview.html";

type PortalLabSite = "portal" | "monitor" | "cipher";

const PORTAL_LAB_REV = "r2 token";
const PORTAL_LAB_DOMAIN = "remote-lab.pacificcare-health.org";
const MONITOR_LAB_DOMAIN = "remote-desktop-lab.pacificcare-health.org";
const CIPHER_LAB_DOMAIN = "cipher-lab.pacificcare-health.org";
const PORTAL_LAB_IP = "198.18.1.2";
const MONITOR_LAB_IP = "198.18.1.3";
const CIPHER_LAB_IP = "198.18.1.4";
const PORTAL_LAB_ACCOUNT = "g.desouza / Marigold2019";
const PREVIEW_ASSET_PREFIX = "../../public/assets/";
const LIVE_ASSET_PREFIX = "./assets/";
const MONITOR_LAB_SEARCH: readonly string[] = ["remote desktop connection", "remote desktop", "remote display", "workstation console"];
const CIPHER_LAB_SEARCH: readonly string[] = ["encrypt", "decrypt", "cipher", "passphrase"];

const PORTAL_LAB_RECORDS: readonly DomainSpec[] = [
    { name: PORTAL_LAB_DOMAIN, ip: PORTAL_LAB_IP, needsSubnet: true },
    { name: MONITOR_LAB_DOMAIN, ip: MONITOR_LAB_IP, needsSubnet: true },
    { name: CIPHER_LAB_DOMAIN, ip: CIPHER_LAB_IP, needsSubnet: true },
];
const PORTAL_LAB_IPS: readonly string[] = [PORTAL_LAB_IP, MONITOR_LAB_IP, CIPHER_LAB_IP];

const isPortalLabUp = (): boolean => Network.getSubnet(PORTAL_LAB_IP) !== null;

const renderLabPage = (site: PortalLabSite): string => {
    const config = JSON.stringify({
        site,
        portal: PORTAL_LAB_DOMAIN,
        monitor: MONITOR_LAB_DOMAIN,
        cipher: CIPHER_LAB_DOMAIN,
    });

    return dashboardPreview
        .split(PREVIEW_ASSET_PREFIX)
        .join(LIVE_ASSET_PREFIX)
        .replace("<body>", `<body>\n<script>window.PC_CFG=${config};</script>`);
};

const labPages = (
    site: PortalLabSite,
    title: string,
    search: readonly string[] = [],
): DynamicWebsitePageDefinition[] => [
    {
        path: "/",
        seo: search.length > 0,
        metadata: (): PageMetadata => ({
            title,
            description: "Debug lab: dashboard mock.",
            html: renderLabPage(site),
            search: [...search],
        }),
    },
];

const printPortalLabSheet = (tools: CommandTools): void => {
    tools.println(`Portal                    : https://${PORTAL_LAB_DOMAIN}`);
    tools.println(`Remote Desktop Connection : https://${MONITOR_LAB_DOMAIN} (Popular)`);
    tools.println(`Cipher                    : https://${CIPHER_LAB_DOMAIN} (Popular)`);
    tools.println(`Login                     : ${PORTAL_LAB_ACCOUNT} (portal only; Remote Desktop Connection takes a token built from the portal data)`);
    tools.println("The firewall and the game terminal are not used. Use the dock Guide tab to jump between steps.");
    tools.println("Check Goagle: both Popular sites should be listed, and a search for encrypt should find the cipher site.");
};

@registerDebugWebsite
export class PortalLabWebsite extends Website {
    SiteName = "PacificCare Remote Access (lab)";
    Host = PORTAL_LAB_DOMAIN;
    Icon = "";

    Pages: DynamicWebsitePageDefinition[] = labPages("portal", "PacificCare Remote Access");
}

@registerDebugWebsite
export class MonitorLabWebsite extends Website {
    SiteName = "Remote Desktop Connection (lab)";
    Host = MONITOR_LAB_DOMAIN;
    Icon = "";
    Popular = true;

    Pages: DynamicWebsitePageDefinition[] = labPages("monitor", "Remote Desktop Connection", MONITOR_LAB_SEARCH);
}

@registerDebugWebsite
export class CipherLabWebsite extends Website {
    SiteName = "Cipher Desk (lab)";
    Host = CIPHER_LAB_DOMAIN;
    Icon = "";
    Popular = true;

    Pages: DynamicWebsitePageDefinition[] = labPages("cipher", "Cipher Desk", CIPHER_LAB_SEARCH);
}

@registerDebugCommand({ default: true, scope: "both" })
export class PortalLabCommand extends Command {
    CommandName = "portallab";
    Description = "debug: register the remote access portal, Remote Desktop Connection and Cipher Desk mock sites for live-testing";
    Autocomplete: CommandAutoComplete[] = [
        { label: "portallab", type: "STRING" },
        { label: "<up|down>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const args = tools.getArgs();
        trace("PORTALLAB", `run rev=${PORTAL_LAB_REV} args=[${args.join(" ")}]`);
        tools.println(`portallab rev ${PORTAL_LAB_REV}`);

        try {
            await this.execute(tools, args[0]);
        } catch (error: unknown) {
            const reason = error instanceof Error ? error.message : String(error);
            trace("PORTALLAB", `run failed: ${reason}`);
            tools.printError(`portallab failed: ${reason}`);
        }
    }

    private async execute(tools: CommandTools, action: string | undefined): Promise<void> {
        if (action !== undefined && action !== "up" && action !== "down") {
            tools.printError("Usage: portallab [up|down]");
            return;
        }

        if (action === "down") {
            if (!isPortalLabUp()) {
                tools.printWarning("Portal lab is not up.");
                return;
            }
            removeDomains(PORTAL_LAB_RECORDS);
            for (const ip of PORTAL_LAB_IPS) {
                await Network.destroyNetwork(ip);
            }
            trace("PORTALLAB", "down");
            tools.printSuccess("Portal lab torn down.");
            return;
        }

        if (action === undefined) {
            if (!isPortalLabUp()) {
                tools.printWarning("Portal lab is not up. Run: portallab up");
                return;
            }
            printPortalLabSheet(tools);
            return;
        }

        if (isPortalLabUp()) {
            tools.printWarning("Portal lab is already up. Run: portallab down");
            return;
        }

        registerDomains([], PORTAL_LAB_RECORDS);
        trace("PORTALLAB", `up portal=${PORTAL_LAB_DOMAIN} monitor=${MONITOR_LAB_DOMAIN} cipher=${CIPHER_LAB_DOMAIN}`);
        tools.printSuccess("Portal lab is up.");
        printPortalLabSheet(tools);
    }
}
