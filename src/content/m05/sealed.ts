import { sealText } from "../../components/text-seal.js";
import type { SealedArtifactSpec } from "../global/sealed.js";
import {
    M05_BEDSIDE_ASSET_TAG,
    M05_BEDSIDE_CHANGE,
    M05_BEDSIDE_LAN_IP,
    M05_CHANGE_ID,
    M05_GRETA_LEGACY_PASSWORD,
    M05_GRETA_USERNAME,
    M05_HOLD_MATTER,
    M05_POLICY_ID,
} from "./network.js";
import { M05_MISSION } from "./rdc.js";

export const M05_ARTIFACT_ROLLBACK = "rollbackPlan";
export const M05_ARTIFACT_SAMPLE = "sampleToken";
export const M05_ARTIFACT_GRETA_NOTE = "gretaNote";
export const M05_ARTIFACT_HANDOVER = "handoverNote";
export const M05_ARTIFACT_FORMAT = "recoveryFormat";

export const M05_ROLLBACK_KEY = "CHG-2606-022";
export const M05_SAMPLE_USER = "valerie.dizon";
export const M05_SAMPLE_PASSWORD = "Kestrel-Lantern-77";

export const M05_ROLLBACK_PLAINTEXT =
    "Rollback plan CHG-2606-022. Re-enable directory sync and restore removable-media enforcement by " +
    "2026-07-15. While this window is open, manual account closures are held (see HR-7).";

export const M05_GRETA_NOTE_PLAINTEXT =
    "Same password on the portal, the VPN, the archive and MedVendor. R. says the forced reset comes after " +
    "the migration. The migration never ends.";

export const M05_SAMPLE_PLAINTEXT = [
    M05_SAMPLE_USER,
    M05_SAMPLE_PASSWORD,
    M05_BEDSIDE_LAN_IP,
    M05_BEDSIDE_CHANGE,
    M05_BEDSIDE_ASSET_TAG,
].join(":");

export const M05_HANDOVER_KEY = M05_GRETA_USERNAME;
export const M05_FORMAT_KEY = M05_CHANGE_ID;

export const M05_HANDOVER_PLAINTEXT =
    `Handover for the next administrator: the legacy recovery procedure is filed as ${M05_POLICY_ID}. ` +
    "Search the PacificCare documents for that reference. Take the system code and the date from the incident record.";

export const M05_FORMAT_PLAINTEXT =
    "Recovery validation format: <account local-part>-<affected system code>-<incident date>. " +
    "Enter the values exactly as recorded in PacificCare incident documentation.";

export const M05_HANDOVER_HEX = sealText(M05_HANDOVER_PLAINTEXT, M05_HANDOVER_KEY);
export const M05_FORMAT_HEX = sealText(M05_FORMAT_PLAINTEXT, M05_FORMAT_KEY);

export const M05_SEALED_ARTIFACTS: readonly SealedArtifactSpec[] = [
    { id: M05_ARTIFACT_ROLLBACK, mission: M05_MISSION, key: M05_ROLLBACK_KEY, plaintext: M05_ROLLBACK_PLAINTEXT },
    { id: M05_ARTIFACT_SAMPLE, mission: M05_MISSION, key: M05_HOLD_MATTER, plaintext: M05_SAMPLE_PLAINTEXT },
    {
        id: M05_ARTIFACT_GRETA_NOTE,
        mission: M05_MISSION,
        key: M05_GRETA_LEGACY_PASSWORD,
        plaintext: M05_GRETA_NOTE_PLAINTEXT,
    },
    { id: M05_ARTIFACT_HANDOVER, mission: M05_MISSION, key: M05_HANDOVER_KEY, plaintext: M05_HANDOVER_PLAINTEXT },
    { id: M05_ARTIFACT_FORMAT, mission: M05_MISSION, key: M05_FORMAT_KEY, plaintext: M05_FORMAT_PLAINTEXT },
];
