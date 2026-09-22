import { siteT } from "../../content/m01-site-strings-cache.js";

export const localizeHtml = (html: string): string =>
    html.replace(/\{\{t:([A-Za-z0-9_.]+)\}\}/g, (_match, key: string) => siteT(key));
