import { Random } from "@hotbunny/hackhub-content-sdk";

export type ImageRole = "expected" | "stale" | "bad";

export interface KernelFile {
    readonly folder: string;
    readonly name: string;
    readonly extension: string;
}

export interface KernelLayout {
    readonly kernel: string;
    readonly version: string;
    readonly abi: string;
    readonly staleAbi: string;
    readonly depends: readonly string[];
    readonly vermagic: string;
    readonly moduleDir: string;
    readonly modulePath: string;
    readonly configPath: string;
    readonly backupPath: string;
    readonly initramfsPath: string;
    readonly incidentPath: string;
    readonly recoveryDir: string;
}

export interface StagedImage {
    readonly build: string;
    readonly role: ImageRole;
    readonly srcversion: string;
    readonly vermagic: string;
}

export interface ImageRoll {
    readonly expectedBuild: string;
    readonly expectedSrcversion: string;
    readonly images: readonly StagedImage[];
}

export interface IncidentLogSpec {
    readonly ip: string;
    readonly expectedSrcversion: string;
    readonly gateway?: string;
}

export const KERNEL_RELEASE = "6.8.0-flatline";
export const FLCOMP_VERSION = "4.12";
export const FLCOMP_ABI = "7";
export const FLCOMP_STALE_ABI = "6";
export const FLCOMP_DEPENDS: readonly string[] = ["flfb", "drm_kms_helper"];
export const FLCOMP_VERMAGIC = `${KERNEL_RELEASE} SMP preempt mod_unload`;
export const FLCOMP_BUILDS: readonly string[] = ["r3187", "r3310", "r3402"];

const BAD_VERMAGIC = "6.8.0-rc3-flatline SMP preempt mod_unload";
const SRCVERSION_LENGTH = 24;
const STALE_TWEAKS = 2;
const HEX_DIGITS = "0123456789ABCDEF";
const IMAGE_ROLES: readonly ImageRole[] = ["expected", "stale", "bad"];

export const RECOVERY_FOLDER = "/boot/recovery";
export const MODULE_FILE: KernelFile = {
    folder: `/lib/modules/${KERNEL_RELEASE}/extra`,
    name: "flcomp",
    extension: "ko",
};
export const CONFIG_FILE: KernelFile = { folder: "/etc/flcomp", name: "display", extension: "conf" };
export const BACKUP_FILE: KernelFile = { folder: RECOVERY_FOLDER, name: "display-backup", extension: "conf" };
export const INITRAMFS_FILE: KernelFile = { folder: "/boot", name: "initramfs-flatline", extension: "img" };
export const INCIDENT_FILE: KernelFile = { folder: "/var/log", name: "flcomp-incident", extension: "log" };

export const INCIDENT_FILE_NAME = INCIDENT_FILE.name;
export const INCIDENT_FILE_EXTENSION = INCIDENT_FILE.extension;

export const imageFile = (build: string): KernelFile => ({
    folder: RECOVERY_FOLDER,
    name: `flcomp-${build}`,
    extension: "ko",
});

export const pathOf = (file: KernelFile): string => `${file.folder}/${file.name}.${file.extension}`;

export const KERNEL_LAYOUT: KernelLayout = {
    kernel: KERNEL_RELEASE,
    version: FLCOMP_VERSION,
    abi: FLCOMP_ABI,
    staleAbi: FLCOMP_STALE_ABI,
    depends: FLCOMP_DEPENDS,
    vermagic: FLCOMP_VERMAGIC,
    moduleDir: MODULE_FILE.folder,
    modulePath: pathOf(MODULE_FILE),
    configPath: pathOf(CONFIG_FILE),
    backupPath: pathOf(BACKUP_FILE),
    initramfsPath: pathOf(INITRAMFS_FILE),
    incidentPath: pathOf(INCIDENT_FILE),
    recoveryDir: RECOVERY_FOLDER,
};

export const CORRUPT_CONFIG = "@@ profile table overwritten by remote session @@\n0x00 0x00 0x00 unreadable";

export const buildModuleImage = (srcversion: string, vermagic: string): string =>
    [
        "FLCOMP-KO 1",
        "name=flcomp",
        `version=${FLCOMP_VERSION}`,
        `srcversion=${srcversion}`,
        `depends=${FLCOMP_DEPENDS.join(",")}`,
        `vermagic=${vermagic}`,
        `abi=${FLCOMP_ABI}`,
    ].join("\n");

