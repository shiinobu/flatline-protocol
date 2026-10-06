import type { IntroSpec } from "../../core/types.js";

import { M02_DEAD_DROP_EMAIL, M02_TIP_CONTENT, M02_TIP_SUBJECT } from "./mail.js";

export const M02_INTRO: IntroSpec = {
    personas: () => [],
    mails: () => [{ from: M02_DEAD_DROP_EMAIL, subject: M02_TIP_SUBJECT(), content: M02_TIP_CONTENT() }],
};
