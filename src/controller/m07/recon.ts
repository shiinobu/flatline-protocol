import { Localization, Mail, UI } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { BLACKLEDGER_DOMAIN } from "../../content/global/blackledger.js";
import {
    M07_CLAIM_LOOKUP_EVENT,
    M07_PAID_CLAIM_REFS,
    M07_RESERVE_REFS,
    type M07ClaimLookupPayload,
} from "../../content/m07/claims.js";
import { M07_GATES } from "../../content/m07/gates.js";
import { M07_DEAD_DROP_EMAIL, M07_HINT_MAIL, M07_TIP_SUBJECT } from "../../content/m07/mail.js";
import {
    M07_C2_IP,
    M07_LEGACY_CMS_PATH,
    M07_NET_TREE_SCRIPT_NAME,
    M07_PORTAL_HOST,
    M07_ROUTER_IP,
} from "../../content/m07/network.js";
import { M07_LOG_CLAIMS, M07_LOG_LEDGER_ROOM, M07_LOG_NODES } from "../../content/m07/quest-logs.js";
import {
    isM07LedgerRoomOpen,
    isM07PortalOpen,
    setM07DashboardOpen,
    setM07PortalOpen,
} from "../../context/m07/progress.js";
import { unlock } from "../../core/index.js";
import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { advanceStep } from "../../middleware/gate.js";
import { settleSealRead } from "./extract.js";
import type { M07Quest } from "./types.js";
import { M07_WORLD } from "./world.js";

interface PageVisit {
    readonly protocol: string;
    readonly hostname: string;
    readonly pathname: string;
}

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const isVisit = (visit: PageVisit, hostname: string, path: string): boolean =>
    visit.protocol === "https:" && visit.hostname === hostname && normalizePath(visit.pathname) === normalizePath(path);

const includesAll = (found: readonly string[], wanted: readonly string[]): boolean =>
    wanted.every((ref) => found.includes(ref));

const bindTip = (quest: M07Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M07_DEAD_DROP_EMAIL || data.subject !== M07_TIP_SUBJECT()) return;

        advanceStep(quest, M07_GATES, "tipReviewed", () => setM07PortalOpen(true));
    });
};

const bindPortal = (quest: M07Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isVisit(data, M07_PORTAL_HOST, "/") || !isM07PortalOpen()) return;

        advanceStep(quest, M07_GATES, "claimsPortalSeen");
    });
};

const recordPaidClaim = (quest: M07Quest, ref: string): void => {
    if (!quest.Data.claimsPortalSeen || quest.Data.claimsFound.includes(ref)) return;

    const found = [...quest.Data.claimsFound, ref];
    quest.SetData("claimsFound", found);

    if (!includesAll(found, M07_PAID_CLAIM_REFS)) return;

    advanceStep(quest, M07_GATES, "paidClaimsMatched", () =>
        traceBacktraceFinding("m7", "claims", M07_LOG_CLAIMS()),
    );
};

const recordReserve = (quest: M07Quest, ref: string): void => {
    if (!quest.Data.ledgerTaken || quest.Data.reservesFound.includes(ref)) return;

    const found = [...quest.Data.reservesFound, ref];
    quest.SetData("reservesFound", found);

    if (!includesAll(found, M07_RESERVE_REFS)) return;

    advanceStep(quest, M07_GATES, "reservesChecked", () => settleSealRead(quest));
};

const bindClaimLookups = (quest: M07Quest): void => {
    quest.Events.on(M07_CLAIM_LOOKUP_EVENT, (data: M07ClaimLookupPayload) => {
        if (data.kind === "paid") recordPaidClaim(quest, data.ref);
        else recordReserve(quest, data.ref);
    });
};

const bindEndpointMap = (quest: M07Quest): void => {
    quest.Events.on("Python3.ExecFile", (data) => {
        if (data.file.name !== M07_NET_TREE_SCRIPT_NAME || data.args[0] !== M07_ROUTER_IP) return;

        advanceStep(quest, M07_GATES, "endpointMapped", () => unlock(M07_WORLD, "edgeIntel"));
    });
};

const bindEdgeScan = (quest: M07Quest): void => {
    quest.Events.on("Terminal.NmapScan", (data) => {
        if (data.ip !== M07_C2_IP || !data.versionScan) return;

        advanceStep(quest, M07_GATES, "edgeScanned", () => {
            unlock(M07_WORLD, "legacyCms");
            setM07DashboardOpen(true);
        });
    });
};

const bindDashboard = (quest: M07Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isVisit(data, M07_C2_IP, M07_LEGACY_CMS_PATH)) return;

        advanceStep(quest, M07_GATES, "dashboardFound", () => {
            traceBacktraceFinding("m7", "nodes", M07_LOG_NODES());
            Mail.send(M07_HINT_MAIL());
        });
    });
};

const bindLedgerRoom = (quest: M07Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isVisit(data, BLACKLEDGER_DOMAIN, "/") || !isM07LedgerRoomOpen()) return;

        advanceStep(quest, M07_GATES, "blackledgerSeen", () => {
            traceBacktraceFinding("m7", "ledgerRoom", M07_LOG_LEDGER_ROOM());
            UI.toast(Localization.t(M07_I18N_KEY.TOAST_LAST_EVENT), "success");
        });
    });
};

export const bindM07Recon = (quest: M07Quest): void => {
    bindTip(quest);
    bindPortal(quest);
    bindClaimLookups(quest);
    bindEndpointMap(quest);
    bindEdgeScan(quest);
    bindDashboard(quest);
    bindLedgerRoom(quest);
};
