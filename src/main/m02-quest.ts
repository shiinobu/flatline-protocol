import {
    Database,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
} from "@hotbunny/hackhub-content-sdk";

import {
    M02_ADMINS_TABLE,
    M02_ADMIN_HASH,
    M02_ADMIN_PASSWORD,
    M02_ADMIN_USERNAME,
    M02_AFFILIATE_TABLE,
    M02_DB_PASSWORD,
    M02_DB_USER,
    M02_DEAD_DROP_EMAIL,
    M02_DEPLOY_LOG_CONTENT,
    M02_DEPLOY_LOG_DIALOG,
    M02_DEPLOY_LOG_FILE_EXTENSION,
    M02_DEPLOY_LOG_FILE_NAME,
    M02_DEV_IP,
    M02_DEV_NMAP_RESULT,
    M02_DEV_ROUTER_IP,
    M02_DEV_SUBDOMAIN,
    M02_FINANCIAL_DOC_CONTENT,
    M02_FINANCIAL_DOC_FILE_EXTENSION,
    M02_FINANCIAL_DOC_FILE_NAME,
    M02_OBJECTIVES,
    M02_OBJECTIVE_IDS,
    M02_REPORT_BODY,
    M02_REPORT_SUBJECT,
    M02_REPORT_TEMPLATE_CONTENT,
    M02_REPORT_TEMPLATE_ID,
    M02_REPORT_TEMPLATE_LABEL,
    M02_REWARDS,
    M02_ROOT_DOMAIN,
    M02_ROOT_IP,
    M02_ROOT_NMAP_RESULT,
    M02_TIP_CONTENT,
    M02_TIP_SUBJECT,
    M02_SHELL_COMPANY_NAME,
    M02_WORKSTATION_CODENAME,
    M02_WORKSTATION_IP,
    M02_WORKSTATION_LAN_IP,
    M02_WORKSTATION_WIFI_IP,
    M02_WORKSTATION_WIFI_PASSWORD,
    M02_WORKSTATION_WIFI_SSID,
} from "../content/m02.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

interface M02QuestData {
    readonly leadReviewed: boolean;
    readonly rootWhoisDone: boolean;
    readonly adminDecoyFound: boolean;
    readonly devSubdomainFound: boolean;
    readonly devServerScanned: boolean;
    readonly reconRootDomainCompleted: boolean;
    readonly panelDumped: boolean;
    readonly adminHashCracked: boolean;
    readonly affiliatePanelBreached: boolean;
    readonly devServerAccessed: boolean;
    readonly deployLogFound: boolean;
    readonly devServerObjectiveCompleted: boolean;
    readonly wifiPasswordFound: boolean;
    readonly wifiJoined: boolean;
    readonly workstationWifiBreached: boolean;
    readonly workstationRooted: boolean;
    readonly financialDocDownloaded: boolean;
    readonly reportSent: boolean;
}

const resetM02ShellFixtures = (): void => {
    Shell.removeCommandData("whois", M02_ROOT_DOMAIN);
    Shell.removeCommandData("nmap", M02_ROOT_IP);
    Shell.removeCommandData("nmap", M02_DEV_IP);
    Shell.removeCommandData("ssh", { host: M02_DEV_IP, key: M02_ADMIN_PASSWORD });
};

const registerM02ShellFixtures = (): void => {
    resetM02ShellFixtures();

    Shell.addCommandData("whois", M02_ROOT_DOMAIN, {
        domain: M02_ROOT_DOMAIN,
        contact: "Registrar Privacy Service",
        status: true,
    });
    Shell.addCommandData("nmap", M02_ROOT_IP, M02_ROOT_NMAP_RESULT);
    Shell.addCommandData("nmap", M02_DEV_IP, M02_DEV_NMAP_RESULT);
    Shell.addCommandData(
        "ssh",
        { host: M02_DEV_IP, key: M02_ADMIN_PASSWORD },
        { ip: M02_DEV_IP, status: "OPEN" },
    );
};

