import { Mail } from "@hotbunny/hackhub-content-sdk";

import { seedPersona } from "../components/persona.js";
import type { IntroSpec } from "./types.js";

export const seed = (intro: IntroSpec): void => {
    intro.personas().forEach(seedPersona);
    intro.mails().forEach((mail) => Mail.send(mail));
};
