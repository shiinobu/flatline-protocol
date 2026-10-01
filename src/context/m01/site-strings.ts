import { Localization, Variables } from "@hotbunny/hackhub-content-sdk";

import { M01_ALL_SITE_KEYS } from "../../i18n/m01/site-keys.js";

const M01_SITE_STRINGS_CACHE_KEY = "m01.siteStringsCache";

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
