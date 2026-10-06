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
    '<rect width="64" height="64" rx="14" fill="#0f1631"/>' +
        '<g transform="translate(9.9 9.9) scale(1.7)">' +
        '<rect x="1" y="1" width="7" height="7" rx="2" fill="#f3eee5"/>' +
        '<rect x="9.5" y="1" width="7" height="7" rx="2" fill="none" stroke="#f3eee5" stroke-width="1.5"/>' +
        '<rect x="18" y="1" width="7" height="7" rx="2" fill="#f3eee5"/>' +
        '<rect x="1" y="9.5" width="7" height="7" rx="2" fill="none" stroke="#c4f06a" stroke-width="1.5"/>' +
        '<rect x="9.5" y="9.5" width="7" height="7" rx="2" fill="#c4f06a"/>' +
        '<rect x="18" y="9.5" width="7" height="7" rx="2" fill="none" stroke="#c4f06a" stroke-width="1.5"/>' +
        '<rect x="1" y="18" width="7" height="7" rx="2" fill="#8ed8ff"/>' +
        '<rect x="9.5" y="18" width="7" height="7" rx="2" fill="none" stroke="#8ed8ff" stroke-width="1.5"/>' +
        '<rect x="18" y="18" width="7" height="7" rx="2" fill="#8ed8ff"/>' +
        "</g>",
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
