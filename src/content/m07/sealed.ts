import type { SealedArtifactSpec } from "../global/sealed.js";
import { M07_RESERVE_MED_REF, M07_SETTLEMENT_ACCOUNT_NUMBER } from "./claims.js";
import {
    M07_CHAIR_PASSWORD,
    M07_CHAIR_USERNAME,
    M07_MISSION,
} from "./rdc.js";
import { M07_CHAIR_TAG } from "./network.js";

export const M07_ARTIFACT_SEAL = "ledgerSeal";

export const M07_SEAL_KEY = `${M07_SETTLEMENT_ACCOUNT_NUMBER}-${M07_RESERVE_MED_REF}`;

export const M07_SEAL_PLAINTEXT =
    `Chair console. User ${M07_CHAIR_USERNAME}, password ${M07_CHAIR_PASSWORD}. ` +
    "Address as in the settlement network index. " +
    "Change: the release order of the PacificCare run. " +
    `Device tag ${M07_CHAIR_TAG}. ` +
    "A token is those five, in that order, joined by colons. " +
    "Tokens are sealed with that same release order, and so is every file on that machine. " +
    "What he throws away there is only set aside, not gone.";

export const M07_SEALED_ARTIFACTS: readonly SealedArtifactSpec[] = [
    {
        id: M07_ARTIFACT_SEAL,
        mission: M07_MISSION,
        key: M07_SEAL_KEY,
        plaintext: M07_SEAL_PLAINTEXT,
    },
];
