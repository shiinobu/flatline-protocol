import {
    Command,
    Network,
    Website,
    type CommandAutoComplete,
    type CommandTools,
    type WebsitePageDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { registerDomains, removeDomains } from "../components/domains.js";
import type { DomainSpec } from "../core/types.js";
import { trace } from "../helpers/logger.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

import dashboardPreview from "./dashboard-preview.html";

type PortalLabSite = "portal" | "monitor" | "cipher";

const PORTAL_LAB_REV = "r5 vendor sites";
const PORTAL_LAB_DOMAIN = "remote-lab.pacificcare-health.org";
const MONITOR_LAB_DOMAIN = "rdcdesk-lab.io";
const CIPHER_LAB_DOMAIN = "cipherdesk-lab.io";
const PORTAL_LAB_IP = "198.18.1.2";
const MONITOR_LAB_IP = "198.18.1.3";
const CIPHER_LAB_IP = "198.18.1.4";
const PORTAL_LAB_ACCOUNT = "g.desouza / Marigold2019";
const PREVIEW_ASSET_PREFIX = "../../public/assets/";
const LIVE_ASSET_PREFIX = "./assets/";
const MONITOR_LAB_SEARCH: readonly string[] = ["remote desktop connection", "remote desktop", "remote display", "workstation console"];
const CIPHER_LAB_SEARCH: readonly string[] = ["encrypt", "decrypt", "cipher", "passphrase"];

const labIcon = (shapes: string): string =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shapes}</svg>`)}`;

const PORTAL_LAB_ICON = labIcon(
    '<rect width="64" height="64" rx="14" fill="#0f4c3f"/>' +
        '<g transform="translate(8 8) scale(1.5)">' +
        '<path d="M4 28C3 14 12 4 29 3c1 16-7 26-21 26z" fill="#35c68c"/>' +
        '<path d="M7 25c4-8 9-12 17-16" fill="none" stroke="#06231b" stroke-width="2" stroke-linecap="round"/></g>',
);

const MONITOR_LAB_ICON = labIcon(
    '<rect width="64" height="64" rx="14" fill="#0b1720"/>' +
        '<rect x="12" y="15" width="40" height="27" rx="4" fill="none" stroke="#5cc8f0" stroke-width="4"/>' +
        '<path d="M32 42v8M24 50h16" stroke="#5cc8f0" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M18 31h7l4-8 5 14 4-9h6" fill="none" stroke="#38c88e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
);

const CIPHER_LAB_ICON = labIcon(
    '<rect width="64" height="64" rx="14" fill="#e6edf5"/>' +
        '<circle cx="24" cy="32" r="9" fill="none" stroke="#14304a" stroke-width="5"/>' +
        '<path d="M33 32h21M46 32v9M54 32v6" fill="none" stroke="#14304a" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="24" cy="32" r="2.5" fill="#ff6b5e"/>',
);

const PORTAL_LAB_RECORDS: readonly DomainSpec[] = [
    { name: PORTAL_LAB_DOMAIN, ip: PORTAL_LAB_IP, needsSubnet: true },
    { name: MONITOR_LAB_DOMAIN, ip: MONITOR_LAB_IP, needsSubnet: true },
    { name: CIPHER_LAB_DOMAIN, ip: CIPHER_LAB_IP, needsSubnet: true },
];
const PORTAL_LAB_IPS: readonly string[] = [PORTAL_LAB_IP, MONITOR_LAB_IP, CIPHER_LAB_IP];

const isPortalLabUp = (): boolean => Network.getSubnet(PORTAL_LAB_IP) !== null;

const portalLabSubnets = (): string =>
    PORTAL_LAB_IPS.map((ip) => `${ip}=${Network.getSubnet(ip) !== null}`).join(" ");

const FONT_SLOTS: Readonly<Record<string, PortalLabSite>> = { "rdc-fonts": "monitor", "cipher-fonts": "cipher" };

const stripFontSlot = (html: string, slot: string): string => {
    const start = html.indexOf(`<style data-slot="${slot}">`);
    const end = start < 0 ? -1 : html.indexOf("</style>", start);
    return end < 0 ? html : html.slice(0, start) + html.slice(end + "</style>".length);
};

