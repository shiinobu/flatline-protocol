import { Mail, SaveStorage, type MailDefinition } from "@hotbunny/hackhub-content-sdk";

const slotKey = (slot: string): string => `mail.slot.${slot}`;

export const withdrawMailFrom = (senders: readonly string[]): void => {
    for (const info of Mail.getInbox()) {
        if (senders.includes(info.from)) Mail.remove(info.id);
    }
};

export const withdrawSlotMail = (slot: string): void => {
    const id = SaveStorage.get<string>(slotKey(slot));
    if (id) Mail.remove(id);
    SaveStorage.remove(slotKey(slot));
};

export const sendReplacingMail = (slot: string, mail: MailDefinition): void => {
    withdrawSlotMail(slot);
    const id = Mail.send(mail);
    if (id) SaveStorage.set(slotKey(slot), id);
};