const registerM02Database = (): string => {
    const existing = Database.getByHost(M02_DEV_IP);
    const databaseId =
        existing?.id ??
        Database.create({
            host: M02_DEV_IP,
            user: M02_DB_USER,
            password: M02_DB_PASSWORD,
            tables: {},
        });

    Database.setTable(databaseId, M02_AFFILIATE_TABLE, [
        {
            id: { value: 1, type: "number" },
            client: { value: "MED-SEA-0417", type: "string" },
            ransomAmount: { value: 2850000, type: "number" },
            settledAt: { value: "2026-08-14", type: "string" },
        },
    ]);
    Database.setTable(databaseId, M02_ADMINS_TABLE, [
        {
            id: { value: 1, type: "number" },
            username: { value: M02_ADMIN_USERNAME, type: "string" },
            passwordHash: { value: M02_ADMIN_HASH, type: "string" },
        },
    ]);

    return databaseId;
};

const registerM02WorkstationWifi = (): void => {
    Network.destroyNetwork(M02_WORKSTATION_WIFI_IP);

    Network.createWifiNetwork({
        ssid: M02_WORKSTATION_WIFI_SSID,
        password: M02_WORKSTATION_WIFI_PASSWORD,
        ip: M02_WORKSTATION_WIFI_IP,
        children: [
            {
                ip: M02_WORKSTATION_IP,
                lanIp: M02_WORKSTATION_LAN_IP,
                type: NetworkDeviceType.Device,
                name: M02_WORKSTATION_CODENAME,
                users: [Network.createUser({ username: "tr4c3404", online: true })],
                ports: [
                    {
                        external: 3389,
                        internal: 3389,
                        active: true,
                        service: "rdp",
                        version: "FreeRDP 1.0.0",
                    },
                ],
                rootFiles: [
                    {
                        name: M02_FINANCIAL_DOC_FILE_NAME,
                        extension: M02_FINANCIAL_DOC_FILE_EXTENSION,
                        data: M02_FINANCIAL_DOC_CONTENT,
                    },
                ],
            },
        ],
    });

    Network.removePort(M02_WORKSTATION_IP, 3389);
    Network.addPort(M02_WORKSTATION_IP, {
        external: 3389,
        internal: 3389,
        active: true,
        service: "rdp",
        version: "FreeRDP 1.0.0",
    });
    Network.setVulnerabilities(M02_WORKSTATION_IP, [{ type: "RCE", version: "FreeRDP 1.0.0" }]);
};

@RegisterQuest
export class FlatlineM02Quest extends Quest<M02QuestData> {
    override Name = "flatline.m02";
    override Title = "The Maker";
    override Description = "Trace the ransomware toolkit developer behind the affiliate panel.";
    override Group = "storyline" as const;
    override AutoStart = true;
    override AutoComplete = true;
    override QuestsToComplete = questGate("m02", ["flatline.m01"]);
    override Rewards = (isQuestDevFocus("m02") || isQuestTesterFocus("m02")) ? { money: 0, xp: 0 } : M02_REWARDS;
    override Dialog = M02_DEPLOY_LOG_DIALOG;

    override Objectives = applyDevGating(M02_OBJECTIVES, isQuestDevFocus("m02"));

    private databaseId = "";

    override CreateData(): M02QuestData {
        return {
            leadReviewed: false,
            rootWhoisDone: false,
            adminDecoyFound: false,
            devSubdomainFound: false,
            devServerScanned: false,
            reconRootDomainCompleted: false,
            panelDumped: false,
            adminHashCracked: false,
            affiliatePanelBreached: false,
            devServerAccessed: false,
            deployLogFound: false,
            devServerObjectiveCompleted: false,
            wifiPasswordFound: false,
            wifiJoined: false,
            workstationWifiBreached: false,
            workstationRooted: false,
            financialDocDownloaded: false,
            reportSent: false,
        };
    }

    override OnStart() {
        Mail.send({
            from: M02_DEAD_DROP_EMAIL,
            subject: M02_TIP_SUBJECT,
            content: M02_TIP_CONTENT,
        });
    }