const renderLabPage = (site: PortalLabSite): string => {
    const config = JSON.stringify({
        site,
        portal: PORTAL_LAB_DOMAIN,
        monitor: MONITOR_LAB_DOMAIN,
        cipher: CIPHER_LAB_DOMAIN,
    });
    const page = Object.keys(FONT_SLOTS)
        .filter((slot) => FONT_SLOTS[slot] !== site)
        .reduce(stripFontSlot, dashboardPreview);

    return page
        .split(PREVIEW_ASSET_PREFIX)
        .join(LIVE_ASSET_PREFIX)
        .replace("<body>", `<body>\n<script>window.PC_CFG=${config};</script>`);
};

const labPages = (
    site: PortalLabSite,
    title: string,
    search: readonly string[] = [],
): WebsitePageDefinition[] => [
    {
        path: "/",
        title,
        description: "Debug lab: dashboard mock.",
        html: renderLabPage(site),
        seo: search.length > 0,
        search: [...search],
    },
];

const printPortalLabSheet = (tools: CommandTools): void => {
    tools.println(`Hospital portal           : https://${PORTAL_LAB_DOMAIN}`);
    tools.println(`Remote Desktop Connection : https://${MONITOR_LAB_DOMAIN} (Popular, third-party, not a hospital site)`);
    tools.println(`Cipher Desk               : https://${CIPHER_LAB_DOMAIN} (Popular, third-party, not a hospital site)`);
    tools.println(`Login                     : ${PORTAL_LAB_ACCOUNT} (portal only; Remote Desktop Connection takes a token built from the portal data)`);
    tools.println("The firewall and the game terminal are not used. Use the dock Guide tab to jump between steps.");
    tools.println("Check Goagle: both Popular sites should be listed, and a search for encrypt should find the cipher site.");
};

@registerDebugWebsite
export class PortalLabWebsite extends Website {
    SiteName = "PacificCare Remote Access (lab)";
    Host = PORTAL_LAB_DOMAIN;
    Icon = PORTAL_LAB_ICON;

    Pages: WebsitePageDefinition[] = labPages("portal", "PacificCare Remote Access");
}

@registerDebugWebsite
export class MonitorLabWebsite extends Website {
    SiteName = "Remote Desktop Connection (lab)";
    Host = MONITOR_LAB_DOMAIN;
    Icon = MONITOR_LAB_ICON;
    Popular = true;

    Pages: WebsitePageDefinition[] = labPages("monitor", "Remote Desktop Connection", MONITOR_LAB_SEARCH);
}

@registerDebugWebsite
export class CipherLabWebsite extends Website {
    SiteName = "Cipher Desk (lab)";
    Host = CIPHER_LAB_DOMAIN;
    Icon = CIPHER_LAB_ICON;
    Popular = true;

    Pages: WebsitePageDefinition[] = labPages("cipher", "Cipher Desk", CIPHER_LAB_SEARCH);
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

        trace("PORTALLAB", `state before: ${portalLabSubnets()}`);

        if (action === "down") {
            if (!isPortalLabUp()) {
                tools.printWarning("Portal lab is not up.");
                return;
            }
            removeDomains(PORTAL_LAB_RECORDS);
            for (const ip of PORTAL_LAB_IPS) {
                await Network.destroyNetwork(ip);
            }
            trace("PORTALLAB", `down, state after: ${portalLabSubnets()}`);
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
            trace("PORTALLAB", "up refused: already up");
            tools.printWarning(`Portal lab is already up (${portalLabSubnets()}). Run: portallab down`);
            return;
        }

        registerDomains([], PORTAL_LAB_RECORDS);
        trace("PORTALLAB", `up portal=${PORTAL_LAB_DOMAIN} monitor=${MONITOR_LAB_DOMAIN} cipher=${CIPHER_LAB_DOMAIN}`);
        tools.printSuccess("Portal lab is up.");
        printPortalLabSheet(tools);
    }
}
