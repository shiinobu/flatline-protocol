import coreScript from "./runtime/core.html";

export interface ToolPageParts {
    readonly title: string;
    readonly style: string;
    readonly body: string;
    readonly script: string;
    readonly lang?: string;
}

export const toolIcon = (shapes: string): string =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${shapes}</svg>`)}`;

export const renderToolPage = (parts: ToolPageParts): string =>
    [
        `<!DOCTYPE html><html lang="${parts.lang ?? "en"}"><head><meta charset="UTF-8">`,
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="color-scheme" content="dark">',
        `<title>${parts.title}</title>`,
        parts.style,
        "</head><body>",
        parts.body,
        `<script>(function () {\n${coreScript}${parts.script}})();</script>`,
        "</body></html>",
    ].join("\n");
