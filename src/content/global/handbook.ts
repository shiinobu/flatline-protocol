import { Handbook, Localization } from "@hotbunny/hackhub-content-sdk";

import { HANDBOOK_I18N_KEY } from "../../i18n/global/handbook.js";

export const HANDBOOK_CATEGORY = "Flatline Protocol";

interface HandbookPage {
    readonly id: string;
    readonly titleKey: string;
    readonly bodyKey: string;
}

const HANDBOOK_PAGES: readonly HandbookPage[] = [
    { id: "flatline-briefing", titleKey: HANDBOOK_I18N_KEY.BRIEFING_TITLE, bodyKey: HANDBOOK_I18N_KEY.BRIEFING_BODY },
    { id: "flatline-cases", titleKey: HANDBOOK_I18N_KEY.CASES_TITLE, bodyKey: HANDBOOK_I18N_KEY.CASES_BODY },
    { id: "flatline-terminal", titleKey: HANDBOOK_I18N_KEY.TERMINAL_TITLE, bodyKey: HANDBOOK_I18N_KEY.TERMINAL_BODY },
    { id: "flatline-metasploit", titleKey: HANDBOOK_I18N_KEY.METASPLOIT_TITLE, bodyKey: HANDBOOK_I18N_KEY.METASPLOIT_BODY },
    { id: "flatline-commands", titleKey: HANDBOOK_I18N_KEY.COMMANDS_TITLE, bodyKey: HANDBOOK_I18N_KEY.COMMANDS_BODY },
    { id: "flatline-backtrace", titleKey: HANDBOOK_I18N_KEY.BACKTRACE_TITLE, bodyKey: HANDBOOK_I18N_KEY.BACKTRACE_BODY },
    { id: "flatline-comfort", titleKey: HANDBOOK_I18N_KEY.COMFORT_TITLE, bodyKey: HANDBOOK_I18N_KEY.COMFORT_BODY },
];

const registerHandbookPages = (): void => {
    HANDBOOK_PAGES.forEach((page, order) => {
        Handbook.registerEntry({
            id: page.id,
            category: HANDBOOK_CATEGORY,
            title: Localization.t(page.titleKey),
            content: Localization.t(page.bodyKey),
            order,
        });
    });
};

export const bindHandbook = (): void => {
    registerHandbookPages();
    Localization.onLanguageChange(registerHandbookPages);
};
