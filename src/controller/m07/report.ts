import { answerHasAll, answerHasAny, answerIncludes, normalizeAnswer } from "../../components/report-match.js";
import { isM07Choice } from "../../content/m07/choice.js";
import {
    M07_REPORT_ACCOUNT_TERMS,
    M07_REPORT_ARCHITECT_REJECTED_TERMS,
    M07_REPORT_ARCHITECT_TERMS,
    M07_REPORT_CLAIMS_PAYER_TERMS,
    M07_REPORT_CLAIMS_TERMS,
    M07_REPORT_INSTRUCTION_DATE_TERMS,
    M07_REPORT_INSTRUCTION_TERMS,
    M07_REPORT_ORDER_SOURCE_TERMS,
    M07_REPORT_ORDER_TIME_TERMS,
    M07_REPORT_ORDER_WHO_TERMS,
    M07_REPORT_PATH_REJECTED_TERMS,
    M07_REPORT_PATH_TERMS,
    M07_REPORT_RESERVE_TERMS,
    M07_REPORT_SUBJECT,
    M07_REPORT_SURVEY_DATE_TERMS,
    M07_REPORT_SURVEY_TERMS,
    M07_REPORT_TEMPLATE_CONTENT,
    M07_REPORT_TEMPLATE_ID,
    M07_REPORT_TEMPLATE_LABEL,
} from "../../content/m07/report.js";
import type { ReportSpec } from "../../core/types.js";

const PATH_MATCHES_NEEDED = 2;

export const readM07Choice = (fields: Record<string, unknown>): string | null => {
    const { choice } = fields;
    return isM07Choice(choice) ? normalizeAnswer(choice) : null;
};

const matchesArchitect = (value: unknown): boolean =>
    answerHasAll(value, M07_REPORT_ARCHITECT_TERMS) && !answerHasAny(value, M07_REPORT_ARCHITECT_REJECTED_TERMS);

const matchesPath = (value: unknown): boolean =>
    M07_REPORT_PATH_TERMS.filter((term) => answerIncludes(value, term)).length >= PATH_MATCHES_NEEDED &&
    !answerHasAny(value, M07_REPORT_PATH_REJECTED_TERMS);

const matchesClaims = (value: unknown): boolean =>
    answerHasAny(value, M07_REPORT_CLAIMS_TERMS) && answerHasAny(value, M07_REPORT_CLAIMS_PAYER_TERMS);

const matchesOrders = (value: unknown): boolean =>
    answerHasAny(value, M07_REPORT_ORDER_TIME_TERMS) &&
    answerHasAny(value, M07_REPORT_ORDER_WHO_TERMS) &&
    answerHasAny(value, M07_REPORT_ORDER_SOURCE_TERMS);

const matchesSurvey = (value: unknown): boolean =>
    answerHasAny(value, M07_REPORT_SURVEY_TERMS) && answerHasAny(value, M07_REPORT_SURVEY_DATE_TERMS);

const matchesInstruction = (value: unknown): boolean =>
    answerHasAny(value, M07_REPORT_INSTRUCTION_TERMS) && answerHasAny(value, M07_REPORT_INSTRUCTION_DATE_TERMS);

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { architect, path, claims, reserves, orders, survey, account, instruction } = fields;

    return (
        matchesArchitect(architect) &&
        matchesPath(path) &&
        matchesClaims(claims) &&
        answerHasAll(reserves, M07_REPORT_RESERVE_TERMS) &&
        matchesOrders(orders) &&
        matchesSurvey(survey) &&
        answerHasAny(account, M07_REPORT_ACCOUNT_TERMS) &&
        matchesInstruction(instruction) &&
        readM07Choice(fields) !== null
    );
};

export const M07_REPORT_SPEC: ReportSpec = {
    templateId: M07_REPORT_TEMPLATE_ID,
    templateLabel: M07_REPORT_TEMPLATE_LABEL,
    fields: ["architect", "path", "claims", "reserves", "orders", "survey", "account", "instruction", "choice"],
    subject: M07_REPORT_SUBJECT,
    templateContent: M07_REPORT_TEMPLATE_CONTENT,
    matchesFields,
};
