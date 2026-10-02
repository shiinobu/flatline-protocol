import type {
    DatabaseRowDefinition,
    FirewallRule,
    MailDefinition,
    NetworkFileMap,
    NetworkPort,
    NetworkUser,
    NetworkVulnerability,
    Shell,
    TwotterTweetInteraction,
} from "@hotbunny/hackhub-content-sdk";

export type DeviceKind = "router" | "device" | "firewall" | "splitter" | "printer";

export interface DeviceSpec {
    kind: DeviceKind;
    ip: string;
    lanIp?: string;
    name?: string;
    isIpHidden?: boolean;
    users: Partial<NetworkUser>[];
    ports?: NetworkPort[];
    rules?: FirewallRule[];
    rootFiles?: NetworkFileMap[];
    vulnerabilities?: NetworkVulnerability[];
    children?: DeviceSpec[];
}

export interface RouterSpec extends DeviceSpec {
    kind: "router";
    ports: NetworkPort[];
    children: DeviceSpec[];
}

export type FixtureRef = {
    [K in keyof Shell.CommandDataMap]: {
        readonly command: K;
        readonly input: Shell.CommandDataMap[K]["input"];
    };
}[keyof Shell.CommandDataMap];

export type FixtureEntry = {
    [K in keyof Shell.CommandDataMap]: {
        readonly command: K;
        readonly input: Shell.CommandDataMap[K]["input"];
        readonly data: Shell.CommandDataMap[K]["data"];
    };
}[keyof Shell.CommandDataMap];

export interface DomainSpec {
    readonly name: string;
    readonly ip: string;
    readonly needsSubnet: boolean;
    readonly vulnerabilities?: readonly NetworkVulnerability[];
}

export interface DatabaseSpec {
    readonly host: string;
    readonly user: string;
    readonly password: string;
    readonly tables: Readonly<Record<string, readonly DatabaseRowDefinition[]>>;
}

export interface PersistentDomain {
    readonly name: string;
    readonly ip: string;
}

export interface PortRef {
    readonly ip: string;
    readonly port: number;
}

export interface UnlockSpec {
    readonly fixtures?: () => readonly FixtureEntry[];
    readonly domains?: readonly DomainSpec[];
    readonly removeFirewallRules?: readonly PortRef[];
    readonly openPorts?: readonly PortRef[];
}

export interface WorldSpec<R = never> {
    readonly id: string;
    readonly networkIps: readonly string[];
    readonly networks: () => readonly RouterSpec[];
    readonly persistentDomains: readonly PersistentDomain[];
    readonly domains: readonly DomainSpec[];
    readonly fixtures: () => readonly FixtureEntry[];
    readonly staleFixtures: readonly FixtureRef[];
    readonly unlocks: Readonly<Record<string, UnlockSpec>>;
    readonly databases?: () => readonly DatabaseSpec[];
    readonly restore?: (saved: R) => void;
}

export interface WorldState<R = never> {
    readonly networkBuilt: boolean;
    readonly unlocked: readonly string[];
    readonly restore?: R;
}

export interface PersonaPost {
    readonly content: string;
    readonly interaction: TwotterTweetInteraction;
}

export interface PersonaSpec {
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly avatar?: string;
    readonly banner?: string;
    readonly bio: string;
    readonly gender: "male" | "female";
    readonly tweetIdPrefix: string;
    readonly posts: readonly PersonaPost[];
}

export interface IntroSpec {
    readonly personas: () => readonly PersonaSpec[];
    readonly mails: () => readonly MailDefinition[];
}

export interface ReportSpec {
    readonly templateId: string;
    readonly templateLabel: string;
    readonly fields: readonly string[];
    readonly subject: () => string;
    readonly templateContent: () => string;
    readonly body?: () => string;
    readonly matchesFields: (fields: Record<string, unknown>) => boolean;
}

export type FlagKey<D> = { [K in keyof D & string]: D[K] extends boolean ? K : never }[keyof D & string];

export interface Gate<D> {
    readonly step: FlagKey<D>;
    readonly requires: readonly FlagKey<D>[];
}

export interface Unlock<D> {
    readonly name: string;
    readonly when: FlagKey<D>;
}
