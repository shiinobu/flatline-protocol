import {
    Database,
    Events,
    Files,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
    Twotter,
} from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, setBacktraceMission, traceBacktraceFacts } from "../applications/backtrace-state.js";
import { resetMissionNetworks } from "../helpers/network.js";
import {
    M03_ACCESS_TABLE,
    M03_ACCOMPLICE_CODENAME,
    M03_ACCOMPLICE_IP,
    M03_ACCOMPLICE_LAN_IP,
    M03_ACCOMPLICE_PASSWORD,
    M03_ACCOMPLICE_USERNAME,
    M03_ARCHITECT_VPN_LEAD,
    M03_CAPTURE_FILE_CONTENT,
    M03_CAPTURE_FILE_EXTENSION,
    M03_CAPTURE_FILE_NAME,
    M03_COINDRIFT_CODENAME,
    M03_COINDRIFT_IP,
    M03_COINDRIFT_LAN_IP,
    M03_DEAD_DROP_EMAIL,
    M03_DECOY_EMPLOYEE_HANDLE,
    M03_DECOY_EMPLOYEE_NAME,
    M03_DECOY_HOST_CODENAME,
    M03_DECOY_HOST_IP,
    M03_DECOY_HOST_LAN_IP,
    M03_DECOY_HOST_PASSWORD,
    M03_DECOY_HOST_README_CONTENT,
    M03_DECOY_HOST_USERNAME,
    M03_FINANCE_EMPLOYEE_HANDLE,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
    M03_HELPDESK_RESET_NOTE,
    M03_LEAK_PATTERN,
    M03_LEDGER_AMOUNT,
    M03_LEDGER_DOMAIN,
    M03_LEDGER_TABLE,
    M03_LEGACY_PFSENSE_IP,
    M03_LOG_ENTRIES,
    M03_MX_HOST,
    M03_OBJECTIVES,
    M03_OBJECTIVE_IDS,
    M03_PARENT_ENTITY_NAME,
    M03_PAYROLL_GEOIP,
    M03_PAYROLL_SAAS_IP,
    M03_PAYROLL_SAAS_NAME,
    M03_PFSENSE_IP,
    M03_PFSENSE_LAN_IP,
    M03_PFSENSE_NMAP_RESULT,
    M03_PFSENSE_PASSWORD,
    M03_PFSENSE_USERNAME,
    M03_REMOTE_PORTAL_DOMAIN,
    M03_REPORT_BODY,
    M03_REPORT_SUBJECT,
    M03_REPORT_TEMPLATE_CONTENT,
    M03_REPORT_TEMPLATE_ID,
    M03_REPORT_TEMPLATE_LABEL,
    M03_REWARDS,
    M03_REYES_NOTE_CONTENT,
    M03_REYES_NOTE_FILE_EXTENSION,
    M03_REYES_NOTE_FILE_NAME,
    M03_SKYNET_DOMAIN,
    M03_SKYNET_IP,
    M03_SKYNET_NMAP_RESULT,
    M03_SPLITTER_IP,
    M03_SPLITTER_LAN_IP,
    M03_SPREADSHEET_CONTENT,
    M03_SPREADSHEET_FILE_EXTENSION,
    M03_SPREADSHEET_FILE_NAME,
    M03_TIP_CONTENT,
    M03_TIP_SUBJECT,
    M03_TWOTTER_BIO,
    M03_TWOTTER_FIRST_NAME,
    M03_TWOTTER_HANDLE,
    M03_TWOTTER_LAST_NAME,
    M03_TWOTTER_POSTS,
    M03_VPN_GEOIP,
} from "../content/m03.js";
import { M02_SHELL_COMPANY_NAME } from "../content/m02.js";
import { M01_CASE_ID } from "../content/m01.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

const M03_CAPTURE_EXPORT_EVENT = "flatline.m03.captureExport";

Events.on(M03_CAPTURE_EXPORT_EVENT, async () => {
    const home = Files.getHomePath();
    const path = `${home}/${M03_CAPTURE_FILE_NAME}.${M03_CAPTURE_FILE_EXTENSION}`;
    if (await Files.exists(path)) return;

    await Files.create({
        name: M03_CAPTURE_FILE_NAME,
        extension: M03_CAPTURE_FILE_EXTENSION,
        data: M03_CAPTURE_FILE_CONTENT,
        parentPath: home,
    });
});

