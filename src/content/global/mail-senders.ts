import { M04_HONEYPOT_ALERT_FROM, M04_TRAP_WARNING_FROM } from "../m04.js";
import { ANONYMOUS_TIPSTER, DEAD_DROP_CONTACT } from "./characters.js";

export const FLATLINE_MAIL_SENDERS: readonly string[] = [
    DEAD_DROP_CONTACT.email,
    ANONYMOUS_TIPSTER.email,
    M04_HONEYPOT_ALERT_FROM,
    M04_TRAP_WARNING_FROM,
];
