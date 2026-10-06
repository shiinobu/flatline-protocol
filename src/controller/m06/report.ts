import { answerHasAll, answerHasAny } from "../../components/report-match.js";
import {
    M06_REPORT_ARCHITECT_REJECTED_TERMS,
    M06_REPORT_ARCHITECT_TERMS,
    M06_REPORT_CHAIN_TERMS,
    M06_REPORT_FRONT_NOMINEE_TERMS,
    M06_REPORT_FRONT_TERMS,
    M06_REPORT_PROOF_CERTIFICATE_TERMS,
    M06_REPORT_PROOF_REGISTRANT_TERMS,
    M06_REPORT_ROLE_CHAIR_TERMS,
    M06_REPORT_ROLE_RISK_TERMS,
    M06_REPORT_SUBJECT,
    M06_REPORT_TEMPLATE_CONTENT,
    M06_REPORT_TEMPLATE_ID,
    M06_REPORT_TEMPLATE_LABEL,
    buildM06ReportBody,
    M06_REPORT_AGENT_TERMS,
} from "../../content/m06/report.js";
import type { ReportSpec } from "../../core/types.js";

const matchesArchitect = (value: unknown): boolean =>
    answerHasAny(value, M06_REPORT_ARCHITECT_TERMS) && !answerHasAny(value, M06_REPORT_ARCHITECT_REJECTED_TERMS);

const matchesRole = (value: unknown): boolean =>
    answerHasAny(value, M06_REPORT_ROLE_CHAIR_TERMS) && answerHasAny(value, M06_REPORT_ROLE_RISK_TERMS);

const matchesProof = (value: unknown): boolean =>
    answerHasAny(value, M06_REPORT_PROOF_CERTIFICATE_TERMS) && answerHasAny(value, M06_REPORT_PROOF_REGISTRANT_TERMS);

const matchesFront = (value: unknown): boolean =>
    answerHasAny(value, M06_REPORT_FRONT_TERMS) && answerHasAny(value, M06_REPORT_FRONT_NOMINEE_TERMS);

const matchesFields = (fields: Record<string, unknown>): boolean => {
    const { architect, role, agent, chain, proof, front } = fields;

    return (
        matchesArchitect(architect) &&
        matchesRole(role) &&
        answerHasAny(agent, M06_REPORT_AGENT_TERMS) &&
        answerHasAll(chain, M06_REPORT_CHAIN_TERMS) &&
        matchesProof(proof) &&
        matchesFront(front)
    );
};

export const M06_REPORT_SPEC: ReportSpec = {
    templateId: M06_REPORT_TEMPLATE_ID,
    templateLabel: M06_REPORT_TEMPLATE_LABEL,
    fields: ["architect", "role", "agent", "chain", "proof", "front"],
    subject: M06_REPORT_SUBJECT,
    templateContent: M06_REPORT_TEMPLATE_CONTENT,
    body: buildM06ReportBody,
    matchesFields,
};
