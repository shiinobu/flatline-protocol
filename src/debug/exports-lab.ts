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

import { openSealedBytes, readableText } from "../components/text-seal.js";
import { trace } from "../helpers/logger.js";
import { isDebug } from "../guard/flags.js";
import { registerDebugCommand, registerDebugWebsite } from "./debug-gate.js";

const EXPORTS_LAB_REV = "r3 long strings";
const EXPORTS_LAB_HOST = "exports-lab.pacificcare-health.org";
const EXPORTS_LAB_SESSION_KEY = "flatline.exportsLab.session";
const EXPORTS_LAB_LOGIN_EVENT = "flatline.exportsLab.login";
const EXPORTS_LAB_NUMBER_EVENT = "flatline.exportsLab.number";
const EXPORTS_LAB_USER = "rnatnaree";
const EXPORTS_LAB_PASSWORD = "Marigold2019";
const EXPORTS_LAB_TOKEN_KEY = "L-2608-03";
const EXPORTS_LAB_TOKEN_HEX =
    "2b0356534357584a5276605344595f425c577e1d030f0a0914021d7d1b0a180116190a70046a1f040608151d037d190857425b005941611d03";
const EXPORTS_LAB_TOKEN_PLAIN = "rnatnaree:Marigold2019:192.168.1.4:CHG-2608-014:arc-ir-01";
const EXPORTS_LAB_PLAN_KEY = "CHG-2606-022";
const EXPORTS_LAB_PLAN_HEX =
    "11272b415057535d0d405e532d680465751b02001d061f02717a690d60531d534351505e266823444053534242424b123031294e12575e520d425741372735481244555b424653502f2d6a40575259570d555c542c3a24485f535e420d524b127178751b1f06071b1c051c1214202e415716445e444312452a262342451659450d5f42572d6467405358455741105351202732434616535a42434740263b674c4053105e485c56126b3b2248127e621b1a191c";
const EXPORTS_LAB_PLAN_PLAIN =
    "Rollback plan CHG-2606-022. Re-enable directory sync and restore removable-media enforcement by 2026-07-15. While this window is open, manual account closures are held (see HR-7).";
const EXPORTS_LAB_WRONG_KEY = "wrong-key";
const EXPORTS_LAB_INVALID = "That is not valid ciphertext. Expected hexadecimal text.";
const EXPORTS_LAB_UNREADABLE = "The result is not readable text. Check the passphrase.";
const EXPORTS_LAB_DECRYPTED = "Decrypted.";

interface ExportsLabLogin {
    readonly user: string;
    readonly pass: string;
}

interface ExportsLabLong {
    readonly length: number;
    readonly sum: number;
    readonly head: string;
    readonly tail: string;
}

interface ExportsLabSeal {
    readonly ok: boolean;
    readonly msg: string;
    readonly length: number;
    readonly text?: string;
}

const describeValue = (value: unknown): string => `type=${typeof value} value=${JSON.stringify(value)}`;

const checksum = (text: string): number =>
    Array.from({ length: text.length }, (_unused, index) => text.charCodeAt(index)).reduce(
        (sum, code) => (sum * 31 + code) >>> 0,
        7,
    );

const describeLong = (value: unknown): ExportsLabLong => {
    const text = typeof value === "string" ? value : "";
    return { length: text.length, sum: checksum(text), head: text.slice(0, 8), tail: text.slice(-8) };
};

