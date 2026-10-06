import type { IntroSpec } from "../../core/types.js";

import { M06_DEAD_DROP_EMAIL, M06_TIP_CONTENT, M06_TIP_SUBJECT } from "./mail.js";

export const M06_INTRO: IntroSpec = {
    personas: () => [],
    mails: () => [{ from: M06_DEAD_DROP_EMAIL, subject: M06_TIP_SUBJECT(), content: M06_TIP_CONTENT() }],
};
