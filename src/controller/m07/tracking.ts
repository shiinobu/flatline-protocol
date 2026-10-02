import { Files, Localization, Mail, UI, type FileInfo } from "@hotbunny/hackhub-content-sdk";

import { beginStrike, escapeStrike, registerIntrusionHandlers } from "../../components/intrusion.js";
import { startBreach } from "../../components/desktop-breach.js";
import { penalty } from "../../components/reward.js";
import { M07_C2_IP } from "../../content/m07/network.js";
import { M07_TRACE_WARNING_MAIL } from "../../content/m07/mail.js";
import {
    M07_SAVE_PREFIX,
    M07_SCOPE,
    M07_TRACE_DEADLINE_REAL_MS,
    M07_TRACE_HALVED_REAL_MS,
    M07_TRACE_PENALTY,
    M07_TRACE_STRIKE_ID,
} from "../../content/m07/quest.js";
import {
    M07_LEDGER_FILE_CONTENT,
    M07_LEDGER_FILE_EXTENSION,
    M07_LEDGER_FILE_NAME,
    M07_LEDGER_WIPED_CONTENT,
} from "../../content/m07/server-files.js";
import { trace } from "../../helpers/logger.js";
import { kitBreachText } from "../../i18n/global/kit.js";
import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { buildM07IncidentLog } from "./incident.js";
import type { M07Quest } from "./types.js";

const bannerText = () => ({
    label: Localization.t(M07_I18N_KEY.BANNER_LABEL),
    criticalLabel: Localization.t(M07_I18N_KEY.BANNER_CRITICAL),
    detail: Localization.t(M07_I18N_KEY.BANNER_DETAIL),
    severedLabel: Localization.t(M07_I18N_KEY.BANNER_ESCAPED),
    severedDetail: Localization.t(M07_I18N_KEY.BANNER_ESCAPED_DETAIL),
    breachedLabel: Localization.t(M07_I18N_KEY.BANNER_TRACED),
    breachedDetail: Localization.t(M07_I18N_KEY.BANNER_TRACED_DETAIL),
});

const armTrace = (deadlineRealMs: number): void => {
    beginStrike({
        scope: M07_SCOPE,
        prefix: M07_SAVE_PREFIX,
        strikeId: M07_TRACE_STRIKE_ID,
        ip: M07_C2_IP,
        alias: M07_TRACE_STRIKE_ID,
        deadlineRealMs,
        repellable: false,
        banner: bannerText(),
        toast: Localization.t(M07_I18N_KEY.TOAST_TRACE),
    });
};

const findLedgerOnTarget = async (): Promise<FileInfo | null> => {
    const root = Files.getById(M07_C2_IP);
    if (root === null) return null;

    const children = await Files.getChildren(root.id);
    return (
        children.find(
            (child) => child.name === M07_LEDGER_FILE_NAME && child.extension === M07_LEDGER_FILE_EXTENSION,
        ) ?? null
    );
};

const wipeLedger = async (quest: M07Quest): Promise<void> => {
    const file = await findLedgerOnTarget();
    if (file === null) {
        trace(M07_SCOPE, "ledger wipe skipped: file not reachable");
        return;
    }

    Files.write(file.id, M07_LEDGER_WIPED_CONTENT());
    quest.SetData("ledgerWiped", true);
    trace(M07_SCOPE, "ledger payload wiped");
};

const restoreLedger = async (quest: M07Quest): Promise<void> => {
    if (!quest.Data.ledgerWiped) return;

    const file = await findLedgerOnTarget();
    if (file === null) {
        trace(M07_SCOPE, "ledger restore skipped: file not reachable");
        return;
    }

    Files.write(file.id, M07_LEDGER_FILE_CONTENT);
    quest.SetData("ledgerWiped", false);
    trace(M07_SCOPE, "ledger payload restored");
};

export const bindM07Tracking = (quest: M07Quest): void => {
    registerIntrusionHandlers(M07_SAVE_PREFIX, {
        onExpired: async () => {
            if (quest.Data.fileExtracted) return;

            const charged = penalty(M07_SCOPE, M07_TRACE_PENALTY, "Traced session — loss");
            trace(M07_SCOPE, `trace expired penalty=${charged}`);
            await wipeLedger(quest);
            await startBreach(
                {
                    scope: M07_SCOPE,
                    mission: "m07",
                    ip: M07_C2_IP,
                    alias: M07_TRACE_STRIKE_ID,
                    buildIncidentLog: buildM07IncidentLog,
                },
                kitBreachText(),
            );
        },
    });
};

export const startM07Trace = (quest: M07Quest): void => {
    if (quest.Data.fileExtracted) return;

    armTrace(quest.Data.traceHalved ? M07_TRACE_HALVED_REAL_MS : M07_TRACE_DEADLINE_REAL_MS);
};

export const resumeM07Trace = async (quest: M07Quest): Promise<void> => {
    if (quest.Data.fileExtracted || !quest.Data.shellObtained) return;

    await restoreLedger(quest);
    startM07Trace(quest);
};

export const halveM07Trace = (quest: M07Quest): void => {
    if (quest.Data.fileExtracted || quest.Data.traceHalved) return;

    quest.SetData("traceHalved", true);
    Mail.send(M07_TRACE_WARNING_MAIL());
    UI.toast(Localization.t(M07_I18N_KEY.TOAST_HALVED), "warning");
    armTrace(M07_TRACE_HALVED_REAL_MS);
    trace(M07_SCOPE, "trace window halved");
};

export const endM07Trace = (): void => {
    escapeStrike(M07_SAVE_PREFIX);
};
