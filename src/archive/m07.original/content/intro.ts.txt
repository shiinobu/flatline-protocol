import type { IntroSpec } from "../../core/types.js";

import { M07_DEAD_DROP_EMAIL, M07_TIP_CONTENT, M07_TIP_SUBJECT } from "./mail.js";

export const M07_INTRO: IntroSpec = {
    personas: () => [],
    mails: () => [{ from: M07_DEAD_DROP_EMAIL, subject: M07_TIP_SUBJECT(), content: M07_TIP_CONTENT() }],
};
