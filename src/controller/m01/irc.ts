import { WeeChat } from "@hotbunny/hackhub-content-sdk";

import { M01_IRC_HOST, M01_IRC_PASSWORD, buildM01IrcConversation } from "../../content/m01/irc.js";

export const seedM01Irc = (): void => {
    WeeChat.removeServer(M01_IRC_HOST, M01_IRC_PASSWORD);
    WeeChat.createServer(M01_IRC_HOST, M01_IRC_PASSWORD);

    for (const line of buildM01IrcConversation()) {
        WeeChat.sendMessage({
            host: M01_IRC_HOST,
            username: line.username,
            message: line.message,
        });
    }
};
