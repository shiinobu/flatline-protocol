import {
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
    Twotter,
    WeeChat,
} from "@hotbunny/hackhub-content-sdk";

import {
    M01_BROKER_LISTING_URL,
    M01_BROKER_USERNAME,
    M01_BUYER_ALIAS,
    M01_CASE_ID,
    M01_CUSTODIAN_CONTENT,
    M01_CUSTODIAN_SUBJECT,
    M01_DEAD_DROP_EMAIL,
    M01_DECOY_DOMAIN,
    M01_DECOY_IP,
    M01_DOMAIN,
    M01_DOMAIN_RECORDS,
    M01_DUMMY_AUTH_LOG_CONTENT,
    M01_DUMMY_CRON_LOG_CONTENT,
    M01_DUMMY_README_CONTENT,
    M01_DUMMY_SYSTEM_LOG_CONTENT,
    M01_DUMMY_TODO_CONTENT,
    M01_FIREWALL_IP,
    M01_FIREWALL_LAN_IP,
    M01_FIREWALL_NMAP_RESULT,
    M01_FIREWALL_PASSWORD,
    M01_FIREWALL_ROUTER_IP,
    M01_FIREWALL_ROUTER_LAN_IP,
    M01_FIREWALL_USERNAME,
    M01_FRONT_IP,
    M01_FRONT_LAN_IP,
    M01_FRONT_NMAP_RESULT,
    M01_FRONT_ROUTER_IP,
    M01_FRONT_ROUTER_LAN_IP,
    M01_HIDDEN_PATH,
    M01_LEGACY_CONTENT,
    M01_LEGACY_IP,
    M01_LEGACY_LAN_IP,
    M01_LEGACY_PASSWORD,
    M01_LEGACY_USERNAME,
    M01_IRC_CONVERSATION,
    M01_IRC_HOST,
    M01_IRC_NOTES_CONTENT,
    M01_IRC_NOTES_FILE_CONTENT,
    M01_IRC_NOTES_FILE_EXTENSION,
    M01_IRC_NOTES_FILE_NAME,
    M01_IRC_PASSWORD,
    M01_JWT_DECODER_SCRIPT_NAME,
    M01_KIMAI_SCRIPT_NAME,
    M01_LEDGER_CONTENT,
    M01_LEDGER_FILE_EXTENSION,
    M01_LEDGER_FILE_NAME,
    M01_LEDGERVAULT_DOMAIN,
    M01_LEDGERVAULT_IP,
    M01_NMAP_RESULT,
    M01_OBJECTIVES,
    M01_OBJECTIVE_IDS,
    M01_OPS_NOTES_CONTENT,
    M01_OPS_NOTES_FILE_EXTENSION,
    M01_OPS_NOTES_FILE_NAME,
    M01_REPORT_BODY,
    M01_REPORT_SUBJECT,
    M01_REPORT_TEMPLATE_CONTENT,
    M01_REPORT_TEMPLATE_ID,
    M01_REPORT_TEMPLATE_LABEL,
    M01_REWARDS,
    M01_ROUTER_IP,
    M01_ROUTER_LAN_IP,
    M01_TARGET_IP,
    M01_TARGET_LAN_IP,
    M01_TARGET_PASSWORD,
    M01_TARGET_USERNAME,
    M01_TIPSTER_EMAIL,
    M01_TIP_CONTENT,
    M01_TIP_SUBJECT,
    M01_TWOTTER_BROKER_AVATAR,
    M01_TWOTTER_BROKER_BANNER,
    M01_TWOTTER_BROKER_BIO,
    M01_TWOTTER_BROKER_FIRST_NAME,
    M01_TWOTTER_BROKER_HANDLE,
    M01_TWOTTER_BROKER_LAST_NAME,
    M01_TWOTTER_BROKER_POSTS,
    M01_TWOTTER_CONTACT_AVATAR,
    M01_TWOTTER_CONTACT_BANNER,
    M01_TWOTTER_CONTACT_BIO,
    M01_TWOTTER_CONTACT_FIRST_NAME,
    M01_TWOTTER_CONTACT_HANDLE,
    M01_TWOTTER_CONTACT_LAST_NAME,
    M01_TWOTTER_CONTACT_POSTS,
    M01_TWOTTER_DECOY_AVATAR,
    M01_TWOTTER_DECOY_BANNER,
    M01_TWOTTER_DECOY_BIO,
    M01_TWOTTER_DECOY_HANDLE,
    M01_TWOTTER_DECOY_POSTS,
} from "../content/m01.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

