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

const isTemplateSubmission = (spec: ReportSpec, subject: string, content: string): boolean => {
    if (subject !== spec.templateId) return false;

    let fields: unknown;
    try {
        fields = JSON.parse(content);
    } catch {
        return false;
    }

    if (!fields || typeof fields !== "object") return false;

    return spec.matchesFields(fields as Record<string, unknown>);
};

const isFreehandSubmission = (spec: ReportSpec, subject: string, content: string): boolean =>
    subject.trim().toLowerCase() === spec.subject().toLowerCase() && content.trim() === spec.body();

export const isReportSubmission = (spec: ReportSpec, subject: string, content: string): boolean =>
    isTemplateSubmission(spec, subject, content) || isFreehandSubmission(spec, subject, content);
