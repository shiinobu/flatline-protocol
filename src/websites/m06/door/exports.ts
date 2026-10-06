import { Events } from "@hotbunny/hackhub-content-sdk";

import {
    M06_DOOR_MAX_FIELD_LENGTH,
    M06_DOOR_OPENED_EVENT,
    doorCooldownSeconds,
    isDoorAnswer,
} from "../../../content/m06/door.js";
import { areMissionSitesOpen } from "../../../context/global/site-access.js";
import {
    M06_STAGE,
    isM06StageOpen,
    readM06DoorFails,
    readM06DoorLockUntil,
    recordM06DoorFailure,
    setM06DoorOpen,
} from "../../../context/m06/progress.js";
const MILLISECONDS_PER_SECOND = 1000;

export type DoorStatus = "open" | "denied" | "wait";

export interface DoorResult {
    readonly status: DoorStatus;
    readonly wait: number;
}

const clip = (value: unknown): string => String(value).slice(0, M06_DOOR_MAX_FIELD_LENGTH);

export const doorWaitSeconds = (now: number): number =>
    Math.max(0, Math.ceil((readM06DoorLockUntil() - now) / MILLISECONDS_PER_SECOND));

export const doorTry = (passphrase: unknown, factor: unknown): DoorResult => {
    if (!areMissionSitesOpen("m06") || !isM06StageOpen(M06_STAGE.register)) return { status: "denied", wait: 0 };

    const now = Date.now();
    const remaining = doorWaitSeconds(now);
    if (remaining > 0) return { status: "wait", wait: remaining };

    if (isM06StageOpen(M06_STAGE.door) && isDoorAnswer(clip(passphrase), clip(factor))) {
        setM06DoorOpen(true);
        Events.emit(M06_DOOR_OPENED_EVENT, { opened: true });

        return { status: "open", wait: 0 };
    }

    const failures = readM06DoorFails() + 1;
    const cooldown = doorCooldownSeconds(failures);
    const storedFailures = cooldown > 0 ? 0 : failures;
    recordM06DoorFailure(storedFailures, now + cooldown * MILLISECONDS_PER_SECOND);

    return { status: "denied", wait: cooldown };
};
