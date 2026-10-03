export interface LogDay {
    readonly year: number;
    readonly month: number;
    readonly day: number;
}

export interface LogEntry {
    readonly id: string;
    readonly date: number;
    readonly type: string;
    readonly description: string;
}

export const LOG_TYPE = {
    connection: "CONNECTION_ETABLISHED",
    lost: "CONNECTION_LOST",
    event: "SYSTEM",
} as const;

const LOG_LINE = /^(?:[A-Za-z]{3} {1,2}\d{1,2} )?(\d{2}):(\d{2}):(\d{2}) (.+)$/;
const LOST_WORDS = /\b(drop|closed|dropped|released|terminated|did not receive)\b/i;
const CONNECTION_WORDS = /\b(accept(ed)?|established)\b/i;

const typeOf = (description: string): string => {
    if (LOST_WORDS.test(description)) return LOG_TYPE.lost;
    if (CONNECTION_WORDS.test(description)) return LOG_TYPE.connection;
    return LOG_TYPE.event;
};

const dateOf = (day: LogDay, hours: string, minutes: string, seconds: string): number =>
    new Date(day.year, day.month - 1, day.day, Number(hours), Number(minutes), Number(seconds)).getTime();

const entryOf = (line: string, index: number, day: LogDay): LogEntry => {
    const match = LOG_LINE.exec(line);
    if (match === null) throw new Error(`log line has no timestamp: ${line}`);

    const [, hours, minutes, seconds, description] = match;
    return {
        id: `entry-${index + 1}`,
        date: dateOf(day, hours, minutes, seconds),
        type: typeOf(description),
        description,
    };
};

export const parseLog = (text: string, day: LogDay): readonly LogEntry[] =>
    text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .map((line, index) => entryOf(line, index, day));

export const asLogData = (entries: readonly LogEntry[]): string => entries as unknown as string;
