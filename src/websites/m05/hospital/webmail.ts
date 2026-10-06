import { M05_GRETA_PASSWORD, M05_GRETA_USERNAME } from "../../../content/m05/network.js";

const MAX_FIELD_LENGTH = 128;

export type WebmailVerdict = "disabled" | "failed";

export const webmailVerdict = (user: unknown, password: unknown): WebmailVerdict => {
    const name = String(user).slice(0, MAX_FIELD_LENGTH);
    const secret = String(password).slice(0, MAX_FIELD_LENGTH);

    return name === M05_GRETA_USERNAME && secret === M05_GRETA_PASSWORD ? "disabled" : "failed";
};
