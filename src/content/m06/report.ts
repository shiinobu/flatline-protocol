import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M06_I18N_KEY } from "../../i18n/m06/core.js";
import { ARCHITECT_REAL_NAME } from "../global/characters.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import { M06_HOLDINGS_NAME, M06_MUTUAL_NAME, M06_VOSS_NAME } from "./records.js";

export const M06_REPORT_SUBJECT = (): string => Localization.t(M06_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M06_REPORT_TEMPLATE_ID = "flatline.m06.report";
export const M06_REPORT_TEMPLATE_LABEL = "Mission 6 Findings";

export const M06_REPORT_ARCHITECT = ARCHITECT_REAL_NAME;
export const M06_REPORT_ROLE = `Chairman Risk Committee, ${M06_MUTUAL_NAME}`;
export const M06_REPORT_CHAIN = `${M06_MUTUAL_NAME}, ${M06_HOLDINGS_NAME}, ${M03_PARENT_ENTITY_NAME}`;
export const M06_REPORT_PROOF = "shared certificate and registrant Bulletproof VPN Ltd.";
export const M06_REPORT_FRONT = `${M06_VOSS_NAME} is a nominee, not the owner`;

export const M06_REPORT_REJECTED_ARCHITECT = M06_VOSS_NAME;
export const M06_REPORT_REJECTED_PROOF = "the registered agent filed it";

const reportFacts = (): Record<string, string> => ({
    architect: M06_REPORT_ARCHITECT,
    role: M06_REPORT_ROLE,
    chain: M06_REPORT_CHAIN,
    proof: M06_REPORT_PROOF,
    front: M06_REPORT_FRONT,
});

export const M06_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM06ReportBody = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