interface M03QuestData {
    readonly pfsenseLoggedIn: boolean;
    readonly natPivotDone: boolean;
    readonly arpSpoofDone: boolean;
    readonly internalTrafficCaptured: boolean;
    readonly ledgerDumped: boolean;
    readonly reyesShareSeen: boolean;
    readonly natReverted: boolean;
    readonly reportSent: boolean;
    readonly pfsenseChangeCount: number;
}

const resetM03ShellFixtures = (): void => {
    Shell.removeCommandData("nmap", M03_SKYNET_IP);
    Shell.removeCommandData("nmap", M03_PFSENSE_IP);
    Shell.removeCommandData("nslookup", M03_REMOTE_PORTAL_DOMAIN);
    Shell.removeCommandData("lynx", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE);
    Shell.removeCommandData("lynx", M03_DECOY_EMPLOYEE_HANDLE);
    Shell.removeCommandData("mxlookup", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("hydra", { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP });
    Shell.removeCommandData("hydra", { user: M03_PFSENSE_USERNAME, target: `${M03_PFSENSE_IP}:80` });
    Shell.removeCommandData("geoip", M03_PAYROLL_SAAS_IP);
    Shell.removeCommandData("geoip", M03_ARCHITECT_VPN_LEAD);
    Shell.removeCommandData("whois", M03_PAYROLL_SAAS_IP);
    Shell.removeCommandData("whois", M03_ARCHITECT_VPN_LEAD);
};

const registerM03ShellFixtures = (): void => {
    resetM03ShellFixtures();

    Shell.addCommandData("nmap", M03_SKYNET_IP, M03_SKYNET_NMAP_RESULT);
    Shell.addCommandData("nmap", M03_PFSENSE_IP, M03_PFSENSE_NMAP_RESULT);
    Shell.addCommandData("nslookup", M03_REMOTE_PORTAL_DOMAIN, M03_PFSENSE_IP);
    Shell.addCommandData("lynx", M03_SKYNET_DOMAIN, {
        ips: [M03_SKYNET_IP],
        address: [`https://${M03_SKYNET_DOMAIN}/`],
        additional: [
            "Import-export logistics firm. Generic corporate front.",
            `Staff directory lists a finance analyst active online: ${M03_FINANCE_EMPLOYEE_HANDLE} (${M03_TWOTTER_FIRST_NAME} ${M03_TWOTTER_LAST_NAME}).`,
            `Also listed: ${M03_DECOY_EMPLOYEE_HANDLE} (${M03_DECOY_EMPLOYEE_NAME}), operations.`,
            `Staff remote-access portal: ${M03_REMOTE_PORTAL_DOMAIN}.`,
        ],
    });
    Shell.addCommandData("mxlookup", M03_SKYNET_DOMAIN, M03_MX_HOST);
    Shell.addCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE, {
        socialMedia: [M03_FINANCE_EMPLOYEE_HANDLE],
        additional: [
            "Finance analyst. Posts constantly, mostly about work she shouldn't.",
            `Complained publicly about being forced to reuse the company's standard password format across every internal tool: ${M03_LEAK_PATTERN}.`,
            "Also mentions reusing her family's names on personal shares. Careless in two directions at once.",
        ],
    });
    Shell.addCommandData("lynx", M03_DECOY_EMPLOYEE_HANDLE, {
        socialMedia: [M03_DECOY_EMPLOYEE_HANDLE],
        additional: [
            "Operations. Two posts in three years, both about a delayed shipment.",
            "No password talk, no internal-tool talk, nothing to work with.",
        ],
    });
    Shell.addCommandData(
        "hydra",
        { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP },
        { credentials: { username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD } },
    );
    Shell.addCommandData(
        "hydra",
        { user: M03_PFSENSE_USERNAME, target: `${M03_PFSENSE_IP}:80` },
        { credentials: { username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD } },
    );
    Shell.addCommandData("geoip", M03_PAYROLL_SAAS_IP, M03_PAYROLL_GEOIP);
    Shell.addCommandData("geoip", M03_ARCHITECT_VPN_LEAD, M03_VPN_GEOIP);
    Shell.addCommandData("whois", M03_PAYROLL_SAAS_IP, {
        ip: M03_PAYROLL_SAAS_IP,
        contact: M03_PAYROLL_SAAS_NAME,
        status: true,
    });
    Shell.addCommandData("whois", M03_ARCHITECT_VPN_LEAD, {
        ip: M03_ARCHITECT_VPN_LEAD,
        contact: "Bulletproof VPN Ltd.",
        status: true,
    });
};

