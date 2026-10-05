import { Events } from "@hotbunny/hackhub-content-sdk";

import { SEALED_OPENED_EVENT, findSealedArtifact, type SealedOpenedPayload } from "../../../content/global/sealed.js";
import { trace } from "../../../helpers/logger.js";

const DECRYPT_MODE = "decrypt";
const MAX_INPUT_LENGTH = 4096;

export const reportCipherRun = (mode: string, input: string, passphrase: string): void => {
    trace("CIPHER", `run mode=${mode} inputLength=${input.length} passphraseLength=${passphrase.length}`);

    if (mode !== DECRYPT_MODE || input.length > MAX_INPUT_LENGTH) return;

    const artifact = findSealedArtifact(input, passphrase);
    if (!artifact) return;

    trace("CIPHER", `opened id=${artifact.id} mission=${artifact.mission}`);
    const payload: SealedOpenedPayload = { id: artifact.id, mission: artifact.mission };
    Events.emit(SEALED_OPENED_EVENT, payload);
};
