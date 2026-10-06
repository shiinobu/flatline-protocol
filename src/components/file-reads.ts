import type { QuestEvents } from "@hotbunny/hackhub-content-sdk";

import { OPEN_FILE_READ_EVENT } from "../commands/open.js";

export interface ReadFile {
    readonly name: string;
    readonly extension?: string;
}

interface OpenedFile extends ReadFile {
    readonly isFolder?: boolean;
}

export type FileReadListener = (file: ReadFile) => void;

const COPY_SUFFIX = /^(.+?)\s+\(\d+\)$/;

const stemOf = (name: string): string => {
    const trimmed = name.trim();
    const match = COPY_SUFFIX.exec(trimmed);
    return (match === null ? trimmed : match[1].trim()).toLowerCase();
};

export const isNamedFile = (file: ReadFile, name: string, extension: string): boolean =>
    (file.extension ?? "") === extension && stemOf(file.name) === name.toLowerCase();

export const onFileRead = (events: QuestEvents, listener: FileReadListener): void => {
    events.on("Terminal.Cat", (file) => listener(file));
    events.on(OPEN_FILE_READ_EVENT, (file: ReadFile) => listener(file));
    events.on("Files.Open", (opened) => {
        const file: OpenedFile | null | undefined = opened.data;
        if (!file || file.isFolder === true || typeof file.name !== "string") return;

        listener(file);
    });
};