interface M01QuestData {
    readonly tipReviewed: boolean;
    readonly domainResolved: boolean;
    readonly frontScanned: boolean;
    readonly subdomainsEnumerated: boolean;
    readonly backendResolved: boolean;
    readonly listingFound: boolean;
    readonly decoyRuledOut: boolean;
    readonly kimaiRan: boolean;
    readonly tokenDecoded: boolean;
    readonly firewallBreached: boolean;
    readonly pfsenseLoggedIn: boolean;
    readonly backendAccessed: boolean;
    readonly suspiciousFileFound: boolean;
    readonly credentialsDecrypted: boolean;
    readonly chatConfirmed: boolean;
    readonly reportSent: boolean;
}

const resetM01ShellFixtures = (): void => {
    for (const record of M01_DOMAIN_RECORDS) {
        Shell.removeCommandData("nslookup", record.name);
    }

    Shell.removeCommandData("nmap", M01_FRONT_IP);
    Shell.removeCommandData("nmap", M01_LEGACY_IP);
    Shell.removeCommandData("nmap", M01_TARGET_IP);
    Shell.removeCommandData("nmap", M01_FIREWALL_IP);
    Shell.removeCommandData("lynx", M01_DOMAIN);
    Shell.removeCommandData("lynx", M01_BROKER_USERNAME);
    Shell.removeCommandData("lynx", M01_DECOY_DOMAIN);
    Shell.removeCommandData("lynx", M01_TWOTTER_CONTACT_HANDLE);
    Shell.removeCommandData("lynx", M01_TWOTTER_DECOY_HANDLE);
    Shell.removeCommandData("whois", M01_DECOY_DOMAIN);
    Shell.removeCommandData("geoip", M01_DECOY_IP);
    Shell.removeCommandData("ssh", {
        host: M01_TARGET_IP,
        key: M01_TARGET_PASSWORD,
    });
    Shell.removeCommandData("ssh", {
        host: M01_LEGACY_IP,
        key: M01_LEGACY_PASSWORD,
    });
    Shell.removeCommandData("weechat", {
        host: M01_IRC_HOST,
        password: M01_IRC_PASSWORD,
    });
};

const registerM01ShellFixtures = (): void => {
    resetM01ShellFixtures();

    for (const record of M01_DOMAIN_RECORDS) {
        Shell.addCommandData("nslookup", record.name, record.ip);
    }

    Shell.addCommandData("nmap", M01_FRONT_IP, M01_FRONT_NMAP_RESULT);
    Shell.addCommandData("nmap", M01_LEGACY_IP, [{ port: 22, status: "OPEN", service: "ssh" }]);
    Shell.addCommandData("nmap", M01_TARGET_IP, M01_NMAP_RESULT);
    Shell.addCommandData("nmap", M01_FIREWALL_IP, M01_FIREWALL_NMAP_RESULT);
    Shell.addCommandData("lynx", M01_DOMAIN, {
        ips: [M01_FRONT_IP],
        address: [`https://${M01_DOMAIN}/`],
        additional: ["Marketplace advertising illicitly obtained network access. Fronted by a third-party CDN."],
    });
    Shell.addCommandData("lynx", M01_BROKER_USERNAME, {
        socialMedia: [`@${M01_TWOTTER_BROKER_HANDLE}`],
        additional: ["Partial match on an old alias. Current activity traces to a social handle, not this name."],
    });
    Shell.addCommandData("lynx", M01_TWOTTER_CONTACT_HANDLE, {
        socialMedia: [`@${M01_TWOTTER_CONTACT_HANDLE}`],
        additional: ["Low profile. Mostly reposts and complaints. No public real name on file."],
    });
    Shell.addCommandData("lynx", M01_TWOTTER_DECOY_HANDLE, {
        socialMedia: [`@${M01_TWOTTER_DECOY_HANDLE}`],
        additional: ["Day trader. High post volume, all crypto price talk. No connection to any of the above."],
    });
    Shell.addCommandData("lynx", M01_DECOY_DOMAIN, {
        ips: [M01_DECOY_IP],
        address: [`https://${M01_DECOY_DOMAIN}/`],
        additional: [
            `Crypto exchange front, heavy ad spend. Brand chatter mostly traces to a trader posting as @${M01_TWOTTER_DECOY_HANDLE}.`,
        ],
    });
    Shell.addCommandData("whois", M01_DECOY_DOMAIN, {
        domain: M01_DECOY_DOMAIN,
        contact: "Registrar Privacy Service",
        status: true,
    });
    Shell.addCommandData("geoip", M01_DECOY_IP, {
        country: "Iceland",
        city: "Reykjavik",
        latitude: "64.1466",
        longitude: "-21.9426",
    });
    Shell.addCommandData(
        "ssh",
        { host: M01_TARGET_IP, key: M01_TARGET_PASSWORD },
        { ip: M01_TARGET_IP, status: "OPEN" },
    );
    Shell.addCommandData(
        "ssh",
        { host: M01_LEGACY_IP, key: M01_LEGACY_PASSWORD },
        { ip: M01_LEGACY_IP, status: "OPEN" },
    );
    Shell.addCommandData(
        "weechat",
        { host: M01_IRC_HOST, password: M01_IRC_PASSWORD },
        true,
    );
};

