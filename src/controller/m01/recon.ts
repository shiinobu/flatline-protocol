import { Mail } from "@hotbunny/hackhub-content-sdk";

import { traceBacktraceFinding } from "../../applications/backtrace-state.js";
import { ensureM01ListingResolution, getM01ListingSlot } from "../../context/m01/listing.js";
import { M01_GATES } from "../../content/m01/gates.js";
import { M01_TIPSTER_EMAIL, M01_TIP_SUBJECT } from "../../content/m01/mail.js";
import {
    M01_BLACKWIRE_IP,
    M01_BROKER_BACKEND_SUBDOMAIN,
    M01_DOMAIN,
    M01_FROSTGATE_IP,
} from "../../content/m01/network.js";
import { M01_LOG_DEFAULT } from "../../content/m01/quest.js";
import { M01_WORLD } from "./world.js";
import { unlock } from "../../core/index.js";
import { advanceStep } from "../../middleware/gate.js";
import type { M01Quest } from "./types.js";

const isTipMail = (from: string, subject: string): boolean => from === M01_TIPSTER_EMAIL && subject === M01_TIP_SUBJECT();

const bindTip = (quest: M01Quest): void => {
    const alreadyRead = Mail.getInbox().some((info) => info.read && info.from === M01_TIPSTER_EMAIL);
    if (alreadyRead) advanceStep(quest, M01_GATES, "tipReviewed");

    quest.Events.on("Mail.Read", (data) => {
        ensureM01ListingResolution();

        if (!isTipMail(data.from, data.subject)) return;

        advanceStep(quest, M01_GATES, "tipReviewed");
    });
};

const bindLookups = (quest: M01Quest): void => {
    quest.Events.on("Terminal.Nslookup", (data) => {
        if (!quest.Data.domainResolved && data.domain === M01_DOMAIN) {
            quest.SetData("domainResolved", true);
        }

        if (!quest.Data.backendResolved && data.domain === M01_BROKER_BACKEND_SUBDOMAIN) {
            quest.SetData("backendResolved", true);
        }
    });

    quest.Events.on("Terminal.NmapScan", (data) => {
        if (quest.Data.frontScanned) return;
        if (data.ip !== M01_BLACKWIRE_IP) return;

        quest.SetData("frontScanned", true);
    });

    quest.Events.on("Subfinder.Results", (data) => {
        if (quest.Data.subdomainsEnumerated) return;
        if (data.domain !== M01_DOMAIN) return;

        quest.SetData("subdomainsEnumerated", true);
    });

    quest.Events.on("Terminal.Geoip", (data) => {
        if (quest.Data.decoyRuledOut) return;
        if (data !== M01_FROSTGATE_IP) return;

        quest.SetData("decoyRuledOut", true);
    });
};

const bindListing = (quest: M01Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (quest.Data.listingFound) return;
        if (data.protocol !== "https:") return;

        const resolution = ensureM01ListingResolution();
        const winnerSlot = getM01ListingSlot(resolution.winnerId);
        if (!winnerSlot) return;
        if (data.hostname !== winnerSlot.domain) return;
        if (data.pathname.replace(/\/$/, "") !== winnerSlot.path.replace(/\/$/, "")) return;

        advanceStep(quest, M01_GATES, "listingFound", () => {
            unlock(M01_WORLD, "brokerLead");
            traceBacktraceFinding("m1", "broker", M01_LOG_DEFAULT());
        });
    });
};

export const bindM01Recon = (quest: M01Quest): void => {
    bindTip(quest);
    bindLookups(quest);
    bindListing(quest);
};
