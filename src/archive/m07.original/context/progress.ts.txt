import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M07_DASHBOARD_OPEN_KEY = "flatline.m07.dashboardOpen";

export const setM07DashboardOpen = (open: boolean): void => SharedVariables.set(M07_DASHBOARD_OPEN_KEY, open);
export const isM07DashboardOpen = (): boolean => SharedVariables.get<boolean>(M07_DASHBOARD_OPEN_KEY) === true;

export const clearM07Progress = (): void => SharedVariables.remove(M07_DASHBOARD_OPEN_KEY);
