import { Mail } from "@hotbunny/hackhub-content-sdk";

import type { ReportSpec } from "../core/types.js";

export const registerReportTemplate = (spec: ReportSpec): void => {
    Mail.registerTemplate({
        id: spec.templateId,
        label: spec.templateLabel,
        title: spec.subject(),
        content: spec.templateContent(),
        fields: [...spec.fields],
    });
};

const parseTemplateFields = (spec: ReportSpec, subject: string, content: string): Record<string, unknown> | null => {
    if (subject !== spec.templateId) return null;

    let fields: unknown;
    try {
        fields = JSON.parse(content);
    } catch {
        return null;
    }

    if (!fields || typeof fields !== "object") return null;

    return fields as Record<string, unknown>;
};

const isTemplateSubmission = (spec: ReportSpec, subject: string, content: string): boolean => {
    const fields = parseTemplateFields(spec, subject, content);

    return fields !== null && spec.matchesFields(fields);
};

export const isReportTemplateAttempt = (spec: ReportSpec, subject: string, content: string): boolean =>
    parseTemplateFields(spec, subject, content) !== null;

const isFreehandSubmission = (spec: ReportSpec, subject: string, content: string): boolean =>
    spec.body !== undefined &&
    subject.trim().toLowerCase() === spec.subject().toLowerCase() &&
    content.trim() === spec.body();

export const isReportSubmission = (spec: ReportSpec, subject: string, content: string): boolean =>
    isTemplateSubmission(spec, subject, content) || isFreehandSubmission(spec, subject, content);
