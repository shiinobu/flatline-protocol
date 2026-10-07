import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

import type { RdcMirror } from "../../content/global/rdc.js";

const M07_DASHBOARD_OPEN_KEY = "flatline.m07.dashboardOpen";
const M07_PORTAL_OPEN_KEY = "flatline.m07.portalOpen";
const M07_RESERVES_OPEN_KEY = "flatline.m07.reservesOpen";
const M07_RDC_STATE_KEY = "flatline.m07.rdcState";
const M07_LEDGER_ROOM_OPEN_KEY = "flatline.m07.ledgerRoomOpen";

export const setM07DashboardOpen = (open: boolean): void => SharedVariables.set(M07_DASHBOARD_OPEN_KEY, open);
export const isM07DashboardOpen = (): boolean => SharedVariables.get<boolean>(M07_DASHBOARD_OPEN_KEY) === true;

export const setM07PortalOpen = (open: boolean): void => SharedVariables.set(M07_PORTAL_OPEN_KEY, open);
export const isM07PortalOpen = (): boolean => SharedVariables.get<boolean>(M07_PORTAL_OPEN_KEY) === true;

export const setM07ReservesOpen = (open: boolean): void => SharedVariables.set(M07_RESERVES_OPEN_KEY, open);
export const isM07ReservesOpen = (): boolean => SharedVariables.get<boolean>(M07_RESERVES_OPEN_KEY) === true;

export const setM07LedgerRoomOpen = (open: boolean): void => SharedVariables.set(M07_LEDGER_ROOM_OPEN_KEY, open);
export const isM07LedgerRoomOpen = (): boolean => SharedVariables.get<boolean>(M07_LEDGER_ROOM_OPEN_KEY) === true;

export const setM07RdcState =(state: RdcMirror): void => SharedVariables.set(M07_RDC_STATE_KEY, state);
export const getM07RdcState = (): RdcMirror =>
    SharedVariables.get<RdcMirror>(M07_RDC_STATE_KEY) ?? { loggedIn: false, attached: false, docs: [], seed: 0 };

export const clearM07Progress = (): void => {
    SharedVariables.remove(M07_DASHBOARD_OPEN_KEY);
    SharedVariables.remove(M07_PORTAL_OPEN_KEY);
    SharedVariables.remove(M07_RESERVES_OPEN_KEY);
    SharedVariables.remove(M07_RDC_STATE_KEY);
    SharedVariables.remove(M07_LEDGER_ROOM_OPEN_KEY);
};
