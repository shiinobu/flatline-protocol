import { Files, type FileInfo } from "@hotbunny/hackhub-content-sdk";

import { pathOf, type KernelFile } from "./kernel-layout.js";
import { asLogData, type LogEntry } from "./log-file.js";

const COPY_SUFFIX = /^(.+?)\s+\(\d+\)$/;
const SETTLE_POLLS = 60;
const REMOVE_ROUNDS = 6;

const joinPath = (parent: string, part: string): string => (parent === "/" ? `/${part}` : `${parent}/${part}`);

const stemOf = (info: FileInfo): string => {
    const trimmed = info.name.trim();
    const match = COPY_SUFFIX.exec(trimmed);
    return (match === null ? trimmed : match[1].trim()).toLowerCase();
};

const isCopyOf = (info: FileInfo, file: KernelFile): boolean =>
    info.isFolder !== true && (info.extension ?? "") === file.extension && stemOf(info) === file.name.toLowerCase();

const copiesOf = async (file: KernelFile): Promise<readonly FileInfo[]> => {
    const folder = await Files.getByPath(file.folder);
    if (folder === null) return [];
    return (await Files.getChildren(folder.id)).filter((child) => isCopyOf(child, file));
};

const recordsOf = async (file: FileInfo): Promise<number> => {
    if (file.parent === undefined) return Files.getById(file.id) === null ? 0 : 1;
    return (await Files.getChildren(file.parent)).filter((child) => child.id === file.id).length;
};

const settled = async (isDone: () => Promise<boolean>): Promise<boolean> => {
    for (let poll = 0; poll < SETTLE_POLLS; poll += 1) {
        if (await isDone()) return true;
    }
    return false;
};

const removeCopies = async (file: KernelFile): Promise<number> => {
    const found = await copiesOf(file);
    let remaining = found;
    for (let round = 0; round < REMOVE_ROUNDS && remaining.length > 0; round += 1) {
        for (const copy of remaining) Files.remove(copy.id);
        await settled(async () => (await copiesOf(file)).length === 0);
        remaining = await copiesOf(file);
    }
    return found.length;
};

const removeRecords = async (file: FileInfo): Promise<void> => {
    let count = await recordsOf(file);
    for (let round = 0; round < REMOVE_ROUNDS && count > 0; round += 1) {
        for (let copy = 0; copy < count; copy += 1) Files.remove(file.id);
        await settled(async () => (await recordsOf(file)) === 0);
        count = await recordsOf(file);
    }
};

export const ensureFolder = async (path: string): Promise<readonly string[]> => {
    const created: string[] = [];
    let parent = Files.getRootPath();
    for (const part of path.split("/").filter(Boolean)) {
        const here = joinPath(parent, part);
        if ((await Files.getByPath(here)) === null) {
            await Files.createTree(parent, [{ name: part, isFolder: true, children: [] }]);
            created.push(here);
        }
        parent = here;
    }
    return created;
};

export const findKernelFile = (file: KernelFile): Promise<FileInfo | null> => Files.getByPath(pathOf(file));

export const readKernelFile = async (file: KernelFile): Promise<string | null> => {
    const info = await findKernelFile(file);
    return info === null ? null : (Files.read(info.id) ?? "");
};

const writeFile = async (file: KernelFile, data: string): Promise<readonly string[]> => {
    const created = await ensureFolder(file.folder);
    await removeCopies(file);
    await Files.createTree(file.folder, [{ name: file.name, extension: file.extension, data }]);
    return created;
};

export const writeKernelFile = (file: KernelFile, data: string): Promise<readonly string[]> =>
    writeFile(file, data);

export const writeKernelLog = (file: KernelFile, entries: readonly LogEntry[]): Promise<readonly string[]> =>
    writeFile(file, asLogData(entries));

export const removeKernelFile = async (file: KernelFile): Promise<boolean> => (await removeCopies(file)) > 0;

export const removeTree = async (file: FileInfo): Promise<void> => {
    if (file.isFolder === true) {
        for (const child of await Files.getChildren(file.id)) await removeTree(child);
    }
    await removeRecords(file);
};

export const emptyFolder = async (path: string): Promise<void> => {
    const folder = await Files.getByPath(path);
    if (folder === null) return;

    for (const child of await Files.getChildren(folder.id)) await removeTree(child);
};

export const removeFolderIfEmpty = async (path: string): Promise<boolean> => {
    const folder = await Files.getByPath(path);
    if (folder === null) return false;
    if ((await Files.getChildren(folder.id)).length > 0) return false;

    await removeRecords(folder);
    return true;
};
