import type { IntroSpec } from "../../core/types.js";

import { M04_DEAD_DROP_EMAIL, M04_WARNING_CONTENT, M04_WARNING_SUBJECT } from "./mail.js";

export const M04_INTRO: IntroSpec = {
    personas: () => [],
    mails: () => [{ from: M04_DEAD_DROP_EMAIL, subject: M04_WARNING_SUBJECT(), content: M04_WARNING_CONTENT() }],
};
