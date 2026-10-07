import { Events, Files, type FileInfo } from "@hotbunny/hackhub-content-sdk";

const LOCAL_HOME_PREFIX = "~";

let activeTargetIp: string | undefined;

Events.on("RemoteConnection.Established", (connection) => {
    if (connection.t !== "METASPLOIT") return;

    activeTargetIp = connection.targetIp;
});

Events.on("RemoteConnection.Disconnected", (connection) => {
    if (connection.t !== "METASPLOIT" || connection.targetIp !== activeTargetIp) return;

    activeTargetIp = undefined;
});

const fileLabel = (file: FileInfo): string =>
    file.extension && !file.isFolder ? `${file.name}.${file.extension}` : file.name;

const descend = async (parent: FileInfo, segments: readonly string[]): Promise<FileInfo | null> => {
    const [segment, ...rest] = segments;
    if (segment === undefined) return parent;
    if (!parent.isFolder) return null;

    const children = await Files.getChildren(parent.id);
    const match = children.find((child) => fileLabel(child) === segment);

    return match ? descend(match, rest) : null;
};

export const findMeterpreterFile = async (target: string): Promise<FileInfo | null> => {
    if (activeTargetIp === undefined || target.startsWith(LOCAL_HOME_PREFIX)) return null;

    const root = Files.getById(activeTargetIp);
    if (!root) {
        return null;
    }

    const absolutePath = await Files.resolvePath(target);
    const found = await descend(
        root,
        absolutePath.split("/").filter((segment) => segment !== ""),
    );

    return found;
};

export const findSessionFile = async (target: string): Promise<FileInfo | null> => {
    if (Files.isRemoteSession()) return Files.getByPath(target);

    return (await findMeterpreterFile(target)) ?? Files.getByPath(target);
};