const openLabSeal = (hex: string, key: string): ExportsLabSeal => {
    const bytes = openSealedBytes(hex, key);
    if (bytes === null) return { ok: false, msg: EXPORTS_LAB_INVALID, length: 0 };

    const text = readableText(bytes);
    if (text === null) return { ok: false, msg: EXPORTS_LAB_UNREADABLE, length: bytes.length };

    return { ok: true, msg: EXPORTS_LAB_DECRYPTED, length: bytes.length, text };
};

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
    'var names=["flatlineLabString","flatlineLabNumber","flatlineLabObject","flatlineLabNumberEvent","flatlineLabLoginDirect","flatlineLabLoginEvent","flatlineLabReset","flatlineLabReport","flatlineLabLong","flatlineLabSeal"];',
    `var SEAL=${JSON.stringify({
        tokenHex: EXPORTS_LAB_TOKEN_HEX,
        tokenKey: EXPORTS_LAB_TOKEN_KEY,
        tokenPlain: EXPORTS_LAB_TOKEN_PLAIN,
        planHex: EXPORTS_LAB_PLAN_HEX,
        planKey: EXPORTS_LAB_PLAN_KEY,
        planPlain: EXPORTS_LAB_PLAN_PLAIN,
        wrongKey: EXPORTS_LAB_WRONG_KEY,
        unreadable: EXPORTS_LAB_UNREADABLE,
        decrypted: EXPORTS_LAB_DECRYPTED,
    })};`,
    "function sum(t){var h=7,i;for(i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;return h;}",
    'function hexRun(n){var s="",i=0,v;while(s.length<n){v=(i*37+11)&255;s+=(v<16?"0":"")+v.toString(16);i++;}return s.slice(0,n);}',
    "function sameLong(t,r){return !!r&&r.length===t.length&&r.sum===sum(t)&&r.head===t.slice(0,8)&&r.tail===t.slice(-8);}",
    "function sameSeal(r,plain){return !!r&&r.ok===true&&r.msg===SEAL.decrypted&&r.text===plain&&r.length===plain.length;}",
    "var LONG120=hexRun(120),LONG360=hexRun(360);",
    "var verdicts={",
    "long120:function(r){return sameLong(LONG120,r);},",
    "long360:function(r){return sameLong(LONG360,r);},",
    "sealToken:function(r){return sameSeal(r,SEAL.tokenPlain);},",
    "sealPlan:function(r){return sameSeal(r,SEAL.planPlain);},",
    'sealWrong:function(r){return !!r&&r.ok===false&&r.msg===SEAL.unreadable&&!("text" in r)&&r.length===SEAL.tokenHex.length/2;}};',
    'function report(t){if(typeof flatlineLabReport==="function")flatlineLabReport(String(t));}',
    'document.getElementById("vis").textContent=names.map(function(n){return n+": "+typeof window[n];}).join("  |  ");',
    'report("loaded "+document.getElementById("vis").textContent+" || mirror text: "+document.getElementById("mirror").textContent);',
    "var calls={",
    'string:function(){return flatlineLabString("hello");},',
    "number:function(){return flatlineLabNumber(42);},",
    "object:function(){return flatlineLabObject(21);},",
    "eventNumber:function(){return flatlineLabNumberEvent(7);},",
    'loginDirectGood:function(){return flatlineLabLoginDirect("rnatnaree","Marigold2019");},',
    'loginDirectBad:function(){return flatlineLabLoginDirect("rnatnaree","wrong");},',
    'loginEvent:function(){return flatlineLabLoginEvent("rnatnaree","Marigold2019");},',
    "reset:function(){return flatlineLabReset();},",
    "long120:function(){return flatlineLabLong(LONG120);},",
    "long360:function(){return flatlineLabLong(LONG360);},",
    "sealToken:function(){return flatlineLabSeal(SEAL.tokenHex,SEAL.tokenKey);},",
    "sealPlan:function(){return flatlineLabSeal(SEAL.planHex,SEAL.planKey);},",
    "sealWrong:function(){return flatlineLabSeal(SEAL.tokenHex,SEAL.wrongKey);}};",
    "function run(key){var line=document.createElement('div');",
    "try{var r=calls[key](),v=verdicts[key]?(verdicts[key](r)?' OK':' MISMATCH'):'';line.textContent=key+' -> '+(typeof r)+' '+String(JSON.stringify(r))+v;}",
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
    ["long120", "Long string, 120 hex digits"],
    ["long360", "Long string, 360 hex digits"],
    ["sealToken", "Decode the token (114 digits)"],
    ["sealPlan", "Decode the rollback plan (358 digits)"],
    ["sealWrong", "Decode with a wrong key"],
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
        flatlineLabLong: (text: string): ExportsLabLong => {
            const result = describeLong(text);
            trace("EXPORTSLAB", `long type=${typeof text} length=${result.length} sum=${result.sum} head=${result.head} tail=${result.tail}`);
            return result;
        },
        flatlineLabSeal: (hex: string, key: string): ExportsLabSeal => {
            const result = openLabSeal(String(hex), String(key));
            trace(
                "EXPORTSLAB",
                `seal hexType=${typeof hex} hexLength=${String(hex).length} key=${describeValue(key)} ok=${result.ok} length=${result.length} msg=${result.msg}`,
            );
            return result;
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
        tools.println("The long-string and decode buttons end their line with OK or MISMATCH; a MISMATCH means the argument or the result was cut or changed.");
    }
}
