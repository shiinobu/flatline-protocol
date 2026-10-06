const SEPARATORS = /[\s,;:.\-_/()[\]\u3000-\u303f\uff00-\uffef]+/g;

export const normalizeAnswer = (value: unknown): string =>
    typeof value === "string" ? value.normalize("NFKC").toLowerCase().replace(SEPARATORS, " ").trim() : "";

export const answerEquals = (value: unknown, expected: string): boolean =>
    normalizeAnswer(value) === normalizeAnswer(expected);

export const answerIncludes = (value: unknown, needle: string): boolean => {
    const wanted = normalizeAnswer(needle);

    return wanted !== "" && normalizeAnswer(value).includes(wanted);
};

export const answerHasAny = (value: unknown, needles: readonly string[]): boolean =>
    needles.some((needle) => answerIncludes(value, needle));

export const answerHasAll = (value: unknown, needles: readonly string[]): boolean =>
    needles.every((needle) => answerIncludes(value, needle));

export const answerNumbers = (value: unknown): readonly string[] =>
    typeof value === "string" ? (value.normalize("NFKC").match(/\d+/g) ?? []) : [];
