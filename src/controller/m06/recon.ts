import { M06_GATES, M06_STEP_ORDER } from "../../content/m06/gates.js";
import {
    M06_DEAD_DROP_EMAIL,
    M06_PREMATURE_MAIL_SLOT,
    M06_TIP_SUBJECT,
    buildM06PrematureReply,
} from "../../content/m06/mail.js";
import {
    M06_AGENT_DOMAIN,
    M06_FILINGS_ARCHIVE_PATH,
    M06_NOMINEES_PATH,
    M06_REGISTRY_DOMAIN,
} from "../../content/m06/network.js";
import { M06_OBJECTIVE_IDS } from "../../content/m06/quest.js";
import { sendReplacingMail } from "../../components/mail.js";
import { isReportSubmission } from "../../components/report.js";
import { unlock } from "../../core/index.js";
import { trace } from "../../helpers/logger.js";
import { advanceStep, firstUnmetStep } from "../../middleware/gate.js";
import { M06_REPORT_SPEC } from "./report.js";
import type { M06Quest } from "./types.js";
import { M06_WORLD } from "./world.js";

const normalizePath = (path: string): string => path.replace(/\/$/, "");

const isRegistryPage = (hostname: string, protocol: string): boolean =>
    protocol === "https:" && hostname === M06_REGISTRY_DOMAIN;

const bindTip = (quest: M06Quest): void => {
    quest.Events.on("Mail.Read", (data) => {
        if (data.from !== M06_DEAD_DROP_EMAIL || data.subject !== M06_TIP_SUBJECT()) return;

        advanceStep(quest, M06_GATES, "tipReviewed");
    });
};

const bindRegistry = (quest: M06Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (!isRegistryPage(data.hostname, data.protocol)) return;

        trace("M06", "probe:registry-page", { pathname: data.pathname });

        advanceStep(quest, M06_GATES, "registryReached", () => unlock(M06_WORLD, "nomineesRecord"));

        const path = normalizePath(data.pathname);
        if (path === normalizePath(M06_NOMINEES_PATH)) {
            advanceStep(quest, M06_GATES, "nomineesRead");
            return;
        }

        if (path === normalizePath(M06_FILINGS_ARCHIVE_PATH)) {
            advanceStep(quest, M06_GATES, "hiddenFilingsFound");
        }
    });
};

const bindAgent = (quest: M06Quest): void => {
    quest.Events.on("Terminal.Whois", (data) => {
        if (data.domain !== M06_AGENT_DOMAIN) return;

        trace("M06", "probe:agent-whois", { domain: data.domain });

        advanceStep(quest, M06_GATES, "agentIdentified");
    });
};

const bindDirhunter = (quest: M06Quest): void => {
    quest.Events.on("Terminal.Dirhunter", (data) => {
        const host = data.host.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
        if (host !== M06_REGISTRY_DOMAIN) return;

        trace("M06", "probe:dirhunter-no-subnet", { host, results: data.results });
    });
};

const bindReport = (quest: M06Quest): void => {
    quest.Events.on("Mail.Sent", (data) => {
        if (quest.Data.reportSent) return;
        if (data.to !== M06_DEAD_DROP_EMAIL) return;
        if (!isReportSubmission(M06_REPORT_SPEC, data.subject, data.content)) return;

        const accepted = advanceStep(quest, M06_GATES, "reportSent", () =>
            quest.completeObjective(M06_OBJECTIVE_IDS.reportFindings),
        );
        if (accepted) return;

        sendReplacingMail(M06_PREMATURE_MAIL_SLOT, buildM06PrematureReply(firstUnmetStep(M06_STEP_ORDER, quest.Data)));
    });
};

export const bindM06Recon = (quest: M06Quest): void => {
    bindTip(quest);
    bindRegistry(quest);
    bindAgent(quest);
    bindDirhunter(quest);
    bindReport(quest);
};
