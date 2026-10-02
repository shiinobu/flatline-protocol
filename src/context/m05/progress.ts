import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M05_ARCHIVE_OPEN_KEY = "flatline.m05.archiveOpen";
const M05_LOOKUP_OPEN_KEY = "flatline.m05.lookupOpen";

export const setM05ArchiveOpen = (open: boolean): void => SharedVariables.set(M05_ARCHIVE_OPEN_KEY, open);
export const isM05ArchiveOpen = (): boolean => SharedVariables.get<boolean>(M05_ARCHIVE_OPEN_KEY) === true;

export const setM05LookupOpen = (open: boolean): void => SharedVariables.set(M05_LOOKUP_OPEN_KEY, open);
export const isM05LookupOpen = (): boolean => SharedVariables.get<boolean>(M05_LOOKUP_OPEN_KEY) === true;

export const clearM05Progress = (): void => {
    SharedVariables.remove(M05_ARCHIVE_OPEN_KEY);
    SharedVariables.remove(M05_LOOKUP_OPEN_KEY);
};
