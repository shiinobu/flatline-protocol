import { toolIcon } from "../tool-page.js";

const LOGO_SHAPES = '<circle cx="16" cy="16" r="14.5"/><path d="M5.5 16h4l2-7 3 14 2.5-10 1.8 6 1.4-3h6.3"/>';

export const ECHOLINE_LOGO = `<svg class="logo" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LOGO_SHAPES}</svg>`;

export const ECHOLINE_ICON = toolIcon(
    '<rect width="64" height="64" rx="14" fill="#0b1210"/>' +
        `<g transform="translate(8 8) scale(1.5)" fill="none" stroke="#c9f36c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LOGO_SHAPES}</g>`,
);

const ICON_ATTRS =
    'class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const CHEVRON_LEFT = `<svg ${ICON_ATTRS}><path d="m14.5 6-6 6 6 6"/></svg>`;

export const CHEVRON_RIGHT = `<svg ${ICON_ATTRS}><path d="m9.5 6 6 6-6 6"/></svg>`;
