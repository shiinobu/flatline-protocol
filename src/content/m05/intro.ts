import type { IntroSpec } from "../../core/types.js";

import { M05_DEAD_DROP_EMAIL, M05_TIP_CONTENT, M05_TIP_SUBJECT } from "./mail.js";
import { buildM05GarethPersona, buildM05RoxannePersona } from "./twotter.js";

export const M05_INTRO: IntroSpec = {
    personas: () => [buildM05RoxannePersona(), buildM05GarethPersona()],
    mails: () => [{ from: M05_DEAD_DROP_EMAIL, subject: M05_TIP_SUBJECT(), content: M05_TIP_CONTENT() }],
};
