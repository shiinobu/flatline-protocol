import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M05_TEAM_OPEN_KEY = "flatline.m05.teamOpen";
const M05_ARCHIVE_OPEN_KEY = "flatline.m05.archiveOpen";
const M05_PORTAL_USER_KEY = "flatline.m05.portalUser";
const M05_PORTAL_MIN_KEY = "flatline.m05.portalMin";
const M05_RDC_STATE_KEY = "flatline.m05.rdcState";

export interface M05RdcMirror {
    readonly loggedIn: boolean;
    readonly attached: boolean;
    readonly docs: readonly number[];
    readonly seed: number;
}

export const setM05TeamOpen = (open: boolean): void => SharedVariables.set(M05_TEAM_OPEN_KEY, open);
export const isM05TeamOpen = (): boolean => SharedVariables.get<boolean>(M05_TEAM_OPEN_KEY) === true;

export const setM05ArchiveOpen = (open: boolean): void => SharedVariables.set(M05_ARCHIVE_OPEN_KEY, open);
export const isM05ArchiveOpen = (): boolean => SharedVariables.get<boolean>(M05_ARCHIVE_OPEN_KEY) === true;

export const setM05PortalUser = (user: string): void => SharedVariables.set(M05_PORTAL_USER_KEY, user);
export const getM05PortalUser = (): string => SharedVariables.get<string>(M05_PORTAL_USER_KEY) ?? "";

export const setM05PortalMin = (min: number): void => SharedVariables.set(M05_PORTAL_MIN_KEY, min);
export const getM05PortalMin = (): number => SharedVariables.get<number>(M05_PORTAL_MIN_KEY) ?? 0;

export const setM05RdcState = (state: M05RdcMirror): void => SharedVariables.set(M05_RDC_STATE_KEY, state);
export const getM05RdcState = (): M05RdcMirror =>
    SharedVariables.get<M05RdcMirror>(M05_RDC_STATE_KEY) ?? { loggedIn: false, attached: false, docs: [], seed: 0 };

export const clearM05Progress = (): void => {
    SharedVariables.remove(M05_TEAM_OPEN_KEY);
    SharedVariables.remove(M05_ARCHIVE_OPEN_KEY);
    SharedVariables.remove(M05_PORTAL_USER_KEY);
    SharedVariables.remove(M05_PORTAL_MIN_KEY);
    SharedVariables.remove(M05_RDC_STATE_KEY);
};