const registerM03Database = (): string => {
    const existing = Database.getByHost(M03_COINDRIFT_IP);
    const databaseId =
        existing?.id ??
        Database.create({
            host: M03_COINDRIFT_IP,
            user: M03_FINANCE_USERNAME,
            password: M03_FINANCE_PASSWORD,
            tables: {},
        });

    Database.setTable(databaseId, M03_LEDGER_TABLE, [
        {
            id: { value: 1, type: "number" },
            beneficiary: { value: M02_SHELL_COMPANY_NAME, type: "string" },
            parentEntity: { value: M03_PARENT_ENTITY_NAME, type: "string" },
            amount: { value: M03_LEDGER_AMOUNT, type: "number" },
            memo: { value: `ref ${M01_CASE_ID}`, type: "string" },
        },
    ]);

    Database.setTable(databaseId, M03_ACCESS_TABLE, [
        {
            id: { value: 1, type: "number" },
            account: { value: M03_ACCOMPLICE_USERNAME, type: "string" },
            resetTo: { value: M03_ACCOMPLICE_PASSWORD, type: "string" },
            note: { value: M03_HELPDESK_RESET_NOTE, type: "string" },
        },
    ]);

    return databaseId;
};

const registerM03FinanceVlan = (): void => {
    resetMissionNetworks([M03_PFSENSE_IP, M03_LEGACY_PFSENSE_IP]);

    Network.createSubnetNetwork({
        ip: M03_PFSENSE_IP,
        lanIp: M03_PFSENSE_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [
            Network.createUser({
                username: M03_PFSENSE_USERNAME,
                password: M03_PFSENSE_PASSWORD,
            }),
        ],
        ports: [{ external: 80, internal: 80, active: true, service: "http" }],
        children: [
            {
                ip: M03_SPLITTER_IP,
                lanIp: M03_SPLITTER_LAN_IP,
                type: NetworkDeviceType.Splitter,
                users: [],
                children: [
                    {
                        ip: M03_COINDRIFT_IP,
                        lanIp: M03_COINDRIFT_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_COINDRIFT_CODENAME,
                        domain: {
                            name: M03_LEDGER_DOMAIN,
                            vulnerabilities: [{ type: "SQL_INJECTION" }],
                        },
                        users: [
                            Network.createUser({
                                username: M03_FINANCE_USERNAME,
                                password: M03_FINANCE_PASSWORD,
                            }),
                        ],
                        ports: [
                            { external: 445, internal: 445, active: true, service: "smb" },
                            { external: 3306, internal: 3306, active: true, service: "mysql", version: "mariadb" },
                        ],
                    },
                    {
                        ip: M03_ACCOMPLICE_IP,
                        lanIp: M03_ACCOMPLICE_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_ACCOMPLICE_CODENAME,
                        users: [
                            Network.createUser({
                                username: M03_ACCOMPLICE_USERNAME,
                                password: M03_ACCOMPLICE_PASSWORD,
                                files: [
                                    {
                                        name: M03_SPREADSHEET_FILE_NAME,
                                        extension: M03_SPREADSHEET_FILE_EXTENSION,
                                        data: M03_SPREADSHEET_CONTENT,
                                    },
                                    {
                                        name: M03_REYES_NOTE_FILE_NAME,
                                        extension: M03_REYES_NOTE_FILE_EXTENSION,
                                        data: M03_REYES_NOTE_CONTENT,
                                    },
                                ],
                            }),
                        ],
                        ports: [{ external: 445, internal: 445, active: true, service: "smb" }],
                    },
                    {
                        ip: M03_DECOY_HOST_IP,
                        lanIp: M03_DECOY_HOST_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_DECOY_HOST_CODENAME,
                        users: [
                            Network.createUser({
                                username: M03_DECOY_HOST_USERNAME,
                                password: M03_DECOY_HOST_PASSWORD,
                                files: [
                                    {
                                        name: "readme",
                                        extension: "txt",
                                        data: M03_DECOY_HOST_README_CONTENT,
                                    },
                                ],
                            }),
                        ],
                        ports: [{ external: 445, internal: 445, active: true, service: "smb" }],
                    },
                ],
            },
        ],
    });

    Network.removePort(M03_COINDRIFT_IP, 3306);
    Network.addPort(M03_COINDRIFT_IP, {
        external: 3306,
        internal: 3306,
        active: true,
        service: "mysql",
        version: "mariadb",
    });
    Network.setVulnerabilities(M03_COINDRIFT_IP, [{ type: "SQL_INJECTION" }]);
};

