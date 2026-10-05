import {
    M05_PORTAL_ACCOUNTS,
    M05_PORTAL_CHANGES,
    M05_PORTAL_HR_FEED,
    M05_PORTAL_ROLLBACK_HEX,
    M05_PORTAL_RULES,
    M05_PORTAL_SYSTEMS,
    M05_PORTAL_TICKETS,
    M05_PORTAL_TODAY,
    type PortalChange,
    type PortalHrEntry,
    type PortalRule,
    type PortalSystem,
    type PortalTicket,
} from "../../../content/m05/portal-data.js";
import { buildPortalSignins, type PortalSignin } from "../../../content/m05/portal-signins.js";
import { M05_RDC_DOMAIN } from "../../../content/m05/network.js";

export type PortalTable = Readonly<Record<string, string>>;

export interface PortalAccountView {
    readonly a: string;
    readonly n: string;
    readonly role: string;
    readonly pw: string;
    readonly mfa: boolean;
}

export interface PortalPayload {
    readonly today: string;
    readonly rdcHost: string;
    readonly rollbackHex: string;
    readonly accts: readonly PortalAccountView[];
    readonly rows: readonly PortalSignin[];
    readonly hr: readonly PortalHrEntry[];
    readonly systems: readonly PortalSystem[];
    readonly rules: readonly PortalRule[];
    readonly chg: readonly PortalChange[];
    readonly tickets: readonly PortalTicket[];
}

const NOTE_PATTERN = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2} [^:]+: )(.*)$/;

const translate = (table: PortalTable, value: string): string =>
    Object.prototype.hasOwnProperty.call(table, value) ? table[value] : value;

const translateNote = (table: PortalTable, note: string): string => {
    const match = NOTE_PATTERN.exec(note);

    return match ? `${match[1]}${translate(table, match[2])}` : translate(table, note);
};

export const buildPortalPayload = (table: PortalTable): PortalPayload => ({
    today: M05_PORTAL_TODAY,
    rdcHost: M05_RDC_DOMAIN,
    rollbackHex: M05_PORTAL_ROLLBACK_HEX,
    accts: M05_PORTAL_ACCOUNTS.map((account) => ({
        a: account.a,
        n: translate(table, account.n),
        role: translate(table, account.role),
        pw: account.pw,
        mfa: account.mfa,
    })),
    rows: buildPortalSignins().map((row) => ({ ...row, g: translate(table, row.g) })),
    hr: M05_PORTAL_HR_FEED.map((entry) => ({ ...entry, why: translate(table, entry.why) })),
    systems: M05_PORTAL_SYSTEMS.map((system) => ({
        ...system,
        role: translate(table, system.role),
        own: translate(table, system.own),
    })),
    rules: M05_PORTAL_RULES.map((rule) => ({ ...rule, why: translate(table, rule.why) })),
    chg: M05_PORTAL_CHANGES.map((change) => ({
        ...change,
        sec: translate(table, change.sec),
        appr: translate(table, change.appr),
        why: translate(table, change.why),
    })),
    tickets: M05_PORTAL_TICKETS.map((ticket) => ({
        ...ticket,
        title: translate(table, ticket.title),
        notes: ticket.notes.map((note) => translateNote(table, note)),
    })),
});
