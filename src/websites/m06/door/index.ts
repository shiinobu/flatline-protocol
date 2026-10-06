import {
    RegisterWebsite,
    Website,
    type DynamicWebsitePageDefinition,
    type PageContext,
    type PageMetadata,
} from "@hotbunny/hackhub-content-sdk";

import { BLACKLEDGER_LEGACY_CLAIM_EU, BLACKLEDGER_LEGACY_CLAIM_NA } from "../../../content/global/blackledger.js";
import { ARCHITECT_REAL_NAME, VIVIEN_ORCHID_FULL_NAME } from "../../../content/global/characters.js";
import { M06_DOOR_CIPHERTEXT, M06_DOOR_PHRASE } from "../../../content/m06/door.js";
import { M06_MINUTES_REFERENCE } from "../../../content/m06/minutes.js";
import { M06_DOOR_HOST, M06_DOOR_MINUTES_PATH } from "../../../content/m06/network.js";
import {
    M06_HOLDINGS_NAME,
    M06_HOLDINGS_NUMBER,
    M06_MUTUAL_NAME,
    M06_MUTUAL_NUMBER,
    M06_SKN_FULL_NAME,
    M06_SKN_NUMBER,
} from "../../../content/m06/records.js";
import { siteT } from "../../../context/global/site-strings.js";
import { M06_STAGE, isM06DoorOpen, isM06StageOpen, readM06KeysFound } from "../../../context/m06/progress.js";
import { M06_SITE_KEY } from "../../../i18n/m06/site.js";
import { escapeHtml, fillDataMarker, fillMarkers, localizeHtml } from "../../global/localize.js";
import { gateMissionPages, notFoundMetadata, requireHttps } from "../../global/page-guards.js";
import { toolIcon } from "../../global/tool-page.js";
import { doorTry, doorWaitSeconds, type DoorResult } from "./exports.js";

import loginPage from "./login.html";
import minutesPage from "./minutes.html";

const DOOR_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#1a0b0e"/>' +
        '<rect x="19" y="11" width="26" height="42" rx="3" fill="none" stroke="#c4122f" stroke-width="4"/>' +
        '<circle cx="38" cy="33" r="3.4" fill="#ff6a5c"/>',
);

const DOOR_TEXT_KEYS: Readonly<Record<string, string>> = {
    denied: M06_SITE_KEY.DOOR_DENIED,
    wait: M06_SITE_KEY.DOOR_WAIT,
    open: M06_SITE_KEY.DOOR_OPEN,
    enter: M06_SITE_KEY.DOOR_ENTER,
    enterHint: M06_SITE_KEY.DOOR_ENTER_HINT,
    count: M06_SITE_KEY.DOOR_COUNT,
    found: M06_SITE_KEY.DOOR_FOUND,
    dropped: M06_SITE_KEY.DOOR_DROPPED,
    rulePlain: M06_SITE_KEY.DOOR_RULE_PLAIN,
    ruleNone: M06_SITE_KEY.DOOR_RULE_NONE,
    ruleRow: M06_SITE_KEY.DOOR_RULE_ROW,
    ruleCol: M06_SITE_KEY.DOOR_RULE_COL,
    ruleRect: M06_SITE_KEY.DOOR_RULE_RECT,
    doNone: M06_SITE_KEY.DOOR_DO_NONE,
    doPair: M06_SITE_KEY.DOOR_DO_PAIR,
    doLast: M06_SITE_KEY.DOOR_DO_LAST,
    ariaLetter: M06_SITE_KEY.DOOR_ARIA_LETTER,
    ariaPair: M06_SITE_KEY.DOOR_ARIA_PAIR,
    ariaBox: M06_SITE_KEY.DOOR_ARIA_BOX,
};

const DOOR_NOTE_KEYS: readonly string[] = [
    M06_SITE_KEY.DOOR_NOTE_1,
    M06_SITE_KEY.DOOR_NOTE_2,
    M06_SITE_KEY.DOOR_NOTE_3,
    M06_SITE_KEY.DOOR_NOTE_4,
    M06_SITE_KEY.DOOR_NOTE_5,
];

