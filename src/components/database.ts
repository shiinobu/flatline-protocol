import { Database } from "@hotbunny/hackhub-content-sdk";

import type { DatabaseSpec } from "../core/types.js";

const ensureDatabase = (spec: DatabaseSpec): string =>
    Database.getByHost(spec.host)?.id ??
    Database.create({ host: spec.host, user: spec.user, password: spec.password, tables: {} });

export const applyDatabases = (specs: readonly DatabaseSpec[]): void => {
    for (const spec of specs) {
        const id = ensureDatabase(spec);
        for (const [table, rows] of Object.entries(spec.tables)) Database.setTable(id, table, [...rows]);
    }
};

export const removeDatabases = (hosts: readonly string[]): void => {
    for (const host of hosts) {
        const existing = Database.getByHost(host);
        if (existing) Database.remove(existing.id);
    }
};
