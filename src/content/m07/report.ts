import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { ARCHITECT_REAL_NAME } from "../global/characters.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import { M07_CHOICES } from "./choice.js";
import { M07_EVIDENCE_CLASSIFICATION } from "./server-files.js";

export const M07_ARCHITECT_REAL_NAME = ARCHITECT_REAL_NAME;

export const M07_REPORT_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M07_REPORT_TEMPLATE_ID = "flatline.m07.report";
export const M07_REPORT_TEMPLATE_LABEL = "Mission 7 Findings";

export const M07_REPORT_EVIDENCE = (): string => M07_EVIDENCE_CLASSIFICATION;

export const M07_REPORT_CHOICE_HINT = M07_CHOICES.join(" / ");

const reportFacts = (): Record<string, string> => ({
    architect: M07_ARCHITECT_REAL_NAME,
    parentEntity: M03_PARENT_ENTITY_NAME,
    evidence: M07_REPORT_EVIDENCE(),
    choice: M07_REPORT_CHOICE_HINT,
});

export const M07_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, reportFacts());

export const buildM07ReportBody = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_REPORT_BODY, reportFacts());
