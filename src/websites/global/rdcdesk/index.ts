import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import type { RdcLoginResult } from "../../../content/global/rdc.js";
import { M05_RDC_DOMAIN } from "../../../content/m05/network.js";
import type { M05RdcMirror } from "../../../context/m05/progress.js";
import { renderToolPage, toolIcon } from "../tool-page.js";
import { rdcAttach, rdcLogin, rdcRead, rdcSignal, rdcState } from "./exports.js";

import script from "./script.html";
import shell from "./shell.html";
import style from "./style.html";

const RDC_TITLE = "Remote Desktop Connection";
const RDC_SEARCH: readonly string[] = ["remote desktop connection", "remote desktop", "remote display", "workstation console"];

const RDC_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#0b1720"/>' +
        '<rect x="12" y="15" width="40" height="27" rx="4" fill="none" stroke="#5cc8f0" stroke-width="4"/>' +
        '<path d="M32 42v8M24 50h16" stroke="#5cc8f0" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M18 31h7l4-8 5 14 4-9h6" fill="none" stroke="#38c88e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
);

@RegisterWebsite
export class RemoteDesktopConnectionWebsite extends Website {
    SiteName = RDC_TITLE;
    Host = M05_RDC_DOMAIN;
    Icon = RDC_ICON;
    Popular = true;

    Exports = {
        flatlineRdcLogin: (hex: string): RdcLoginResult => rdcLogin(String(hex)),
        flatlineRdcSignal: (stage: number): void => {
            rdcSignal(Number(stage));
        },
        flatlineRdcAttach: (stage: number): void => {
            if (Number(stage) === 1) rdcAttach();
        },
        flatlineRdcRead: (gate: number): void => {
            rdcRead(Number(gate));
        },
        flatlineRdcState: (): M05RdcMirror => rdcState(),
    };

    Pages: WebsitePageDefinition[] = [
        {
            path: "/",
            title: RDC_TITLE,
            description: "Open a remote workstation with an access token.",
            html: renderToolPage({
                title: RDC_TITLE,
                style,
                body: shell,
                script,
            }),
            seo: true,
            search: [...RDC_SEARCH],
        },
    ];
}
