import { M05_PORTAL_CONTRACTOR_USER, M05_PORTAL_LOGIN_USER } from "../../../content/m05/portal.js";
import { siteT } from "../../../context/global/site-strings.js";
import { getM05PortalMin, getM05PortalUser } from "../../../context/m05/progress.js";
import { M05_HS_KEY } from "../../../i18n/m05/hospital.js";
import { M05_PORTAL_ZH } from "../../../i18n/m05/portal-zh.js";
import { fillDataMarker } from "../../global/localize.js";
import { renderToolPage } from "../../global/tool-page.js";
import { buildPortalPayload } from "./payload.js";

import script from "./script.html";
import shell from "./shell.html";
import style from "./style.html";

export type PortalView = "portal" | "contractor" | "login";

const PORTAL_TITLE = "PacificCare Remote Access";

const inlineJson = (value: unknown): string => JSON.stringify(value).split("<").join("\\x3c");

export const portalViewOf = (user: string): PortalView =>
    user === M05_PORTAL_LOGIN_USER ? "portal" : user === M05_PORTAL_CONTRACTOR_USER ? "contractor" : "login";

export const renderPortal = (): string => {
    const zh = siteT(M05_HS_KEY.LANG) === "zh";
    const table = zh ? M05_PORTAL_ZH : {};
    const user = getM05PortalUser();
    const view = portalViewOf(user);
    const boot = { view, user: view === "login" ? "" : user, min: getM05PortalMin() };

    const filled = fillDataMarker(
        fillDataMarker(
            fillDataMarker(script, "PORTAL_BOOT", inlineJson(boot)),
            "PORTAL_DATA",
            inlineJson(buildPortalPayload(table)),
        ),
        "PORTAL_ZH",
        inlineJson(table),
    );

    return renderToolPage({ title: PORTAL_TITLE, style, body: shell, script: filled, lang: zh ? "zh" : "en" });
};
