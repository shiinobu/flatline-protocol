import { M04_HUNTER_EMAIL } from "../m04/network.js";
import { M07_WATCHDOG_EMAIL } from "../m07/mail.js";
import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT, GRETA_PRIVATE_EMAIL } from "./characters.js";

export const FLATLINE_MAIL_SENDERS: readonly string[] = [
    DEAD_DROP_CONTACT.email,
    ANONYMOUS_TIPSTER.email,
    M04_HUNTER_EMAIL,
    M07_WATCHDOG_EMAIL,
    GRETA_PRIVATE_EMAIL,
];