const registerM01Network = (): void => {
    Network.destroyNetwork(M01_ROUTER_IP);
    Network.destroyNetwork(M01_FIREWALL_ROUTER_IP);
    Network.destroyNetwork(M01_FRONT_ROUTER_IP);

    Network.createSubnetNetwork({
        ip: M01_FIREWALL_ROUTER_IP,
        lanIp: M01_FIREWALL_ROUTER_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M01_FIREWALL_IP,
                lanIp: M01_FIREWALL_LAN_IP,
                type: NetworkDeviceType.Firewall,
                isIpHidden: true,
                users: [
                    Network.createUser({
                        username: M01_FIREWALL_USERNAME,
                        password: M01_FIREWALL_PASSWORD,
                    }),
                ],
                ports: [{ external: 80, internal: 80, active: true, service: "http" }],
                rules: [{ allowed: false, port: 22 }],
            },
        ],
    });

    Network.createSubnetNetwork({
        ip: M01_FRONT_ROUTER_IP,
        lanIp: M01_FRONT_ROUTER_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M01_FRONT_IP,
                lanIp: M01_FRONT_LAN_IP,
                type: NetworkDeviceType.Device,
                users: [],
                ports: [{ external: 443, internal: 443, active: true, service: "https" }],
            },
            {
                ip: M01_LEGACY_IP,
                lanIp: M01_LEGACY_LAN_IP,
                type: NetworkDeviceType.Device,
                users: [
                    Network.createUser({
                        username: M01_LEGACY_USERNAME,
                        password: M01_LEGACY_PASSWORD,
                    }),
                ],
                ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
                rootFiles: [
                    { name: "decommissioned", extension: "txt", data: M01_LEGACY_CONTENT },
                ],
            },
        ],
    });

    Network.createSubnetNetwork({
        ip: M01_ROUTER_IP,
        lanIp: M01_ROUTER_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M01_TARGET_IP,
                lanIp: M01_TARGET_LAN_IP,
                type: NetworkDeviceType.Device,
                isIpHidden: true,
                users: [
                    Network.createUser({
                        username: M01_TARGET_USERNAME,
                        password: M01_TARGET_PASSWORD,
                    }),
                ],
                ports: [
                    { external: 22, internal: 22, active: false, service: "ssh" },
                    { external: 80, internal: 80, active: false, service: "http" },
                    { external: 443, internal: 443, active: true, service: "https" },
                ],
                rootFiles: [
                    {
                        name: "home",
                        isFolder: true,
                        children: [
                            {
                                name: M01_OPS_NOTES_FILE_NAME,
                                extension: M01_OPS_NOTES_FILE_EXTENSION,
                                data: M01_OPS_NOTES_CONTENT,
                            },
                            { name: "todo", extension: "txt", data: M01_DUMMY_TODO_CONTENT },
                            { name: "readme", extension: "txt", data: M01_DUMMY_README_CONTENT },
                        ],
                    },
                    {
                        name: "logs",
                        isFolder: true,
                        children: [
                            {
                                name: M01_LEDGER_FILE_NAME,
                                extension: M01_LEDGER_FILE_EXTENSION,
                                data: M01_LEDGER_CONTENT,
                            },
                            {
                                name: M01_IRC_NOTES_FILE_NAME,
                                extension: M01_IRC_NOTES_FILE_EXTENSION,
                                data: M01_IRC_NOTES_FILE_CONTENT,
                            },
                            { name: "auth", extension: "log", data: M01_DUMMY_AUTH_LOG_CONTENT },
                            { name: "cron", extension: "log", data: M01_DUMMY_CRON_LOG_CONTENT },
                            { name: "system", extension: "log", data: M01_DUMMY_SYSTEM_LOG_CONTENT },
                        ],
                    },
                ],
            },
        ],
    });

    Network.removeDomain(M01_LEDGERVAULT_DOMAIN);
    Network.registerDomain(M01_LEDGERVAULT_DOMAIN, M01_LEDGERVAULT_IP);

    for (const record of M01_DOMAIN_RECORDS) {
        if (record.needsSubnet) {
            Network.destroyNetwork(record.ip);
            Network.createSubnetNetwork({
                ip: record.ip,
                type: NetworkDeviceType.Device,
                users: [],
                ports: [],
            });
        }

        Network.removeDomain(record.name);
        Network.registerDomain(record.name, record.ip);
    }
};

