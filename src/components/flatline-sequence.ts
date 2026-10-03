import { Localization, type CommandTools, type PrintColor } from "@hotbunny/hackhub-content-sdk";

import { KIT_I18N_KEY } from "../i18n/global/kit.js";
import { readCalm } from "./desktop-glitch.js";

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

export const playFlatline = async (tools: CommandTools, ip: string): Promise<void> => {
    const calm = readCalm();
    const pause = (ms: number): Promise<void> => (calm ? Promise.resolve() : tools.sleep(ms));
    const label = Localization.t(KIT_I18N_KEY.FLATLINE_BEACON);

    tools.println({ text: Localization.t(KIT_I18N_KEY.FLATLINE_LOCKING, { ip }), dim: true });
    await pause(LEAD_MS);

    for (const frame of PULSE_FRAMES) {
        tools.println([{ text: `  ${label}  `, dim: true }, { text: pulseOf(frame.scale), color: frame.color, bold: true }]);
        await pause(frame.holdMs);
    }
};
