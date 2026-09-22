import { Localization, Variables } from "@hotbunny/hackhub-content-sdk";

import { M01_BW_KEY } from "./m01-blackwire-i18n.js";
import { M01_ESCROW_KEY } from "./m01-escrow-i18n.js";
import { M01_FG_KEY } from "./m01-frostgate-i18n.js";
import { M01_LV_KEY } from "./m01-ledgervault-i18n.js";
import { M01_LISTING_KEY } from "./m01-listing-template-i18n.js";
import { M01_OA_KEY } from "./m01-obsidian-i18n.js";
import { M01_SITE_KEY } from "./m01-site-shared-i18n.js";

const M01_SITE_STRINGS_CACHE_KEY = "m01.siteStringsCache";

const M01_ALL_SITE_KEYS: readonly string[] = [
    ...Object.values(M01_SITE_KEY),
    ...Object.values(M01_BW_KEY),
    ...Object.values(M01_LISTING_KEY),
    ...Object.values(M01_FG_KEY),
    ...Object.values(M01_OA_KEY),
    ...Object.values(M01_ESCROW_KEY),
    ...Object.values(M01_LV_KEY),
];

export const refreshM01SiteStrings = (): void => {
    const cache: Record<string, string> = {};
    for (const key of M01_ALL_SITE_KEYS) {
        cache[key] = Localization.t(key);
    }
    Variables.set(M01_SITE_STRINGS_CACHE_KEY, cache);
};

export const siteT = (key: string, vars?: Record<string, string | number>): string => {
    const cache = Variables.get<Record<string, string>>(M01_SITE_STRINGS_CACHE_KEY) ?? {};
    const template = cache[key] ?? key;
    if (!vars) return template;

    return Object.entries(vars).reduce(
        (text, [varKey, varValue]) => text.split(`{{${varKey}}}`).join(String(varValue)),
        template,
    );
};
