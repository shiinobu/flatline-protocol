import { ModSettings } from "@hotbunny/hackhub-content-sdk";

import { injectCss, removeCss } from "./css-inject.js";
import { isDesktopMounted, onSessionLeft } from "./session-guard.js";

export type GlitchLevel = 0 | 1 | 2 | 3;

interface LevelSpec {
    readonly power: number;
    readonly gapMinMs: number;
    readonly gapMaxMs: number;
}

export const REDUCE_FLASHING_SETTING = "reduceFlashing";

const FX_ID = "flatline-glitch-fx";
const BURST_CLASS = "flatline-glitch-burst";
const CSS_MARKER = "--flatline-glitch";
const BURST_MIN_MS = 90;
const BURST_MAX_MS = 260;
const JUMP_POWER_FLOOR = 1.2;
const JUMP_CHANCE = 0.5;
const JUMP_MAX_PX = 26;
const BAR_BASE = 2;
const BAR_PER_POWER = 3;
const BLOCK_PER_POWER = 3;
const TINT_SHARE = 0.45;

const LEVELS: readonly LevelSpec[] = [
    { power: 0, gapMinMs: 0, gapMaxMs: 0 },
    { power: 0.7, gapMinMs: 1800, gapMaxMs: 3600 },
    { power: 1.1, gapMinMs: 900, gapMaxMs: 2200 },
    { power: 1.7, gapMinMs: 320, gapMaxMs: 1000 },
];

const SPLIT_SHADOW = "var(--fx-split) 0 rgba(255, 0, 70, 0.9), calc(var(--fx-split) * -1) 0 rgba(0, 230, 255, 0.9)";

const NOISE_IMAGE =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

const GLITCH_CSS = `
body.${BURST_CLASS} .program { translate: var(--fx-dx) var(--fx-dy); text-shadow: ${SPLIT_SHADOW}; }
body.${BURST_CLASS} .desktop { translate: 0 var(--fx-jump); }
body.${BURST_CLASS} [class*="_taskbar_"] { translate: calc(var(--fx-dx) * 0.7) 0; text-shadow: ${SPLIT_SHADOW}; }
#${FX_ID} { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; overflow: hidden; ${CSS_MARKER}: 1; }
#${FX_ID} .scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.16) 0 1px, transparent 1px 3px); }
#${FX_ID}[data-level="3"] .scan { background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.26) 0 1px, transparent 1px 3px); }
#${FX_ID} .noise { position: absolute; inset: -20%; opacity: 0.16; mix-blend-mode: overlay; background-image: ${NOISE_IMAGE}; animation: flatline-glitch-noise 0.45s steps(5) infinite; }
#${FX_ID}[data-level="3"] .noise { opacity: 0.3; }
#${FX_ID} .roll { position: absolute; left: 0; right: 0; top: -20%; height: 18%; background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.07), transparent); animation: flatline-glitch-roll 3.6s linear infinite; }
#${FX_ID} .bar { position: absolute; left: 0; right: 0; backdrop-filter: invert(1) saturate(3) hue-rotate(var(--h)); }
#${FX_ID} .bar.tint { backdrop-filter: none; background: linear-gradient(90deg, rgba(255, 0, 80, 0.5), rgba(0, 230, 255, 0.5)); mix-blend-mode: screen; }
#${FX_ID} .block { position: absolute; mix-blend-mode: difference; }
#${FX_ID}.calm .noise, #${FX_ID}.calm .roll { display: none; }
#${FX_ID}.calm { background: radial-gradient(ellipse at 50% 0%, rgba(255, 40, 70, 0.1), transparent 70%); }
@keyframes flatline-glitch-noise {
    0% { transform: translate(0, 0); }
    20% { transform: translate(-6%, 4%); }
    40% { transform: translate(5%, -7%); }
    60% { transform: translate(-3%, 8%); }
    80% { transform: translate(7%, 2%); }
    100% { transform: translate(0, 0); }
}
@keyframes flatline-glitch-roll { to { top: 110%; } }
`;

let level: GlitchLevel = 0;
let calm = false;
let cssId: string | null = null;
let loopTimer: number | null = null;

const randomBetween = (low: number, high: number): number => low + Math.random() * (high - low);

export const readCalm = (): boolean =>
    ModSettings.get<boolean>(REDUCE_FLASHING_SETTING) === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const findOverlay = (): HTMLElement | null => document.getElementById(FX_ID);

