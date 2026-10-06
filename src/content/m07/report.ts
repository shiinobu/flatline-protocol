import { Localization } from "@hotbunny/hackhub-content-sdk";

import { M07_I18N_KEY } from "../../i18n/m07/core.js";
import { ARCHITECT_REAL_NAME } from "../global/characters.js";
import { M03_PARENT_ENTITY_NAME } from "../global/entities.js";
import { M07_CHOICES } from "./choice.js";
import { M07_ASHVECTOR_CODENAME, M07_C2_IP, M07_FIREWALL_LABEL } from "./network.js";

export const M07_ARCHITECT_REAL_NAME = ARCHITECT_REAL_NAME;

export const M07_REPORT_SUBJECT = (): string => Localization.t(M07_I18N_KEY.MAIL_REPORT_SUBJECT);
export const M07_REPORT_TEMPLATE_ID = "flatline.m07.report";
export const M07_REPORT_TEMPLATE_LABEL = "Mission 7 Findings";

export const M07_REPORT_CHOICE_HINT = M07_CHOICES.join(" / ");

export const M07_REPORT_ARCHITECT_TERMS: readonly string[] = ["lindqvist"];
export const M07_REPORT_PATH_TERMS: readonly string[] = [M07_ASHVECTOR_CODENAME, M07_FIREWALL_LABEL, M07_C2_IP];
export const M07_REPORT_EVIDENCE_FAULT_TERMS: readonly string[] = ["negligen", "疏忽", "过失"];
export const M07_REPORT_EVIDENCE_PERSON_TERMS: readonly string[] = ["natnaree"];

const templateFacts = (): Record<string, string> => ({
    parentEntity: M03_PARENT_ENTITY_NAME,
    choices: M07_REPORT_CHOICE_HINT,
});

export const M07_REPORT_TEMPLATE_CONTENT = (): string =>
    Localization.t(M07_I18N_KEY.MAIL_REPORT_TEMPLATE_CONTENT, templateFacts());
