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

export const M06_REPORT_ARCHITECT_TERMS: readonly string[] = ["lindqvist"];
export const M06_REPORT_ARCHITECT_REJECTED_TERMS: readonly string[] = ["voss"];
export const M06_REPORT_ROLE_CHAIR_TERMS: readonly string[] = ["chair", "主席"];
export const M06_REPORT_ROLE_RISK_TERMS: readonly string[] = ["risk", "风险"];
export const M06_REPORT_CHAIN_TERMS: readonly string[] = ["mutual", "holdings", "nominee"];
export const M06_REPORT_PROOF_CERTIFICATE_TERMS: readonly string[] = ["certificate", "cert", "证书"];
export const M06_REPORT_PROOF_REGISTRANT_TERMS: readonly string[] = ["bulletproof", "防弹"];
export const M06_REPORT_FRONT_TERMS: readonly string[] = ["voss"];
export const M06_REPORT_FRONT_NOMINEE_TERMS: readonly string[] = ["nominee", "front", "not the owner", "名义", "代持", "不是所有人"];

const reportFacts = (): Record<string, string> => ({
    architect: M06_REPORT_ARCHITECT,
    role: M06_REPORT_ROLE,
    chain: M06_REPORT_CHAIN,
    proof: M06_REPORT_PROOF,
    front: M06_REPORT_FRONT,
});

export const M06_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT);

export const buildM06ReportBody = (): string =>
    Localization.t(M06_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