const ensureOverlay = (): HTMLElement => {
    const existing = findOverlay();
    if (existing !== null) return existing;

    const layer = document.createElement("div");
    layer.id = FX_ID;
    layer.innerHTML = '<div class="scan"></div><div class="noise"></div><div class="roll"></div>';
    document.body.appendChild(layer);
    return layer;
};

const paintOverlay = (): void => {
    const layer = ensureOverlay();
    layer.dataset.level = String(level);
    layer.classList.toggle("calm", calm);
};

const makeBar = (power: number): HTMLElement => {
    const bar = document.createElement("div");
    bar.className = Math.random() < TINT_SHARE ? "bar tint" : "bar";
    bar.style.top = `${randomBetween(0, 94).toFixed(1)}%`;
    bar.style.height = `${(randomBetween(0.6, 5) * power).toFixed(1)}%`;
    bar.style.setProperty("--h", `${Math.round(randomBetween(0, 360))}deg`);
    return bar;
};

const makeBlock = (): HTMLElement => {
    const block = document.createElement("div");
    block.className = "block";
    block.style.left = `${randomBetween(0, 90).toFixed(1)}%`;
    block.style.top = `${randomBetween(0, 94).toFixed(1)}%`;
    block.style.width = `${randomBetween(40, 260).toFixed(0)}px`;
    block.style.height = `${randomBetween(6, 26).toFixed(0)}px`;
    block.style.background = `hsl(${Math.round(randomBetween(0, 360))} 90% 55% / 0.55)`;
    return block;
};

const clearBurstVars = (): void => {
    for (const name of ["--fx-split", "--fx-dx", "--fx-dy", "--fx-jump"]) document.body.style.removeProperty(name);
};

const ensureCss = (): void => {
    if (cssId === null) cssId = injectCss(GLITCH_CSS, CSS_MARKER);
};

const fireBurst = (power: number): void => {
    if (calm || power <= 0) return;

    ensureCss();
    const layer = ensureOverlay();
    const style = document.body.style;
    const jump = power > JUMP_POWER_FLOOR && Math.random() < JUMP_CHANCE ? randomBetween(-JUMP_MAX_PX, JUMP_MAX_PX) : 0;
    style.setProperty("--fx-split", `${(3 + power * 4).toFixed(1)}px`);
    style.setProperty("--fx-dx", `${(randomBetween(-1, 1) * power * 22).toFixed(1)}px`);
    style.setProperty("--fx-dy", `${(randomBetween(-1, 1) * power * 6).toFixed(1)}px`);
    style.setProperty("--fx-jump", `${jump.toFixed(1)}px`);
    document.body.classList.add(BURST_CLASS);

    const pieces: HTMLElement[] = [];
    for (let index = 0, bars = Math.round(BAR_BASE + power * BAR_PER_POWER); index < bars; index += 1) {
        pieces.push(makeBar(power));
    }
    for (let index = 0, blocks = Math.round(power * BLOCK_PER_POWER); index < blocks; index += 1) {
        pieces.push(makeBlock());
    }
    pieces.forEach((piece) => layer.appendChild(piece));

    window.setTimeout(() => {
        document.body.classList.remove(BURST_CLASS);
        clearBurstVars();
        pieces.forEach((piece) => piece.remove());
        if (level === 0) findOverlay()?.remove();
    }, randomBetween(BURST_MIN_MS, BURST_MAX_MS));
};

export const burstDesktop = (power: number): void => {
    if (!isDesktopMounted()) return;

    calm = readCalm();
    fireBurst(power);
};

const stopLoop = (): void => {
    if (loopTimer === null) return;

    window.clearTimeout(loopTimer);
    loopTimer = null;
};

const runLoop = (): void => {
    const spec = LEVELS[level];
    if (spec.power === 0 || calm) return;

    fireBurst(spec.power);
    loopTimer = window.setTimeout(runLoop, randomBetween(spec.gapMinMs, spec.gapMaxMs));
};

const teardown = (): void => {
    stopLoop();
    document.body.classList.remove(BURST_CLASS);
    clearBurstVars();
    findOverlay()?.remove();
    removeCss(cssId, CSS_MARKER);
    cssId = null;
};

export const setGlitchLevel = (next: GlitchLevel): void => {
    if (next === 0) {
        level = 0;
        teardown();
        return;
    }

    if (!isDesktopMounted()) return;
    if (next === level && loopTimer !== null) return;

    level = next;
    calm = readCalm();
    ensureCss();
    paintOverlay();
    stopLoop();
    runLoop();
};

onSessionLeft(() => setGlitchLevel(0));
