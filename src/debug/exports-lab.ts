import {
    Command,
    Events,
    SharedVariables,
    Website,
    type CommandAutoComplete,
    type CommandTools,
    type DynamicWebsitePageDefinition,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { trace } from "../helpers/logger.js";
import { isDebug } from "../guard/flags.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

const EXPORTS_LAB_REV = "r2 report";
const EXPORTS_LAB_HOST = "exports-lab.pacificcare-health.org";
const EXPORTS_LAB_SESSION_KEY = "flatline.exportsLab.session";
const EXPORTS_LAB_LOGIN_EVENT = "flatline.exportsLab.login";
const EXPORTS_LAB_NUMBER_EVENT = "flatline.exportsLab.number";
const EXPORTS_LAB_USER = "g.desouza";
const EXPORTS_LAB_PASSWORD = "Marigold2019";

interface ExportsLabLogin {
    readonly user: string;
    readonly pass: string;
}

const describeValue = (value: unknown): string => `type=${typeof value} value=${JSON.stringify(value)}`;

const writeSession = (source: string, login: ExportsLabLogin): boolean => {
    const valid = login.user === EXPORTS_LAB_USER && login.pass === EXPORTS_LAB_PASSWORD;
    if (!valid) {
        trace("EXPORTSLAB", `${source} rejected user=${login.user}`);
        return false;
    }

    try {
        SharedVariables.set(EXPORTS_LAB_SESSION_KEY, login.user);
        trace("EXPORTSLAB", `${source} wrote mirror, read back=${SharedVariables.get(EXPORTS_LAB_SESSION_KEY)}`);
        return true;
    } catch (error: unknown) {
        trace("EXPORTSLAB", `${source} mirror write failed: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
};

const registerExportsLabListeners = (): void => {
    Events.on(EXPORTS_LAB_LOGIN_EVENT, (data: ExportsLabLogin) => {
        trace("EXPORTSLAB", `login event received ${describeValue(data?.user)}`);
        writeSession("login via event", data);
    });

    Events.on(EXPORTS_LAB_NUMBER_EVENT, (data: { readonly id: unknown }) => {
        trace("EXPORTSLAB", `number event received id ${describeValue(data?.id)}`);
    });
};

if (isDebug) {
    registerExportsLabListeners();
    trace("EXPORTSLAB", `loaded rev=${EXPORTS_LAB_REV}`);
}

const EXPORTS_LAB_SCRIPT = [
    'var out=document.getElementById("out");',
    'var names=["flatlineLabString","flatlineLabNumber","flatlineLabObject","flatlineLabNumberEvent","flatlineLabLoginDirect","flatlineLabLoginEvent","flatlineLabReset","flatlineLabReport"];',
    'function report(t){if(typeof flatlineLabReport==="function")flatlineLabReport(String(t));}',
    'document.getElementById("vis").textContent=names.map(function(n){return n+": "+typeof window[n];}).join("  |  ");',
    'report("loaded "+document.getElementById("vis").textContent+" || mirror text: "+document.getElementById("mirror").textContent);',
    "var calls={",
    'string:function(){return flatlineLabString("hello");},',
    "number:function(){return flatlineLabNumber(42);},",
    "object:function(){return flatlineLabObject(21);},",
    "eventNumber:function(){return flatlineLabNumberEvent(7);},",
    'loginDirectGood:function(){return flatlineLabLoginDirect("g.desouza","Marigold2019");},',
    'loginDirectBad:function(){return flatlineLabLoginDirect("g.desouza","wrong");},',
    'loginEvent:function(){return flatlineLabLoginEvent("g.desouza","Marigold2019");},',
    "reset:function(){return flatlineLabReset();}};",
    "function run(key){var line=document.createElement('div');",
    "try{var r=calls[key]();line.textContent=key+' -> '+(typeof r)+' '+String(JSON.stringify(r));}",
    "catch(e){line.textContent=key+' THREW '+e;}",
    "out.insertBefore(line,out.firstChild);report(line.textContent);}",
    'document.addEventListener("click",function(e){var b=e.target.closest("[data-call]");if(b)run(b.getAttribute("data-call"));});',
].join("");

const EXPORTS_LAB_BUTTONS: readonly (readonly [string, string])[] = [
    ["string", "String argument"],
    ["number", "Number argument"],
    ["object", "Object return value"],
    ["eventNumber", "Number through an event"],
    ["loginDirectGood", "Login direct (right)"],
    ["loginDirectBad", "Login direct (wrong)"],
    ["loginEvent", "Login through an event"],
    ["reset", "Clear the mirror"],
];

const renderExportsLabPage = (session: string | undefined): string =>
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:32px;font:15px sans-serif;background:#0d1218;color:#e6ebf2">' +
    "<h1>Exports probe</h1>" +
    `<p>Mirror in SharedVariables when this page was rendered: <b id="mirror">${session ?? "none"}</b>. Reload the page with the browser button after a login.</p>` +
    '<p id="vis" style="color:#9aa6b6"></p>' +
    `<p>${EXPORTS_LAB_BUTTONS.map(
        ([key, label]) =>
            `<button data-call="${key}" style="margin:0 8px 8px 0;padding:8px 14px;font:inherit">${label}</button>`,
    ).join("")}</p>` +
    '<div id="out" style="font:13px monospace;color:#9fe3c0"></div>' +
    `<script>${EXPORTS_LAB_SCRIPT}</script></body></html>`;

@registerDebugWebsite
export class ExportsLabWebsite extends Website {
    SiteName = "Exports Probe Lab";
    Host = EXPORTS_LAB_HOST;
    Icon = "";

    Exports = {
        flatlineLabString: (text: string): string => {
            trace("EXPORTSLAB", `string ${describeValue(text)}`);
            return `string:${text}`;
        },
        flatlineLabNumber: (value: number): number => {
            trace("EXPORTSLAB", `number ${describeValue(value)}`);
            return value + 1;
        },
        flatlineLabObject: (value: number): { readonly received: number; readonly doubled: number } => {
            trace("EXPORTSLAB", `object ${describeValue(value)}`);
            return { received: value, doubled: value * 2 };
        },
        flatlineLabNumberEvent: (id: number): void => {
            trace("EXPORTSLAB", `number event emit ${describeValue(id)}`);
            Events.emit(EXPORTS_LAB_NUMBER_EVENT, { id });
        },
        flatlineLabLoginDirect: (user: string, pass: string): boolean => {
            trace("EXPORTSLAB", `login direct call ${describeValue(user)}`);
            return writeSession("login direct", { user, pass });
        },
        flatlineLabLoginEvent: (user: string, pass: string): void => {
            trace("EXPORTSLAB", `login event emit ${describeValue(user)}`);
            Events.emit(EXPORTS_LAB_LOGIN_EVENT, { user, pass });
        },
        flatlineLabReport: (text: string): void => {
            trace("EXPORTSLAB", `page saw ${text}`);
        },
        flatlineLabReset: (): void => {
            SharedVariables.remove(EXPORTS_LAB_SESSION_KEY);
            trace("EXPORTSLAB", "mirror cleared");
        },
    };

    Pages: DynamicWebsitePageDefinition[] = [
        {
            path: "/",
            metadata: (): PageMetadata => {
                const session = SharedVariables.get<string>(EXPORTS_LAB_SESSION_KEY);
                trace("EXPORTSLAB", `page render mirror=${session ?? "none"}`);

                return {
                    title: "Exports Probe",
                    description: "Debug probe for Exports arguments, return values and the SharedVariables mirror.",
                    html: renderExportsLabPage(session),
                };
            },
        },
    ];
}

@registerDebugCommand({ default: true, scope: "both" })
export class ExportsLabCommand extends Command {
    CommandName = "exportslab";
    Description = "debug: show the Exports probe site and the SharedVariables mirror it writes";
    Autocomplete: CommandAutoComplete[] = [{ label: "exportslab", type: "STRING" }];

    async Run(tools: CommandTools) {
        const mirror = SharedVariables.get<string>(EXPORTS_LAB_SESSION_KEY);
        trace("EXPORTSLAB", `run rev=${EXPORTS_LAB_REV} mirror=${mirror ?? "none"}`);
        tools.println(`exportslab rev ${EXPORTS_LAB_REV}`);
        tools.println(`Site   : https://${EXPORTS_LAB_HOST}`);
        tools.println(`Mirror : ${mirror ?? "none"}  (read from the terminal side, key ${EXPORTS_LAB_SESSION_KEY})`);
        tools.println("Press each button on the page, then reload the page with the browser button after a login.");
    }
}
