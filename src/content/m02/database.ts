import type { DatabaseRowDefinition } from "@hotbunny/hackhub-content-sdk";

import type { DatabaseSpec } from "../../core/types.js";

import { RANSOM_BATCHES, splitRansom } from "../global/finance.js";
import {
    M02_ADMIN_HASH,
    M02_ADMIN_USERNAME,
    M02_DECOY_SUBDOMAIN_1_IP,
    M02_DECOY_SUBDOMAIN_2_IP,
    M02_DEV_IP,
} from "./network.js";

export const M02_AFFILIATE_TABLE = "affiliates";
export const M02_ADMINS_TABLE = "admins";

const M02_DB_USER = "panel_svc";
const M02_DB_PASSWORD = "svc_internal_only";

const buildAffiliateRows = (): readonly DatabaseRowDefinition[] =>
    RANSOM_BATCHES.map((batch, index): DatabaseRowDefinition => ({
        id: { value: index + 1, type: "number" },
        client: { value: batch.caseRef, type: "string" },
        ransomAmount: { value: batch.gross, type: "number" },
        settledAt: { value: batch.settledAt, type: "string" },
        batchRef: { value: batch.ref, type: "string" },
        panelShare: { value: splitRansom(batch.gross).panel, type: "number" },
        status: { value: "PAID", type: "string" },
    }));

const buildAdminRows = (): readonly DatabaseRowDefinition[] => [
    {
        id: { value: 1, type: "number" },
        username: { value: M02_ADMIN_USERNAME, type: "string" },
        passwordHash: { value: M02_ADMIN_HASH, type: "string" },
    },
];

const decoyDatabase = (host: string): DatabaseSpec => ({ host, user: "root", password: "unknown", tables: {} });

export const buildM02Databases = (): readonly DatabaseSpec[] => [
    {
        host: M02_DEV_IP,
        user: M02_DB_USER,
        password: M02_DB_PASSWORD,
        tables: {
            [M02_AFFILIATE_TABLE]: buildAffiliateRows(),
            [M02_ADMINS_TABLE]: buildAdminRows(),
        },
    },
    decoyDatabase(M02_DECOY_SUBDOMAIN_1_IP),
    decoyDatabase(M02_DECOY_SUBDOMAIN_2_IP),
];
