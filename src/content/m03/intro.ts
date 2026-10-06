import type { IntroSpec } from "../../core/types.js";

import { M03_DEAD_DROP_EMAIL, M03_TIP_CONTENT, M03_TIP_SUBJECT } from "./mail.js";
import { buildM03OkaforPersona, buildM03ReyesPersona } from "./twotter.js";

export const M03_INTRO: IntroSpec = {
    personas: () => [buildM03ReyesPersona(), buildM03OkaforPersona()],
    mails: () => [{ from: M03_DEAD_DROP_EMAIL, subject: M03_TIP_SUBJECT(), content: M03_TIP_CONTENT() }],
};
