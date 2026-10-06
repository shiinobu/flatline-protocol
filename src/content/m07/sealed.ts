import { ARCHITECT_REAL_NAME } from "../global/characters.js";
import type { SealedArtifactSpec } from "../global/sealed.js";
import {
    M07_RESERVE_EU_REF,
    M07_RESERVE_MED_REF,
    M07_SETTLEMENT_ACCOUNT_NUMBER,
} from "./claims.js";
import {
    M07_CHAIR_PASSWORD,
    M07_CHAIR_USERNAME,
    M07_MISSION,
} from "./rdc.js";
import { M07_CHAIR_TAG } from "./network.js";

export const M07_ARTIFACT_SEAL_ONE = "ledgerSeal1";
export const M07_ARTIFACT_SEAL_TWO = "ledgerSeal2";

export const M07_MINUTES_SIGNED_ISO = "2023-12-14";

const chairSurname = (): string => (ARCHITECT_REAL_NAME.split(" ").pop() ?? "").toUpperCase();

export const M07_SEAL_ONE_KEY = `${chairSurname()}-${M07_MINUTES_SIGNED_ISO}`;
export const M07_SEAL_TWO_KEY = `${M07_SETTLEMENT_ACCOUNT_NUMBER}-${M07_RESERVE_MED_REF}`;

export const M07_SEAL_ONE_PLAINTEXT =
    "Part two opens with the settlement account that holds the reserves, then the healthcare reserve " +
    "reference, joined by a dash. " +
    `Reserves held: ${M07_RESERVE_EU_REF} and ${M07_RESERVE_MED_REF}. Both pre-notified. The insured were not.`;

export const M07_SEAL_TWO_PLAINTEXT =
    `Chair console. User ${M07_CHAIR_USERNAME}, password ${M07_CHAIR_PASSWORD}, device ${M07_CHAIR_TAG}. ` +
    "Address as in the settlement network index. " +
    "Change: the release order of the PacificCare run. " +
    "Tokens are sealed with that same release order.";

export const M07_SEALED_ARTIFACTS: readonly SealedArtifactSpec[] = [
    {
        id: M07_ARTIFACT_SEAL_ONE,
        mission: M07_MISSION,
        key: M07_SEAL_ONE_KEY,
        plaintext: M07_SEAL_ONE_PLAINTEXT,
    },
    {
        id: M07_ARTIFACT_SEAL_TWO,
        mission: M07_MISSION,
        key: M07_SEAL_TWO_KEY,
        plaintext: M07_SEAL_TWO_PLAINTEXT,
    },
];
