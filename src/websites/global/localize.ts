import { siteT } from "../../context/global/site-strings.js";

export const localizeHtml = (html: string): string =>
    html.replace(/\{\{t:([A-Za-z0-9_.]+)\}\}/g, (_match, key: string) => siteT(key));

export const fillMarker = (html: string, name: string, value: string): string =>
    html.replace(new RegExp(`\\/\\*__${name}__\\*\\/`), () => value);

export const fillDataMarker = (html: string, name: string, json: string): string =>
    html.replace(new RegExp(`\\/\\*__${name}__\\*\\/(?:\\[\\]|\\{\\})`), () => json);

export const fillMarkers = (html: string, values: Readonly<Record<string, string>>): string =>
    Object.entries(values).reduce((text, [name, value]) => fillMarker(text, name, value), html);