    override OnObjectivesStart() {
        Network.createSubnetNetwork({
            ip: M02_ROOT_IP,
            type: NetworkDeviceType.Router,
            users: [],
            ports: [
                { external: 80, internal: 80, active: false, service: "http" },
                { external: 443, internal: 443, active: true, service: "https" },
            ],
            children: [],
        });

        Network.createSubnetNetwork({
            ip: M02_DEV_ROUTER_IP,
            type: NetworkDeviceType.Router,
            users: [],
            ports: [],
            children: [
                {
                    ip: M02_DEV_IP,
                    type: NetworkDeviceType.Device,
                    domain: {
                        name: M02_DEV_SUBDOMAIN,
                        vulnerabilities: [{ type: "SQL_INJECTION" }],
                    },
                    users: [
                        Network.createUser({
                            username: M02_ADMIN_USERNAME,
                            password: M02_ADMIN_PASSWORD,
                        }),
                    ],
                    ports: [
                        { external: 22, internal: 22, active: true, service: "ssh" },
                        { external: 443, internal: 443, active: true, service: "https" },
                        { external: 3306, internal: 3306, active: true, service: "mysql", version: "mariadb" },
                    ],
                    rootFiles: [
                        {
                            name: M02_DEPLOY_LOG_FILE_NAME,
                            extension: M02_DEPLOY_LOG_FILE_EXTENSION,
                            data: M02_DEPLOY_LOG_CONTENT,
                        },
                    ],
                },
            ],
        });

        Network.removePort(M02_DEV_IP, 3306);
        Network.addPort(M02_DEV_IP, {
            external: 3306,
            internal: 3306,
            active: true,
            service: "mysql",
            version: "mariadb",
        });
        Network.setVulnerabilities(M02_DEV_IP, [{ type: "SQL_INJECTION" }]);

        registerM02WorkstationWifi();

        Network.registerDomain(M02_ROOT_DOMAIN, M02_ROOT_IP);

        registerM02ShellFixtures();
        this.databaseId = registerM02Database();

        Mail.registerTemplate({
            id: M02_REPORT_TEMPLATE_ID,
            label: M02_REPORT_TEMPLATE_LABEL,
            title: M02_REPORT_SUBJECT,
            content: M02_REPORT_TEMPLATE_CONTENT,
            fields: ["developer", "shellCompany"],
        });

        this.Events.on("Mail.Read", (data) => {
            if (this.Data.leadReviewed) return;
            if (data.from !== M02_DEAD_DROP_EMAIL || data.subject !== M02_TIP_SUBJECT) return;

            this.SetData("leadReviewed", true);
            this.completeObjective(M02_OBJECTIVE_IDS.reviewLead);
        });

        this.Events.on("Terminal.Whois", (data) => {
            if (this.Data.rootWhoisDone) return;
            if (data.domain !== M02_ROOT_DOMAIN) return;

            this.SetData("rootWhoisDone", true);
            this.tryCompleteReconRootDomain();
        });

        this.Events.on("Terminal.Dirhunter", (data) => {
            if (this.Data.adminDecoyFound) return;

            const host = data.host.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
            if (host !== M02_ROOT_DOMAIN) return;

            this.SetData("adminDecoyFound", true);
            this.tryCompleteReconRootDomain();
        });

        this.Events.on("Subfinder.Results", (data) => {
            if (this.Data.devSubdomainFound) return;
            if (data.domain !== M02_ROOT_DOMAIN) return;
            if (!data.subdomains.some((subdomain) => subdomain.name === M02_DEV_SUBDOMAIN)) return;

            this.SetData("devSubdomainFound", true);
            this.tryCompleteReconRootDomain();
        });

        this.Events.on("Terminal.NmapScan", (data) => {
            if (this.Data.devServerScanned) return;
            if (data.ip !== M02_DEV_IP || !data.versionScan) return;

            this.SetData("devServerScanned", true);
            this.tryCompleteReconRootDomain();
        });

        this.Events.on("Sqlmap.DumpTable", (data) => {
            if (this.Data.panelDumped) return;
            if (data.host !== M02_DEV_IP || data.tableName !== M02_ADMINS_TABLE) return;

            this.SetData("panelDumped", true);
            this.tryCompleteBreachAffiliatePanel();
        });

        this.Events.on("John.DecryptHash", (data) => {
            if (this.Data.adminHashCracked) return;
            if (data.hash !== M02_ADMIN_HASH) return;

            this.SetData("adminHashCracked", true);
            this.tryCompleteBreachAffiliatePanel();
        });

        this.Events.on("Terminal.SSH.Connected", (data) => {
            if (this.Data.devServerAccessed) return;
            if (data !== M02_DEV_IP) return;

            this.SetData("devServerAccessed", true);
            this.tryCompleteAccessDevServer();
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (this.Data.deployLogFound) return;
            if (data.name !== M02_DEPLOY_LOG_FILE_NAME || data.data !== M02_DEPLOY_LOG_CONTENT) return;

            this.SetData("deployLogFound", true);
            this.createDialog("default");
            this.tryCompleteAccessDevServer();
        });

        this.Events.on("Fern.FindPassword", (data) => {
            if (this.Data.wifiPasswordFound) return;
            if (data.subnet.ip !== M02_WORKSTATION_WIFI_IP) return;

            this.SetData("wifiPasswordFound", true);
            this.tryCompleteBreachWorkstationWifi();
        });

        this.Events.on("Network.WifiConnected", (data) => {
            if (this.Data.wifiJoined) return;
            if (data.ip !== M02_WORKSTATION_WIFI_IP) return;

            this.SetData("wifiJoined", true);
            this.tryCompleteBreachWorkstationWifi();
        });

        this.Events.on("Metasploit.Rootgrab", (data) => {
            if (this.Data.workstationRooted) return;
            if (data.ip !== M02_WORKSTATION_IP) return;

            this.SetData("workstationRooted", true);
            this.completeObjective(M02_OBJECTIVE_IDS.rootgrabWorkstation);
        });

        this.Events.on("Meterpreter.Download", (data) => {
            if (this.Data.financialDocDownloaded) return;
            if (data.host !== M02_WORKSTATION_IP || data.file.name !== M02_FINANCIAL_DOC_FILE_NAME) return;

            this.SetData("financialDocDownloaded", true);
            this.completeObjective(M02_OBJECTIVE_IDS.downloadFinancialDoc);
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (!this.isReport(data.subject, data.content)) return;
            if (data.to !== M02_DEAD_DROP_EMAIL) return;

            this.SetData("reportSent", true);
            this.completeObjective(M02_OBJECTIVE_IDS.reportFindings);
        });
    }

