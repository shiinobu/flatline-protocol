export interface FlatlineContact {
    readonly id: string;
    readonly name: string;
    readonly email: string;
}

export const DEAD_DROP_CONTACT: FlatlineContact = {
    id: "contact.dead-drop",
    name: "the Custodian",
    email: "drop@ashline.void",
};

export const ANONYMOUS_TIPSTER: FlatlineContact = {
    id: "contact.anonymous-tipster",
    name: "Unknown Sender",
    email: "ghost.tip@driftmail.void",
};