export const buildConfig = (abi: string): string =>
    ["# flcomp display profile", "profile=flatline", "refresh=60", `abi=${abi}`].join("\n");

export const buildInitramfs = (flcomp: string): string =>
    [`INITRAMFS ${KERNEL_RELEASE}`, `flcomp=${flcomp}`].join("\n");

export const parseFields = (text: string): Readonly<Record<string, string>> => {
    const fields: Record<string, string> = {};
    for (const line of text.split("\n")) {
        const split = line.indexOf("=");
        if (split > 0) fields[line.slice(0, split).trim()] = line.slice(split + 1).trim();
    }
    return fields;
};

const hexDigit = (): string => HEX_DIGITS.charAt(Random.number(0, HEX_DIGITS.length - 1));

const differentDigit = (before: string): string => {
    let next = hexDigit();
    while (next === before) next = hexDigit();
    return next;
};

const tweak = (text: string, positions: readonly number[]): string => {
    const chars = text.split("");
    for (const position of positions) chars[position] = differentDigit(chars[position]);
    return chars.join("");
};

const shuffled = (items: readonly string[]): string[] => {
    const list = [...items];
    for (let index = list.length - 1; index > 0; index -= 1) {
        const other = Random.number(0, index);
        [list[index], list[other]] = [list[other], list[index]];
    }
    return list;
};

export const rollImages = (): ImageRoll => {
    const order = shuffled(FLCOMP_BUILDS);
    const base = Array.from({ length: SRCVERSION_LENGTH }, hexDigit).join("");
    const half = SRCVERSION_LENGTH / STALE_TWEAKS;
    const staleSrc = tweak(base, [Random.number(0, half - 1), Random.number(half, SRCVERSION_LENGTH - 1)]);
    const badSrc = tweak(base, [Random.number(0, SRCVERSION_LENGTH - 1)]);
    const sources: Readonly<Record<ImageRole, string>> = { expected: base, stale: staleSrc, bad: badSrc };

    const images = order.map((build, index): StagedImage => {
        const role = IMAGE_ROLES[index];
        return {
            build,
            role,
            srcversion: sources[role],
            vermagic: role === "bad" ? BAD_VERMAGIC : FLCOMP_VERMAGIC,
        };
    });

    return { expectedBuild: order[0], expectedSrcversion: base, images };
};

export const INCIDENT_START_STAMP = "03:14:07";

const INCIDENT_CLOCK: readonly string[] = [
    INCIDENT_START_STAMP,
    "03:14:08",
    "03:14:08",
    "03:14:09",
    "03:14:09",
    "03:14:10",
    "03:14:10",
    "03:14:11",
    "03:14:11",
    "03:14:12",
];

export const buildIncidentLog = (spec: IncidentLogSpec): string => {
    const gateway = spec.gateway === undefined ? "" : ` (nat gateway ${spec.gateway})`;
    return [
        `${INCIDENT_CLOCK[0]} compositord[812]: inbound session from ${spec.ip}:443 accepted${gateway}`,
        `${INCIDENT_CLOCK[1]} compositord[812]: session ${spec.ip} holds uid 0`,
        `${INCIDENT_CLOCK[2]} kernel: flcomp: loaded, srcversion ${spec.expectedSrcversion}, abi ${FLCOMP_ABI}, depends ${FLCOMP_DEPENDS.join(",")}`,
        `${INCIDENT_CLOCK[3]} kernel: flcomp: unload requested by pid 2207 (uid 0)`,
        `${INCIDENT_CLOCK[4]} kernel: flcomp: module removed, display pipeline released`,
        `${INCIDENT_CLOCK[5]} compositord[812]: ${pathOf(CONFIG_FILE)} rewritten by remote session`,
        `${INCIDENT_CLOCK[6]} compositord[812]: display.conf: profile table unreadable`,
        `${INCIDENT_CLOCK[7]} compositord[812]: desktop session terminated`,
        `${INCIDENT_CLOCK[8]} compositord[812]: recovery tools available: sysdiag, sysrepair, recovery modules`,
        `${INCIDENT_CLOCK[9]} compositord[812]: session ${spec.ip} dropped by peer`,
    ].join("\n");
};
