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

export interface LogOptions {
    readonly type?: string;
}

export const LOG_TYPE = {
    connection: "CONNECTION_ETABLISHED",
    lost: "CONNECTION_LOST",
    event: "SYSTEM",
} as const;

const SYSLOG_LINE = /^([A-Za-z]{3}) {1,2}(\d{1,2}) (\d{2}):(\d{2}):(\d{2}) (.+)$/;
const CLOCK_LINE = /^(\d{2}):(\d{2}):(\d{2}) (.+)$/;
const ISO_LINE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?(?: UTC)? +(?:\u2014 +)?(.+)$/;
const LOST_WORDS = /\b(drop|closed|dropped|released|terminated|did not receive)\b/i;
const CONNECTION_WORDS = /\b(accept(ed)?|established)\b/i;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ParsedLine {
    readonly date: number;
    readonly description: string;
}

const typeOf = (description: string): string => {
    if (LOST_WORDS.test(description)) return LOG_TYPE.lost;
    if (CONNECTION_WORDS.test(description)) return LOG_TYPE.connection;
    return LOG_TYPE.event;
};

const dateOf = (
    year: number,
    month: number,
    day: number,
    hours: string,
    minutes: string,
    seconds: string,
): number => new Date(year, month - 1, day, Number(hours), Number(minutes), Number(seconds)).getTime();

const parseIso = (line: string): ParsedLine | null => {
    const match = ISO_LINE.exec(line);
    if (match === null) return null;

    const [, year, month, day, hours, minutes, seconds = "0", description] = match;
    return { date: dateOf(Number(year), Number(month), Number(day), hours, minutes, seconds), description };
};

const parseSyslog = (line: string, day: LogDay): ParsedLine | null => {
    const match = SYSLOG_LINE.exec(line);
    if (match === null) return null;

    const [, monthName, dayOfMonth, hours, minutes, seconds, description] = match;
    const month = MONTH_NAMES.indexOf(monthName) + 1;
    if (month === 0) throw new Error(`log line has an unknown month: ${line}`);

    return { date: dateOf(day.year, month, Number(dayOfMonth), hours, minutes, seconds), description };
};

const parseClock = (line: string, day: LogDay): ParsedLine | null => {
    const match = CLOCK_LINE.exec(line);
    if (match === null) return null;

    const [, hours, minutes, seconds, description] = match;
    return { date: dateOf(day.year, day.month, day.day, hours, minutes, seconds), description };
};

const entryOf = (line: string, index: number, day: LogDay, options: LogOptions): LogEntry => {
    const parsed = parseIso(line) ?? parseSyslog(line, day) ?? parseClock(line, day);
    if (parsed === null) throw new Error(`log line has no timestamp: ${line}`);

    return {
        id: `entry-${index + 1}`,
        date: parsed.date,
        type: options.type ?? typeOf(parsed.description),
        description: parsed.description,
    };
};

export const parseLog = (text: string, day: LogDay, options: LogOptions = {}): readonly LogEntry[] =>
    text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .map((line, index) => entryOf(line, index, day, options));

export const asLogData = (entries: readonly LogEntry[]): string => entries as unknown as string;
