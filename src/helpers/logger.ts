export const trace = (scope: string, message: string, ...args: unknown[]): void => {
    console.log(`[FP][${scope}] ${message}`, ...args);
};