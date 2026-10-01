import {
    Http,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
    WeeChat,
} from "@hotbunny/hackhub-content-sdk";

import {
    M01_BROKER_LISTING_URL,
    M01_BROKER_PASSWORD,
    M01_BROKER_USERNAME,
    M01_BUYER_ALIAS,
    M01_CASE_ID,
    M01_CUSTODIAN_CONTENT,
    M01_CUSTODIAN_SUBJECT,
    M01_DEAD_DROP_EMAIL,
    M01_DECOY_DOMAIN,
    M01_DECOY_IP,
    M01_DOMAIN,
    M01_DUMMY_AUTH_LOG_CONTENT,
    M01_DUMMY_CRON_LOG_CONTENT,
    M01_DUMMY_README_CONTENT,
    M01_DUMMY_SYSTEM_LOG_CONTENT,
    M01_DUMMY_TODO_CONTENT,
    M01_HIDDEN_PATH,
    M01_IRC_CONVERSATION,
    M01_IRC_HOST,
    M01_IRC_NOTES_CONTENT,
    M01_IRC_NOTES_FILE_CONTENT,
    M01_IRC_NOTES_FILE_EXTENSION,
    M01_IRC_NOTES_FILE_NAME,
    M01_IRC_PASSWORD,
    M01_JWT_DECODER_SCRIPT_NAME,
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
    M01_SESSION_COOKIE_NAME,
    M01_SESSION_DECODE_CONTENT,
    M01_SESSION_DECODE_SUBJECT,
    M01_SESSION_JWT,
    M01_TARGET_IP,
    M01_TIPSTER_EMAIL,
    M01_TIP_CONTENT,
    M01_TIP_SUBJECT,
} from "../content/m01.original.js";
import { applyDevGating, isQuestDevFocus, questGate } from "../guard/flags.js";

interface M01QuestData {
    readonly tipReviewed: boolean;
    readonly decoyRuledOut: boolean;
    readonly storefrontInvestigated: boolean;
    readonly sessionDecoded: boolean;
    readonly brokerAccessed: boolean;
    readonly suspiciousFileFound: boolean;
    readonly credentialsDecrypted: boolean;
    readonly chatConfirmed: boolean;
    readonly reportSent: boolean;
}

const resetM01ShellFixtures = (): void => {
    Shell.removeCommandData("nslookup", M01_DOMAIN);
    Shell.removeCommandData("nslookup", M01_DECOY_DOMAIN);
    Shell.removeCommandData("nmap", M01_TARGET_IP);
    Shell.removeCommandData("lynx", M01_DOMAIN);
    Shell.removeCommandData("whois", M01_DECOY_DOMAIN);
    Shell.removeCommandData("geoip", M01_DECOY_IP);
    Shell.removeCommandData("ssh", {
        host: M01_TARGET_IP,
        key: M01_BROKER_PASSWORD,
    });
    Shell.removeCommandData("weechat", {
        host: M01_IRC_HOST,
        password: M01_IRC_PASSWORD,
    });
};

