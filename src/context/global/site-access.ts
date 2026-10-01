import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

import type { QuestId } from "../../guard/flags.js";

const ACTIVE_MISSION_KEY = "flatline.activeMission";

export const openMissionSites = (mission: QuestId): void => SharedVariables.set(ACTIVE_MISSION_KEY, mission);

export const closeMissionSites = (mission: QuestId): void => {
    if (SharedVariables.get<QuestId>(ACTIVE_MISSION_KEY) === mission) SharedVariables.remove(ACTIVE_MISSION_KEY);
};

export const areMissionSitesOpen = (mission: QuestId): boolean =>
    SharedVariables.get<QuestId>(ACTIVE_MISSION_KEY) === mission;
