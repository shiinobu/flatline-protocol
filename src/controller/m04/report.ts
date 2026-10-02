import { answerEquals, answerHasAll, answerHasAny, answerIncludes } from "../../components/report-match.js";
import {
    M04_REPORT_CONTAINED_TERMS,
    M04_REPORT_CONTROL,
    M04_REPORT_HUNTER,
    M04_REPORT_ORIGIN_TERMS,
    M04_REPORT_REJECTED_RELAY,
    M04_REPORT_SUBJECT,
    M04_REPORT_TEMPLATE_CONTENT,
    M04_REPORT_TEMPLATE_ID,
    M04_REPORT_TEMPLATE_LABEL,
    buildM04ReportBody,
} from "../../content/m04/report.js";
import { M04_QUIET_MIRROR_CODENAME, M04_STATIC_HOP_CODENAME } from "../../content/m04/network.js";
import type { ReportSpec } from "../../core/types.js";

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { hunter, relays, control, origin, contained } = fields;

    return (
        answerIncludes(hunter, M04_REPORT_HUNTER) &&
        answerHasAll(relays, [M04_STATIC_HOP_CODENAME, M04_QUIET_MIRROR_CODENAME]) &&
        !answerIncludes(relays, M04_REPORT_REJECTED_RELAY) &&
        answerEquals(control, M04_REPORT_CONTROL) &&
        answerHasAny(origin, M04_REPORT_ORIGIN_TERMS) &&
        answerHasAny(contained, M04_REPORT_CONTAINED_TERMS)
    );
};

export const M04_REPORT_SPEC: ReportSpec = {
    templateId: M04_REPORT_TEMPLATE_ID,
    templateLabel: M04_REPORT_TEMPLATE_LABEL,
    fields: ["hunter", "relays", "control", "origin", "contained"],
    subject: M04_REPORT_SUBJECT,
    templateContent: M04_REPORT_TEMPLATE_CONTENT,
    body: buildM04ReportBody,
    matchesFields,
};
