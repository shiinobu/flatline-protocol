import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import { M05_CIPHER_DOMAIN } from "../../../content/m05/network.js";
import { renderToolPage, toolIcon } from "../tool-page.js";
import { reportCipherRun } from "./exports.js";

import script from "./script.html";
import shell from "./shell.html";
import style from "./style.html";

const CIPHER_DESK_TITLE = "Cipher Desk";
const CIPHER_DESK_SEARCH: readonly string[] = ["encrypt", "decrypt", "cipher", "passphrase"];

const CIPHER_DESK_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#e6edf5"/>' +
        '<circle cx="24" cy="32" r="9" fill="none" stroke="#14304a" stroke-width="5"/>' +
        '<path d="M33 32h21M46 32v9M54 32v6" fill="none" stroke="#14304a" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="24" cy="32" r="2.5" fill="#ff6b5e"/>',
);

@RegisterWebsite
export class CipherDeskWebsite extends Website {
    SiteName = CIPHER_DESK_TITLE;
    Host = M05_CIPHER_DOMAIN;
    Icon = CIPHER_DESK_ICON;
    Popular = true;

    Exports = {
        flatlineCipherRun: (mode: string, input: string, passphrase: string): void => {
            reportCipherRun(String(mode), String(input), String(passphrase));
        },
    };

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: CIPHER_DESK_TITLE,
            description: "Encrypt and decrypt text with a passphrase.",
            html: renderToolPage({ title: CIPHER_DESK_TITLE, style, body: shell, script }),
            seo: true,
            search: [...CIPHER_DESK_SEARCH],
        },
    ];
}
