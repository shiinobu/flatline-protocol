import { Localization, SharedVariables } from "@hotbunny/hackhub-content-sdk";

import { ALL_SITE_KEYS } from "../../i18n/global/site-keys.js";

const SITE_STRINGS_CACHE_KEY = "flatline.siteStrings";

export const refreshSiteStrings = (): void => {
    const cache: Record<string, string> = {};
    for (const key of ALL_SITE_KEYS) {
        cache[key] = Localization.t(key);
    }
    SharedVariables.set(SITE_STRINGS_CACHE_KEY, cache);
};

export const siteT = (key: string, vars?: Record<string, string | number>): string => {
    const cache = SharedVariables.get<Record<string, string>>(SITE_STRINGS_CACHE_KEY) ?? {};
    const template = cache[key] ?? key;
    if (!vars) return template;

    return Object.entries(vars).reduce(
        (text, [varKey, varValue]) => text.split(`{{${varKey}}}`).join(String(varValue)),
        template,
    );
};
