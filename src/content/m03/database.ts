import type { DatabaseRowDefinition } from "@hotbunny/hackhub-content-sdk";

import type { DatabaseSpec } from "../../core/types.js";

import { M03_ACCESS_TABLE, M03_LEDGER_TABLE, buildM03LedgerRows } from "./ledger.js";
import {
    M03_ACCOMPLICE_PASSWORD,
    M03_ACCOMPLICE_USERNAME,
    M03_COINDRIFT_IP,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
} from "./network.js";

const M03_HELPDESK_RESET_NOTE =
    "Remote login reset for d.reyes -- back to her personal one. told her AGAIN to use the company format.";

const buildLedgerTable = (): readonly DatabaseRowDefinition[] =>
    buildM03LedgerRows().map((row): DatabaseRowDefinition => ({
        id: { value: row.id, type: "number" },
        postedAt: { value: row.postedAt, type: "string" },
        direction: { value: row.direction, type: "string" },
        party: { value: row.party, type: "string" },
        amount: { value: row.amount, type: "number" },
        balance: { value: row.balance, type: "number" },
        memo: { value: row.memo, type: "string" },
    }));

const buildAccessTable = (): readonly DatabaseRowDefinition[] => [
    {
        id: { value: 1, type: "number" },
        account: { value: M03_ACCOMPLICE_USERNAME, type: "string" },
        resetTo: { value: M03_ACCOMPLICE_PASSWORD, type: "string" },
        note: { value: M03_HELPDESK_RESET_NOTE, type: "string" },
    },
];

export const buildM03Databases = (): readonly DatabaseSpec[] => [
    {
        host: M03_COINDRIFT_IP,
        user: M03_FINANCE_USERNAME,
        password: M03_FINANCE_PASSWORD,
        tables: {
            [M03_LEDGER_TABLE]: buildLedgerTable(),
            [M03_ACCESS_TABLE]: buildAccessTable(),
        },
    },
];