const registerM01ShellFixtures = (): void => {
    resetM01ShellFixtures();

    Shell.addCommandData("nslookup", M01_DOMAIN, M01_TARGET_IP);
    Shell.addCommandData("nslookup", M01_DECOY_DOMAIN, M01_DECOY_IP);
    Shell.addCommandData("nmap", M01_TARGET_IP, M01_NMAP_RESULT);
    Shell.addCommandData("lynx", M01_DOMAIN, {
        ips: [M01_TARGET_IP],
        address: [`https://${M01_DOMAIN}/`],
        additional: ["Marketplace advertising illicitly obtained network access."],
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
        { host: M01_TARGET_IP, key: M01_BROKER_PASSWORD },
        { ip: M01_TARGET_IP, status: "OPEN" },
    );
    Shell.addCommandData(
        "weechat",
        { host: M01_IRC_HOST, password: M01_IRC_PASSWORD },
        true,
    );
};

const normalizeBrokerReference = (value: unknown): string =>
    typeof value === "string" ? value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

const sendSessionDecodeMail = (): void => {
    Mail.send({
        from: "jwt-decoder@system.void",
        subject: M01_SESSION_DECODE_SUBJECT,
        content: M01_SESSION_DECODE_CONTENT,
    });
};

@RegisterQuest
export class FlatlineM01Quest extends Quest<M01QuestData> {
    override Name = "flatline.m01";
    override Title = "First Trace";
    override Description = "Trace the initial access broker who sold out the hospital's network.";
    override Group = "storyline" as const;
    override AutoStart = true;
    override AutoComplete = true;
    override QuestsToComplete = questGate("m01", []);
    override Rewards = isQuestDevFocus("m01") ? { money: 0, xp: 0 } : M01_REWARDS;

    override Objectives = applyDevGating(M01_OBJECTIVES, isQuestDevFocus("m01"));

    override CreateData(): M01QuestData {
        return {
            tipReviewed: false,
            decoyRuledOut: false,
            storefrontInvestigated: false,
            sessionDecoded: false,
            brokerAccessed: false,
            suspiciousFileFound: false,
            credentialsDecrypted: false,
            chatConfirmed: false,
            reportSent: false,
        };
    }

    override OnStart() {
        Network.destroyNetwork(M01_TARGET_IP);

        Network.createSubnetNetwork({
            ip: M01_ROUTER_IP,
            type: NetworkDeviceType.Router,
            users: [],
            ports: [],
            children: [
                {
                    ip: M01_TARGET_IP,
                    type: NetworkDeviceType.Device,
                    users: [
                        Network.createUser({
                            username: M01_BROKER_USERNAME,
                            password: M01_BROKER_PASSWORD,
                        }),
                    ],
                    ports: [
                        { external: 22, internal: 22, active: true, service: "ssh" },
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

        Network.registerDomain(M01_DOMAIN, M01_TARGET_IP);
        Network.registerDomain(M01_DECOY_DOMAIN, M01_DECOY_IP);
        Network.registerDomain(M01_LEDGERVAULT_DOMAIN, M01_LEDGERVAULT_IP);

        Http.setCookie(M01_DOMAIN, M01_SESSION_COOKIE_NAME, M01_SESSION_JWT, { httpOnly: false });

        WeeChat.removeServer(M01_IRC_HOST, M01_IRC_PASSWORD);
        WeeChat.createServer(M01_IRC_HOST, M01_IRC_PASSWORD);

        for (const line of M01_IRC_CONVERSATION) {
            WeeChat.sendMessage({
                host: M01_IRC_HOST,
                username: line.username,
                message: line.message,
            });
        }

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
        registerM01ShellFixtures();

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
            this.completeObjective(M01_OBJECTIVE_IDS.reviewTip);
        });

        this.Events.on("Terminal.Geoip", (data) => {
            if (this.Data.decoyRuledOut) return;
            if (data !== M01_DECOY_IP) return;

            this.SetData("decoyRuledOut", true);
            this.completeObjective(M01_OBJECTIVE_IDS.ruleOutDecoy);
        });

        this.Events.on("Browser.Meta", (data) => {
            if (this.Data.storefrontInvestigated) return;
            if (data.protocol !== "https:" || data.hostname !== M01_DOMAIN) return;
            if (data.pathname.replace(/\/$/, "") !== M01_HIDDEN_PATH.replace(/\/$/, "")) return;

            this.SetData("storefrontInvestigated", true);
            this.completeObjective(M01_OBJECTIVE_IDS.investigateStorefront);
        });

        this.Events.on("Python3.ExecFile", (data) => {
            if (this.Data.sessionDecoded) return;
            if (data.file.name !== M01_JWT_DECODER_SCRIPT_NAME) return;
            if (data.args[0] !== M01_SESSION_JWT) return;

            this.SetData("sessionDecoded", true);
            sendSessionDecodeMail();
        });

        this.Events.on("Terminal.SSH.Connected", (data) => {
            if (this.Data.brokerAccessed) return;
            if (data !== M01_TARGET_IP) return;

            this.SetData("brokerAccessed", true);
            this.completeObjective(M01_OBJECTIVE_IDS.accessBroker);
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (this.Data.suspiciousFileFound) return;
            if (data.name !== M01_IRC_NOTES_FILE_NAME || data.data !== M01_IRC_NOTES_FILE_CONTENT) return;

            this.SetData("suspiciousFileFound", true);
            this.completeObjective(M01_OBJECTIVE_IDS.findLedgerEntry);
        });

        this.Events.on("Terminal.Openssl", (data) => {
            if (this.Data.credentialsDecrypted) return;
            if (data.type !== "dec" || data.output !== M01_IRC_NOTES_CONTENT) return;

            this.SetData("credentialsDecrypted", true);
            this.completeObjective(M01_OBJECTIVE_IDS.decryptFindings);
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
        Network.removeDomain(M01_DOMAIN);
        Network.removeDomain(M01_DECOY_DOMAIN);
        Network.removeDomain(M01_LEDGERVAULT_DOMAIN);
        Network.destroyNetwork(M01_ROUTER_IP);
    }

    override OnAbandon() {
        resetM01ShellFixtures();
        Network.removeDomain(M01_DOMAIN);
        Network.removeDomain(M01_DECOY_DOMAIN);
        Network.removeDomain(M01_LEDGERVAULT_DOMAIN);
        Network.destroyNetwork(M01_ROUTER_IP);
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
