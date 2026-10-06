import { sealText } from "../../components/text-seal.js";
import type { SealedArtifactSpec } from "../global/sealed.js";
import { M06_FILING_2019_YEAR, M06_FILING_2024_YEAR, M06_HALVARD_DISSOLVED } from "./network.js";
import {
    M06_HALVARD_NAME,
    M06_HALVARD_NUMBER,
    M06_HOLDINGS_NAME,
    M06_HOLDINGS_NUMBER,
    M06_SKN_FULL_NAME,
    M06_SKN_NUMBER,
} from "./records.js";

export const M06_MISSION = "m06";

export const M06_ARTIFACT_FILING_2019 = "filing2019";
export const M06_ARTIFACT_FILING_2024 = "filing2024";

export const M06_FILING_2019_KEY = `${M06_SKN_NUMBER}-${M06_FILING_2019_YEAR}`;
export const M06_FILING_2024_KEY = `${M06_HALVARD_NUMBER}-${M06_HALVARD_DISSOLVED}`;

const ENTITY_LINE = `Entity: ${M06_SKN_FULL_NAME} (${M06_SKN_NUMBER}).`;

export const M06_FILING_2019_PLAINTEXT =
    `FILING ${M06_FILING_2019_YEAR}. ${ENTITY_LINE} ` +
    `Owner: ${M06_HALVARD_NAME} (${M06_HALVARD_NUMBER}). Declared by the agent on instruction.`;

export const M06_FILING_2024_PLAINTEXT =
    `FILING ${M06_FILING_2024_YEAR}. ${ENTITY_LINE} Owner: not declared. ` +
    `Holding declared by ${M06_HOLDINGS_NAME} (${M06_HOLDINGS_NUMBER}). Rest withheld by the agent.`;

export const M06_FILING_2019_HEX = sealText(M06_FILING_2019_PLAINTEXT, M06_FILING_2019_KEY);
export const M06_FILING_2024_HEX = sealText(M06_FILING_2024_PLAINTEXT, M06_FILING_2024_KEY);

export const M06_SEALED_ARTIFACTS: readonly SealedArtifactSpec[] = [
    {
        id: M06_ARTIFACT_FILING_2019,
        mission: M06_MISSION,
        key: M06_FILING_2019_KEY,
        plaintext: M06_FILING_2019_PLAINTEXT,
    },
    {
        id: M06_ARTIFACT_FILING_2024,
        mission: M06_MISSION,
        key: M06_FILING_2024_KEY,
        plaintext: M06_FILING_2024_PLAINTEXT,
    },
];