const M03_TWOTTER_TWEET_PREFIX = "m03-reyes-tweet-";

const registerM03TwotterPersona = (): void => {
    const reyes =
        Twotter.getUserByUsername(M03_TWOTTER_HANDLE) ??
        Twotter.createUser({
            username: M03_TWOTTER_HANDLE,
            firstName: M03_TWOTTER_FIRST_NAME,
            lastName: M03_TWOTTER_LAST_NAME,
            bio: M03_TWOTTER_BIO,
            gender: "female",
        });
    if (!Twotter.getUserByUsername(M03_TWOTTER_HANDLE)) {
        Twotter.addUser(reyes);
    }
    Twotter.updateUser(reyes.id, {
        name: M03_TWOTTER_FIRST_NAME,
        surname: M03_TWOTTER_LAST_NAME,
        bio: M03_TWOTTER_BIO,
    });
    M03_TWOTTER_POSTS.forEach((post, index) => {
        const id = `${M03_TWOTTER_TWEET_PREFIX}${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({
            id,
            userId: reyes.id,
            content: post.content,
            interaction: post.interaction,
        });
    });
};

@RegisterQuest
export class FlatlineM03Quest extends Quest<M03QuestData> {
    override Name = "flatline.m03";
    override Title = "Money Trail";
    override Description = "Follow the ransom payouts through the shell company to their parent entity.";
    override Group = "storyline" as const;
    override AutoStart = true;
    override AutoComplete = true;
    override QuestsToComplete = questGate("m03", ["flatline.m02"]);
    override Rewards = (isQuestDevFocus("m03") || isQuestTesterFocus("m03")) ? { money: 0, xp: 0 } : M03_REWARDS;

    override Objectives = applyDevGating(M03_OBJECTIVES, isQuestDevFocus("m03"));

    private databaseId = "";

    override CreateData(): M03QuestData {
        return {
            pfsenseLoggedIn: false,
            natPivotDone: false,
            arpSpoofDone: false,
            internalTrafficCaptured: false,
            ledgerDumped: false,
            reyesShareSeen: false,
            natReverted: false,
            reportSent: false,
            pfsenseChangeCount: 0,
        };
    }

    override OnStart() {
        setBacktraceMission("m3", "progress");
        Mail.send({
            from: M03_DEAD_DROP_EMAIL,
            subject: M03_TIP_SUBJECT,
            content: M03_TIP_CONTENT,
        });
    }

    override OnObjectivesStart() {
        Network.createSubnetNetwork({
            ip: M03_SKYNET_IP,
            type: NetworkDeviceType.Router,
            users: [],
            ports: [
                { external: 80, internal: 80, active: false, service: "http" },
                { external: 443, internal: 443, active: true, service: "https" },
            ],
            children: [],
        });

        registerM03FinanceVlan();

        Network.registerDomain(M03_SKYNET_DOMAIN, M03_SKYNET_IP);
        Network.registerDomain(M03_REMOTE_PORTAL_DOMAIN, M03_PFSENSE_IP);

        registerM03ShellFixtures();
        registerM03TwotterPersona();
        this.databaseId = registerM03Database();

        Mail.registerTemplate({
            id: M03_REPORT_TEMPLATE_ID,
            label: M03_REPORT_TEMPLATE_LABEL,
            title: M03_REPORT_SUBJECT,
            content: M03_REPORT_TEMPLATE_CONTENT,
            fields: ["shellCompany", "parentEntity", "vpnLead"],
        });

        this.Events.on("PFSense.Login", (data) => {
            if (data.ip !== M03_PFSENSE_IP) return;
            this.SetData("pfsenseLoggedIn", true);
        });

        this.Events.on("PFSense.Changes", () => {
            if (!this.Data.pfsenseLoggedIn) return;

            const count = this.Data.pfsenseChangeCount + 1;
            this.SetData("pfsenseChangeCount", count);

            if (count === 1 && !this.Data.natPivotDone) {
                this.SetData("natPivotDone", true);
                this.completeObjective(M03_OBJECTIVE_IDS.investigateShellCompany);
                return;
            }

            if (this.Data.natReverted) return;
            if (!this.Data.ledgerDumped || !this.Data.internalTrafficCaptured) return;

            this.SetData("natReverted", true);
        });

        this.Events.on("Bettercap.Open", () => {
            if (this.Data.arpSpoofDone || !this.Data.natPivotDone) return;
            this.SetData("arpSpoofDone", true);
        });

        this.Events.on("Bettercap.NetProbe", (active) => {
            if (this.Data.arpSpoofDone || !this.Data.natPivotDone) return;
            if (active !== true) return;
            this.SetData("arpSpoofDone", true);
        });

        this.Events.on("Wireshark.Started", () => {
            if (this.Data.internalTrafficCaptured) return;
            if (!this.Data.natPivotDone || !this.Data.arpSpoofDone) return;

            this.SetData("internalTrafficCaptured", true);
            Events.emit(M03_CAPTURE_EXPORT_EVENT);
            traceBacktraceFacts("m3", ["architectVpn"]);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.capture);
            this.tryCompleteTrace();
        });

        this.Events.on("Sqlmap.DumpTable", (data) => {
            if (this.Data.ledgerDumped) return;
            if (data.host !== M03_COINDRIFT_IP && data.host !== M03_LEDGER_DOMAIN) return;
            if (data.tableName !== M03_LEDGER_TABLE) return;

            this.SetData("ledgerDumped", true);
            traceBacktraceFacts("m3", ["shellCompany", "parentEntity", "amount", "caseId"]);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.default);
            this.tryCompleteTrace();
        });

        this.Events.on("Terminal.Explorer", (data) => {
            if (this.Data.reyesShareSeen) return;
            if (data.ip !== M03_ACCOMPLICE_IP && data.ip !== M03_ACCOMPLICE_LAN_IP) return;

            this.SetData("reyesShareSeen", true);
            traceBacktraceFacts("m3", ["caseId"]);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.reyes);
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (data.to !== M03_DEAD_DROP_EMAIL) return;
            if (!this.Data.internalTrafficCaptured || !this.Data.ledgerDumped || !this.Data.natReverted) return;
            if (!this.isReport(data.subject, data.content)) return;

            this.SetData("reportSent", true);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.aftermath);
            this.completeObjective(M03_OBJECTIVE_IDS.reportToDeadDrop);
        });
    }

    override OnComplete() {
        setBacktraceMission("m3", "complete");
        this.teardown();
    }

    override OnAbandon() {
        setBacktraceMission("m3", "locked");
        this.teardown();
    }

    private tryCompleteTrace(): void {
        if (!this.Data.ledgerDumped || !this.Data.internalTrafficCaptured) return;
        this.completeObjective(M03_OBJECTIVE_IDS.traceTheMoney);
    }

    private teardown(): void {
        resetM03ShellFixtures();
        Network.removeDomain(M03_SKYNET_DOMAIN);
        Network.removeDomain(M03_REMOTE_PORTAL_DOMAIN);
        Network.removeDomain(M03_LEDGER_DOMAIN);
        Network.destroyNetwork(M03_SKYNET_IP);
        Network.destroyNetwork(M03_PFSENSE_IP);
        if (this.databaseId) Database.remove(this.databaseId);
    }

    private isReport(subject: string, content: string): boolean {
        if (this.isTemplateReport(subject, content)) {
            return true;
        }

        const normalizedSubject = subject.trim().toLowerCase();
        const normalizedContent = content.trim();

        return (
            normalizedSubject === M03_REPORT_SUBJECT.toLowerCase() &&
            normalizedContent === M03_REPORT_BODY
        );
    }

    private isTemplateReport(subject: string, content: string): boolean {
        if (subject !== M03_REPORT_TEMPLATE_ID) return false;

        let fields: unknown;
        try {
            fields = JSON.parse(content);
        } catch {
            return false;
        }

        if (!fields || typeof fields !== "object") return false;

        const { shellCompany, parentEntity, vpnLead } = fields as Record<string, unknown>;
        return (
            shellCompany === M02_SHELL_COMPANY_NAME &&
            parentEntity === M03_PARENT_ENTITY_NAME &&
            vpnLead === M03_ARCHITECT_VPN_LEAD
        );
    }
}
