import { RegisterWebsite, Website, type WebsitePageDefinition } from "@hotbunny/hackhub-content-sdk";

import type { RdcLoginResult, RdcMirror, RdcPageProfile } from "../../../content/global/rdc.js";
import { M05_RDC_DOMAIN } from "../../../content/m05/network.js";
import { renderToolPage, toolIcon } from "../tool-page.js";
import { rdcAttach, rdcLogin, rdcProfile, rdcRead, rdcSeed, rdcSignal, rdcState } from "./exports.js";

import script from "./script.html";
import shell from "./shell.html";
import style from "./style.html";

const RDC_TITLE = "Remote Desktop Connection";
const RDC_SEARCH: readonly string[] = ["remote desktop connection", "remote desktop", "remote display", "workstation console", "rdc"];

const RDC_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#1b1d22"/>' +
        '<g transform="translate(9.9 9.9) scale(1.7)">' +
        '<rect x="1.8" y="2.8" width="15.4" height="11.4" rx="3" fill="none" stroke="#edeff2" stroke-width="1.6"/>' +
        '<rect x="8" y="9" width="16.2" height="12.6" rx="3" fill="#edeff2"/>' +
        '<path d="M13.2 12.6v6.2l1.7-1.6 1.2 2.6 1.4-.6-1.2-2.6 2.3-.1z" fill="#1b1d22"/>' +
        "</g>",
);

@RegisterWebsite
export class RemoteDesktopConnectionWebsite extends Website {
    SiteName = "RDC";
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
        flatlineRdcSeed: (seed: number): void => {
            rdcSeed(Number(seed));
        },
        flatlineRdcState: (): RdcMirror => rdcState(),
        flatlineRdcProfile: (): RdcPageProfile | null => rdcProfile(),
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