    private tryCompleteReconRootDomain(): void {
        if (this.Data.reconRootDomainCompleted) return;
        if (
            !this.Data.rootWhoisDone ||
            !this.Data.adminDecoyFound ||
            !this.Data.devSubdomainFound ||
            !this.Data.devServerScanned
        ) {
            return;
        }

        this.SetData("reconRootDomainCompleted", true);
        this.completeObjective(M02_OBJECTIVE_IDS.reconRootDomain);
    }

    private tryCompleteBreachAffiliatePanel(): void {
        if (this.Data.affiliatePanelBreached) return;
        if (!this.Data.panelDumped || !this.Data.adminHashCracked) return;

        this.SetData("affiliatePanelBreached", true);
        this.completeObjective(M02_OBJECTIVE_IDS.breachAffiliatePanel);
    }

    private tryCompleteAccessDevServer(): void {
        if (this.Data.devServerObjectiveCompleted) return;
        if (!this.Data.devServerAccessed || !this.Data.deployLogFound) return;

        this.SetData("devServerObjectiveCompleted", true);
        this.completeObjective(M02_OBJECTIVE_IDS.accessDevServer);
    }

    private tryCompleteBreachWorkstationWifi(): void {
        if (this.Data.workstationWifiBreached) return;
        if (!this.Data.wifiPasswordFound || !this.Data.wifiJoined) return;

        this.SetData("workstationWifiBreached", true);
        this.completeObjective(M02_OBJECTIVE_IDS.breachWorkstationWifi);
    }

    override OnComplete() {
        this.teardown();
    }

    override OnAbandon() {
        this.teardown();
    }

    private teardown(): void {
        resetM02ShellFixtures();
        Network.removeDomain(M02_ROOT_DOMAIN);
        Network.removeDomain(M02_DEV_SUBDOMAIN);
        Network.destroyNetwork(M02_ROOT_IP);
        Network.destroyNetwork(M02_DEV_ROUTER_IP);
        Network.destroyNetwork(M02_WORKSTATION_WIFI_IP);
        if (this.databaseId) Database.remove(this.databaseId);
    }

    private isReport(subject: string, content: string): boolean {
        if (this.isTemplateReport(subject, content)) {
            return true;
        }

        const normalizedSubject = subject.trim().toLowerCase();
        const normalizedContent = content.trim();

        return (
            normalizedSubject === M02_REPORT_SUBJECT.toLowerCase() &&
            normalizedContent === M02_REPORT_BODY
        );
    }

    private isTemplateReport(subject: string, content: string): boolean {
        if (subject !== M02_REPORT_TEMPLATE_ID) return false;

        let fields: unknown;
        try {
            fields = JSON.parse(content);
        } catch {
            return false;
        }

        if (!fields || typeof fields !== "object") return false;

        const { developer, shellCompany } = fields as Record<string, unknown>;
        return developer === M02_DEV_SUBDOMAIN && shellCompany === M02_SHELL_COMPANY_NAME;
    }
}
