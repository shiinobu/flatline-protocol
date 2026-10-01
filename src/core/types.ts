import type {
    FirewallRule,
    MailDefinition,
    NetworkFileMap,
    NetworkPort,
    NetworkUser,
    Shell,
    TwotterTweetInteraction,
} from "@hotbunny/hackhub-content-sdk";

export type DeviceKind = "router" | "device" | "firewall";

export interface DeviceSpec {
    kind: DeviceKind;
    ip: string;
    lanIp?: string;
    isIpHidden?: boolean;
    users: Partial<NetworkUser>[];
    ports?: NetworkPort[];
    rules?: FirewallRule[];
    rootFiles?: NetworkFileMap[];
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

export interface WorldSpec {
    readonly id: string;
    readonly networkIps: readonly string[];
    readonly networks: () => readonly RouterSpec[];
    readonly persistentDomains: readonly PersistentDomain[];
    readonly domains: readonly DomainSpec[];
    readonly fixtures: () => readonly FixtureEntry[];
    readonly staleFixtures: readonly FixtureRef[];
    readonly unlocks: Readonly<Record<string, UnlockSpec>>;
}

export interface WorldState {
    readonly networkBuilt: boolean;
    readonly unlocked: readonly string[];
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
    readonly body: () => string;
    readonly matchesFields: (fields: Record<string, unknown>) => boolean;
}

export interface Gate<D> {
    readonly step: keyof D & string;
    readonly requires: readonly (keyof D & string)[];
}

export interface Unlock<D> {
    readonly name: string;
    readonly when: keyof D & string;
}