const registerM01TwotterPersonas = (): void => {
    const broker =
        Twotter.getUserByUsername(M01_TWOTTER_BROKER_HANDLE) ??
        Twotter.createUser({
            username: M01_TWOTTER_BROKER_HANDLE,
            firstName: M01_TWOTTER_BROKER_FIRST_NAME,
            lastName: M01_TWOTTER_BROKER_LAST_NAME,
            avatar: M01_TWOTTER_BROKER_AVATAR,
            banner: M01_TWOTTER_BROKER_BANNER,
            bio: M01_TWOTTER_BROKER_BIO,
        });
    if (!Twotter.getUserByUsername(M01_TWOTTER_BROKER_HANDLE)) {
        Twotter.addUser(broker);
    }
    Twotter.updateUser(broker.id, {
        name: M01_TWOTTER_BROKER_FIRST_NAME,
        surname: M01_TWOTTER_BROKER_LAST_NAME,
        avatar: M01_TWOTTER_BROKER_AVATAR,
        banner: M01_TWOTTER_BROKER_BANNER,
    });
    M01_TWOTTER_BROKER_POSTS.forEach((post, index) => {
        const id = `m01-broker-tweet-${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({
            id,
            userId: broker.id,
            content: post.content,
            interaction: post.interaction,
        });
    });

    const contact =
        Twotter.getUserByUsername(M01_TWOTTER_CONTACT_HANDLE) ??
        Twotter.createUser({
            username: M01_TWOTTER_CONTACT_HANDLE,
            firstName: M01_TWOTTER_CONTACT_FIRST_NAME,
            lastName: M01_TWOTTER_CONTACT_LAST_NAME,
            avatar: M01_TWOTTER_CONTACT_AVATAR,
            banner: M01_TWOTTER_CONTACT_BANNER,
            bio: M01_TWOTTER_CONTACT_BIO,
        });
    if (!Twotter.getUserByUsername(M01_TWOTTER_CONTACT_HANDLE)) {
        Twotter.addUser(contact);
    }
    Twotter.updateUser(contact.id, {
        name: M01_TWOTTER_CONTACT_FIRST_NAME,
        surname: M01_TWOTTER_CONTACT_LAST_NAME,
        avatar: M01_TWOTTER_CONTACT_AVATAR,
        banner: M01_TWOTTER_CONTACT_BANNER,
    });
    M01_TWOTTER_CONTACT_POSTS.forEach((post, index) => {
        const id = `m01-contact-tweet-${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({
            id,
            userId: contact.id,
            content: post.content,
            interaction: post.interaction,
        });
    });

    const decoy =
        Twotter.getUserByUsername(M01_TWOTTER_DECOY_HANDLE) ??
        Twotter.createUser({
            username: M01_TWOTTER_DECOY_HANDLE,
            avatar: M01_TWOTTER_DECOY_AVATAR,
            banner: M01_TWOTTER_DECOY_BANNER,
            bio: M01_TWOTTER_DECOY_BIO,
        });
    if (!Twotter.getUserByUsername(M01_TWOTTER_DECOY_HANDLE)) {
        Twotter.addUser(decoy);
    }
    Twotter.updateUser(decoy.id, {
        avatar: M01_TWOTTER_DECOY_AVATAR,
        banner: M01_TWOTTER_DECOY_BANNER,
    });
    M01_TWOTTER_DECOY_POSTS.forEach((post, index) => {
        const id = `m01-decoy-tweet-${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({
            id,
            userId: decoy.id,
            content: post.content,
            interaction: post.interaction,
        });
    });
};

const normalizeBrokerReference = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

@RegisterQuest
export class FlatlineM01Quest extends Quest<M01QuestData> {
    override Name = "flatline.m01";
    override Title = "First Trace";
    override Description = "Trace the initial access broker who sold out the hospital's network.";
    override Group = "storyline" as const;
    override AutoStart = true;
    override AutoComplete = true;
    override QuestsToComplete = questGate("m01", []);
    override Rewards = (isQuestDevFocus("m01") || isQuestTesterFocus("m01")) ? { money: 0, xp: 0 } : M01_REWARDS;

    override Objectives = applyDevGating(M01_OBJECTIVES, isQuestDevFocus("m01"));

    override CreateData(): M01QuestData {
        return {
            tipReviewed: false,
            domainResolved: false,
            frontScanned: false,
            subdomainsEnumerated: false,
            backendResolved: false,
            listingFound: false,
            decoyRuledOut: false,
            kimaiRan: false,
            tokenDecoded: false,
            firewallBreached: false,
            pfsenseLoggedIn: false,
            backendAccessed: false,
            suspiciousFileFound: false,
            credentialsDecrypted: false,
            chatConfirmed: false,
            reportSent: false,
        };
    }

    override OnStart() {
        WeeChat.removeServer(M01_IRC_HOST, M01_IRC_PASSWORD);
        WeeChat.createServer(M01_IRC_HOST, M01_IRC_PASSWORD);

        for (const line of M01_IRC_CONVERSATION) {
            WeeChat.sendMessage({
                host: M01_IRC_HOST,
                username: line.username,
                message: line.message,
            });
        }

        registerM01TwotterPersonas();

        Mail.send({
            from: M01_DEAD_DROP_EMAIL,
            subject: M01_CUSTODIAN_SUBJECT,
            content: M01_CUSTODIAN_CONTENT,
        });

        Mail.send({
            from: M01_TIPSTER_EMAIL,
            subject: M01_TIP_SUBJECT,
            content: M01_TIP_CONTENT,
        });
    }

    override OnObjectivesStart() {
        registerM01Network();
        registerM01ShellFixtures();

        if (this.Data.firewallBreached) {
            Network.removeFirewallRule(M01_FIREWALL_IP, 22);
            Network.openPort(M01_TARGET_IP, 22);
        }

        Mail.registerTemplate({
            id: M01_REPORT_TEMPLATE_ID,
            label: M01_REPORT_TEMPLATE_LABEL,
            title: M01_REPORT_SUBJECT,
            content: M01_REPORT_TEMPLATE_CONTENT,
            fields: ["broker", "buyer", "caseId"],
        });

        this.Events.on("Mail.Read", (data) => {
            if (this.Data.tipReviewed) return;
            if (data.from !== M01_TIPSTER_EMAIL || data.subject !== M01_TIP_SUBJECT) return;

            this.SetData("tipReviewed", true);
        });

        this.Events.on("Terminal.Nslookup", (data) => {
            if (!this.Data.domainResolved && data.domain === M01_DOMAIN) {
                this.SetData("domainResolved", true);
            }

            if (!this.Data.backendResolved && data.domain === `gateway.${M01_DOMAIN}`) {
                this.SetData("backendResolved", true);
            }
        });

        this.Events.on("Terminal.NmapScan", (data) => {
            if (this.Data.frontScanned) return;
            if (data.ip !== M01_FRONT_IP) return;

            this.SetData("frontScanned", true);
        });

        this.Events.on("Subfinder.Results", (data) => {
            if (this.Data.subdomainsEnumerated) return;
            if (data.domain !== M01_DOMAIN) return;

            this.SetData("subdomainsEnumerated", true);
        });

        this.Events.on("Terminal.Geoip", (data) => {
            if (this.Data.decoyRuledOut) return;
            if (data !== M01_DECOY_IP) return;

            this.SetData("decoyRuledOut", true);
        });

        this.Events.on("Browser.Meta", (data) => {
            if (this.Data.listingFound) return;
            if (data.protocol !== "https:" || data.hostname !== M01_DOMAIN) return;
            if (data.pathname.replace(/\/$/, "") !== M01_HIDDEN_PATH.replace(/\/$/, "")) return;

            this.SetData("listingFound", true);
            this.completeObjective(M01_OBJECTIVE_IDS.accessListing);
        });

        this.Events.on("Python3.ExecFile", (data) => {
            if (data.file.name === M01_KIMAI_SCRIPT_NAME) {
                if (this.Data.kimaiRan) return;
                if (data.args[0] !== M01_FIREWALL_IP) return;

                this.SetData("kimaiRan", true);
                return;
            }

            if (data.file.name === M01_JWT_DECODER_SCRIPT_NAME) {
                if (this.Data.tokenDecoded) return;
                if (!this.Data.kimaiRan) return;
                if (data.args.length !== 1) return;

                this.SetData("tokenDecoded", true);
            }
        });

        this.Events.on("PFSense.Login", (data) => {
            if (data.ip !== M01_FIREWALL_IP) return;

            this.SetData("pfsenseLoggedIn", true);
        });

        this.Events.on("PFSense.Changes", () => {
            if (!this.Data.pfsenseLoggedIn) return;
            if (this.Data.firewallBreached) return;

            this.SetData("firewallBreached", true);
            Network.removeFirewallRule(M01_FIREWALL_IP, 22);
            Network.openPort(M01_TARGET_IP, 22);
        });

        this.Events.on("Terminal.SSH.Connected", (data) => {
            if (data !== M01_TARGET_IP) return;
            if (this.Data.backendAccessed) return;

            this.SetData("backendAccessed", true);
            this.completeObjective(M01_OBJECTIVE_IDS.accessBackend);
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (this.Data.suspiciousFileFound) return;
            if (data.name !== M01_IRC_NOTES_FILE_NAME || data.data !== M01_IRC_NOTES_FILE_CONTENT) return;

            this.SetData("suspiciousFileFound", true);
        });

        this.Events.on("Terminal.Openssl", (data) => {
            if (this.Data.credentialsDecrypted) return;
            if (data.type !== "dec" || data.output !== M01_IRC_NOTES_CONTENT) return;

            this.SetData("credentialsDecrypted", true);
        });

        this.Events.on("WeeChat.Connected", (data) => {
            if (this.Data.chatConfirmed) return;
            if (data !== M01_IRC_HOST) return;

            this.SetData("chatConfirmed", true);
            this.completeObjective(M01_OBJECTIVE_IDS.confirmViaChat);
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (!this.isReport(data.subject, data.content)) return;
            if (data.to !== M01_DEAD_DROP_EMAIL) return;

            this.SetData("reportSent", true);
            this.completeObjective(M01_OBJECTIVE_IDS.reportFindings);
        });
    }

    override OnComplete() {
        resetM01ShellFixtures();
        Network.removeDomain(M01_LEDGERVAULT_DOMAIN);
        for (const record of M01_DOMAIN_RECORDS) {
            Network.removeDomain(record.name);
            if (record.needsSubnet) Network.destroyNetwork(record.ip);
        }
        Network.destroyNetwork(M01_ROUTER_IP);
        Network.destroyNetwork(M01_FIREWALL_ROUTER_IP);
        Network.destroyNetwork(M01_FRONT_ROUTER_IP);
    }

    override OnAbandon() {
        resetM01ShellFixtures();
        Network.removeDomain(M01_LEDGERVAULT_DOMAIN);
        for (const record of M01_DOMAIN_RECORDS) {
            Network.removeDomain(record.name);
            if (record.needsSubnet) Network.destroyNetwork(record.ip);
        }
        Network.destroyNetwork(M01_ROUTER_IP);
        Network.destroyNetwork(M01_FIREWALL_ROUTER_IP);
        Network.destroyNetwork(M01_FRONT_ROUTER_IP);
    }

    private isReport(subject: string, content: string): boolean {
        if (this.isTemplateReport(subject, content)) {
            return true;
        }

        const normalizedSubject = subject.trim().toLowerCase();
        const normalizedContent = content.trim();

        return (
            normalizedSubject === M01_REPORT_SUBJECT.toLowerCase() &&
            normalizedContent === M01_REPORT_BODY
        );
    }

    private isTemplateReport(subject: string, content: string): boolean {
        if (subject !== M01_REPORT_TEMPLATE_ID) return false;

        let fields: unknown;
        try {
            fields = JSON.parse(content);
        } catch {
            return false;
        }

        if (!fields || typeof fields !== "object") return false;

        const { broker, buyer, caseId } = fields as Record<string, unknown>;
        return (
            normalizeBrokerReference(broker) === M01_BROKER_LISTING_URL &&
            buyer === M01_BUYER_ALIAS &&
            caseId === M01_CASE_ID
        );
    }
}