const doorText = (): Record<string, unknown> => ({
    ...Object.fromEntries(Object.entries(DOOR_TEXT_KEYS).map(([name, key]) => [name, siteT(key)])),
    phrase: M06_DOOR_PHRASE,
    note: DOOR_NOTE_KEYS.map((key) => siteT(key)),
});

const doorData = (): Record<string, unknown> => ({
    pairs: M06_DOOR_CIPHERTEXT.match(/../g) ?? [],
    wait: doorWaitSeconds(Date.now()),
    open: isM06DoorOpen(),
    found: readM06KeysFound(),
    minutes: M06_DOOR_MINUTES_PATH,
    text: doorText(),
});

const renderDoor = (): string =>
    fillDataMarker(localizeHtml(loginPage), "DOOR_DATA", JSON.stringify(doorData()));

const escapeWithNumbers = (text: string): string =>
    escapeHtml(text).replace(/PC-[0-9]+/g, (number) => `<span class="nb">${number}</span>`);

const renderMinutes = (): string =>
    fillMarkers(localizeHtml(minutesPage), {
        MIN_CO_NO: escapeHtml(M06_MUTUAL_NUMBER),
        MIN_REF: escapeHtml(M06_MINUTES_REFERENCE),
        MIN_REF_FOOT: escapeHtml(M06_MINUTES_REFERENCE),
        MIN_ATT_CHAIR_NAME: escapeHtml(ARCHITECT_REAL_NAME),
        MIN_ATT_ORCHID_NAME: escapeHtml(VIVIEN_ORCHID_FULL_NAME),
        MIN_ITEM_2: escapeWithNumbers(
            siteT(M06_SITE_KEY.MIN_ITEM_2, {
                naYear: BLACKLEDGER_LEGACY_CLAIM_NA.year,
                euYear: BLACKLEDGER_LEGACY_CLAIM_EU.year,
                skn: M06_SKN_FULL_NAME,
                sknNumber: M06_SKN_NUMBER,
            }),
        ),
        MIN_ITEM_3: escapeWithNumbers(
            siteT(M06_SITE_KEY.MIN_ITEM_3, { holdings: M06_HOLDINGS_NAME, holdingsNumber: M06_HOLDINGS_NUMBER }),
        ),
        MIN_SIGN_NAME: escapeHtml(ARCHITECT_REAL_NAME),
        MIN_SIGN_ROLE: escapeHtml(siteT(M06_SITE_KEY.MIN_SIGN_ROLE, { insurer: M06_MUTUAL_NAME })),
        MIN_SIGN2_NAME: escapeHtml(VIVIEN_ORCHID_FULL_NAME),
        MIN_SIGN2_ROLE: escapeHtml(siteT(M06_SITE_KEY.MIN_SIGN2_ROLE, { insurer: M06_MUTUAL_NAME })),
    });

const guardedPage = (
    path: string,
    isOpen: () => boolean,
    title: string,
    description: string,
    html: () => string,
): DynamicWebsitePageDefinition => ({
    path,
    metadata: (context: PageContext): PageMetadata => {
        if (!isOpen()) return notFoundMetadata();

        return requireHttps(context) ?? { title, description, html: html() };
    },
});

@RegisterWebsite
export class NordhavenCommitteeWebsite extends Website {
    SiteName = "Committee access";
    Host = M06_DOOR_HOST;
    Icon = DOOR_ICON;

    Exports = {
        flatlineDoorTry: (passphrase: string, factor: string): DoorResult => doorTry(passphrase, factor),
    };

    Pages: DynamicWebsitePageDefinition[] = gateMissionPages("m06", [
        guardedPage(
            "/",
            () => isM06StageOpen(M06_STAGE.register),
            "Risk Committee Extranet",
            "Restricted committee access.",
            renderDoor,
        ),
        guardedPage(
            M06_DOOR_MINUTES_PATH,
            isM06DoorOpen,
            "Risk Committee minutes",
            "Minutes of the quarterly meeting.",
            renderMinutes,
        ),
    ]);
}
