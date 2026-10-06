export const M07_CHOICE_EXPOSE = "expose";
export const M07_CHOICE_HANDOFF = "handoff";
export const M07_CHOICE_DESTROY = "destroy";

export const M07_CHOICES: readonly string[] = [M07_CHOICE_EXPOSE, M07_CHOICE_HANDOFF, M07_CHOICE_DESTROY];

export const isM07Choice = (value: unknown): boolean =>
    typeof value === "string" && M07_CHOICES.includes(value.trim().toLowerCase());
