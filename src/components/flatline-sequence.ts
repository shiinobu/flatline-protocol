import type { CommandTools, PrintColor } from "@hotbunny/hackhub-content-sdk";

import { readCalm } from "./desktop-glitch.js";

export interface FlatlineLabels {
    readonly locking: string;
    readonly beacon: string;
}

interface PulseFrame {
    readonly scale: number;
    readonly color: PrintColor;
    readonly holdMs: number;
}

const PULSE_SHAPE: readonly number[] = [0, 1, 2, 4, 7, 2, 0, 0, 1, 3, 6, 2, 0, 0];
const PULSE_GLYPHS = "▁▂▃▄▅▆▇█";
const LEAD_MS = 700;

const PULSE_FRAMES: readonly PulseFrame[] = [
    { scale: 1, color: "green", holdMs: 550 },
    { scale: 0.7, color: "yellow", holdMs: 550 },
    { scale: 0.45, color: "orange", holdMs: 550 },
    { scale: 0.2, color: "red", holdMs: 550 },
    { scale: 0, color: "red", holdMs: 900 },
];

const pulseOf = (scale: number): string =>
    PULSE_SHAPE.map((height) => PULSE_GLYPHS.charAt(Math.round(height * scale))).join("");

export const playFlatline = async (tools: CommandTools, labels: FlatlineLabels): Promise<void> => {
    const calm = readCalm();
    const pause = (ms: number): Promise<void> => (calm ? Promise.resolve() : tools.sleep(ms));

    tools.println({ text: labels.locking, dim: true });
    await pause(LEAD_MS);

    for (const frame of PULSE_FRAMES) {
        tools.println([
            { text: `  ${labels.beacon}  `, dim: true },
            { text: pulseOf(frame.scale), color: frame.color, bold: true },
        ]);
        await pause(frame.holdMs);
    }
};
