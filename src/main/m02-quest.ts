import {
    Database,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
} from "@hotbunny/hackhub-content-sdk";

import { M01_CASE_ID } from "../content/m01.js";
import type { M02EmptySubdomain } from "../content/m02.js";
import {
    M02_ADMINS_TABLE,
    M02_ADMIN_HASH,
    M02_ADMIN_PASSWORD,
    M02_ADMIN_USERNAME,
    M02_AFFILIATE_ENDPOINTS_CONTENT,
    M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION,
    M02_AFFILIATE_ENDPOINTS_FILE_NAME,
    M02_AFFILIATE_TABLE,
    M02_CAMERA_CODENAME,
    M02_CAMERA_IP,
    M02_CAMERA_LAN_IP,
    M02_CASE_MATCH_RANSOM_AMOUNT,
    M02_CASE_MATCH_SETTLED_AT,
    M02_CLOSER_RIG_CODENAME,
    M02_CLOSER_RIG_IP,
    M02_CLOSER_RIG_ROUTER_IP,
    M02_DB_PASSWORD,
    M02_DB_USER,
    M02_DEAD_DROP_EMAIL,
    M02_DECOY_SUBDOMAIN_1,
    M02_DECOY_SUBDOMAIN_1_IP,
    M02_DECOY_SUBDOMAIN_1_README_CONTENT,
    M02_DECOY_SUBDOMAIN_1_ROUTER_IP,
    M02_DECOY_SUBDOMAIN_2,
    M02_DECOY_SUBDOMAIN_2_IP,
    M02_DECOY_SUBDOMAIN_2_NOTES_CONTENT,
    M02_DECOY_SUBDOMAIN_2_ROUTER_IP,
    M02_DEPLOY_LOG_CONTENT,
    M02_DEPLOY_LOG_FILE_EXTENSION,
    M02_DEPLOY_LOG_FILE_NAME,
    M02_DEV_IP,
    M02_DEV_NMAP_RESULT,
    M02_DEV_ROUTER_IP,
    M02_DEV_SUBDOMAIN,
    M02_DIALOG,
    M02_EMPTY_SUBDOMAINS,
    M02_FINANCIAL_DOC_CONTENT,
    M02_FINANCIAL_DOC_FILE_EXTENSION,
    M02_FINANCIAL_DOC_FILE_NAME,
    M02_FIREWALL_IP,
    M02_FIREWALL_LAN_IP,
    M02_GAME_CONSOLE_CODENAME,
    M02_GAME_CONSOLE_IP,
    M02_GAME_CONSOLE_LAN_IP,
    M02_HOME_NAS_CODENAME,
    M02_HOME_NAS_IP,
    M02_HOME_NAS_LAN_IP,
    M02_HOME_NAS_PASSWORD,
    M02_HOME_NAS_USERNAME,
    M02_OBJECTIVES,
    M02_OBJECTIVE_IDS,
    M02_PRINTER_IP,
    M02_PRINTER_LAN_IP,
    M02_QUOTA_REPORT_CONTENT,
    M02_QUOTA_REPORT_FILE_EXTENSION,
    M02_QUOTA_REPORT_FILE_NAME,
    M02_REPORT_BODY,
    M02_REPORT_SUBJECT,
    M02_REPORT_TEMPLATE_CONTENT,
    M02_REPORT_TEMPLATE_ID,
    M02_REPORT_TEMPLATE_LABEL,
    M02_REWARDS,
    M02_ROOT_DOMAIN,
    M02_ROOT_IP,
    M02_ROOT_NMAP_RESULT,
    M02_ROUTING_NOTES_CONTENT,
    M02_ROUTING_NOTES_FILE_EXTENSION,
    M02_ROUTING_NOTES_FILE_NAME,
    M02_SHELL_COMPANY_NAME,
    M02_SMART_TV_CODENAME,
    M02_SMART_TV_IP,
    M02_SMART_TV_LAN_IP,
    M02_SPLITTER_IP,
    M02_SPLITTER_LAN_IP,
    M02_SYNC_SCRIPT_CONTENT,
    M02_SYNC_SCRIPT_FILE_EXTENSION,
    M02_SYNC_SCRIPT_FILE_NAME,
    M02_TIP_CONTENT,
    M02_TIP_SUBJECT,
    M02_VICTIM_CASE_ID_EU,
    M02_VICTIM_CASE_ID_NA,
    M02_WIFI_EXTENDER_CODENAME,
    M02_WIFI_EXTENDER_IP,
    M02_WIFI_EXTENDER_LAN_IP,
    M02_WORKSTATION_CODENAME,
    M02_WORKSTATION_ERRANDS_CONTENT,
    M02_WORKSTATION_ERRANDS_FILE_EXTENSION,
    M02_WORKSTATION_ERRANDS_FILE_NAME,
    M02_WORKSTATION_IP,
    M02_WORKSTATION_LAN_IP,
    M02_WORKSTATION_ROUTER_IP,
    M02_WORKSTATION_ROUTER_LAN_IP,
    M02_WORKSTATION_UNSENT_CONTENT,
    M02_WORKSTATION_UNSENT_FILE_EXTENSION,
    M02_WORKSTATION_UNSENT_FILE_NAME,
} from "../content/m02.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

interface M02QuestData {
    readonly deployLogFound: boolean;
    readonly firewallLoggedIn: boolean;
    readonly firewallBreached: boolean;
    readonly aftermathShown: boolean;
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
            client: { value: M01_CASE_ID, type: "string" },
            ransomAmount: { value: M02_CASE_MATCH_RANSOM_AMOUNT, type: "number" },
            settledAt: { value: M02_CASE_MATCH_SETTLED_AT, type: "string" },
        },
        {
            id: { value: 2, type: "number" },
            client: { value: M02_VICTIM_CASE_ID_EU, type: "string" },
            ransomAmount: { value: 1400000, type: "number" },
            settledAt: { value: "2026-05-02", type: "string" },
        },
        {
            id: { value: 3, type: "number" },
            client: { value: M02_VICTIM_CASE_ID_NA, type: "string" },
            ransomAmount: { value: 4100000, type: "number" },
            settledAt: { value: "2026-02-19", type: "string" },
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

interface M02DecoySubnetSpec {
    readonly routerIp: string;
    readonly deviceIp: string;
    readonly subdomain: string;
    readonly rootFileName: string;
    readonly rootFileContent: string;
}

const registerM02DecoySubnet = (spec: M02DecoySubnetSpec): void => {
    Network.createSubnetNetwork({
        ip: spec.routerIp,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: spec.deviceIp,
                type: NetworkDeviceType.Device,
                domain: { name: spec.subdomain, vulnerabilities: [{ type: "SQL_INJECTION" }] },
                users: [],
                ports: [
                    { external: 22, internal: 22, active: true, service: "ssh" },
                    { external: 443, internal: 443, active: true, service: "https" },
                    { external: 3306, internal: 3306, active: true, service: "mysql", version: "mariadb" },
                ],
                rootFiles: [
                    {
                        name: spec.rootFileName,
                        extension: "txt",
                        data: spec.rootFileContent,
                    },
                ],
            },
        ],
    });

    Network.removePort(spec.deviceIp, 3306);
    Network.addPort(spec.deviceIp, {
        external: 3306,
        internal: 3306,
        active: true,
        service: "mysql",
        version: "mariadb",
    });
    Network.setVulnerabilities(spec.deviceIp, [{ type: "SQL_INJECTION" }]);

    if (!Database.getByHost(spec.deviceIp)) {
        Database.create({
            host: spec.deviceIp,
            user: "root",
            password: "unknown",
            tables: {},
        });
    }
};

const registerM02DevSubnet = (): void => {
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
                    {
                        name: M02_SYNC_SCRIPT_FILE_NAME,
                        extension: M02_SYNC_SCRIPT_FILE_EXTENSION,
                        data: M02_SYNC_SCRIPT_CONTENT,
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
};

const registerM02EmptySubdomain = (subdomain: M02EmptySubdomain): void => {
    Network.createSubnetNetwork({ ip: subdomain.ip, type: NetworkDeviceType.Device, users: [], ports: [] });
    Network.registerDomain(`${subdomain.label}.${M02_ROOT_DOMAIN}`, subdomain.ip);
};

const shuffled = <T,>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const registerM02SubfinderDomains = (): void => {
    const tasks: Array<() => void> = [
        registerM02DevSubnet,
        () =>
            registerM02DecoySubnet({
                routerIp: M02_DECOY_SUBDOMAIN_1_ROUTER_IP,
                deviceIp: M02_DECOY_SUBDOMAIN_1_IP,
                subdomain: M02_DECOY_SUBDOMAIN_1,
                rootFileName: "README",
                rootFileContent: M02_DECOY_SUBDOMAIN_1_README_CONTENT,
            }),
        () =>
            registerM02DecoySubnet({
                routerIp: M02_DECOY_SUBDOMAIN_2_ROUTER_IP,
                deviceIp: M02_DECOY_SUBDOMAIN_2_IP,
                subdomain: M02_DECOY_SUBDOMAIN_2,
                rootFileName: "notes",
                rootFileContent: M02_DECOY_SUBDOMAIN_2_NOTES_CONTENT,
            }),
        ...M02_EMPTY_SUBDOMAINS.map((subdomain) => () => registerM02EmptySubdomain(subdomain)),
    ];

    for (const task of shuffled(tasks)) task();
};

const registerM02CloserRigNetwork = (): void => {
    // Network.destroyNetwork(M02_CLOSER_RIG_ROUTER_IP);

    Network.createSubnetNetwork({
        ip: M02_CLOSER_RIG_ROUTER_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M02_CLOSER_RIG_IP,
                type: NetworkDeviceType.Device,
                name: M02_CLOSER_RIG_CODENAME,
                users: [Network.createUser({ username: "closer", online: true })],
                ports: [
                    {
                        external: 3389,
                        internal: 3389,
                        active: true,
                        service: "rdp",
                        version: "FreeRDP 2.7.3",
                    },
                ],
                rootFiles: [
                    {
                        name: M02_QUOTA_REPORT_FILE_NAME,
                        extension: M02_QUOTA_REPORT_FILE_EXTENSION,
                        data: M02_QUOTA_REPORT_CONTENT,
                    },
                    {
                        name: M02_ROUTING_NOTES_FILE_NAME,
                        extension: M02_ROUTING_NOTES_FILE_EXTENSION,
                        data: M02_ROUTING_NOTES_CONTENT,
                    },
                ],
            },
        ],
    });

    Network.setVulnerabilities(M02_CLOSER_RIG_IP, [{ type: "RCE", version: "FreeRDP 2.7.3" }]);
};

const registerM02WorkstationNetwork = (): void => {
    // Network.destroyNetwork(M02_WORKSTATION_ROUTER_IP);

    Network.createSubnetNetwork({
        ip: M02_WORKSTATION_ROUTER_IP,
        lanIp: M02_WORKSTATION_ROUTER_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M02_SPLITTER_IP,
                lanIp: M02_SPLITTER_LAN_IP,
                type: NetworkDeviceType.Splitter,
                users: [],
                children: [
                    {
                        ip: M02_FIREWALL_IP,
                        lanIp: M02_FIREWALL_LAN_IP,
                        type: NetworkDeviceType.Firewall,
                        isIpHidden: true,
                        users: [
                            Network.createUser({
                                username: M02_ADMIN_USERNAME,
                                password: M02_ADMIN_PASSWORD,
                            }),
                        ],
                        ports: [{ external: 80, internal: 80, active: true, service: "http" }],
                        rules: [{ allowed: false, port: 3389 }],
                    },
                    {
                        ip: M02_PRINTER_IP,
                        lanIp: M02_PRINTER_LAN_IP,
                        type: NetworkDeviceType.Printer,
                        users: [],
                        ports: [{ external: 9100, internal: 9100, active: false, service: "printer" }],
                    },
                    {
                        ip: M02_WIFI_EXTENDER_IP,
                        lanIp: M02_WIFI_EXTENDER_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M02_WIFI_EXTENDER_CODENAME,
                        users: [],
                        ports: [{ external: 23, internal: 23, active: true, service: "telnet" }],
                    },
                    {
                        ip: M02_HOME_NAS_IP,
                        lanIp: M02_HOME_NAS_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M02_HOME_NAS_CODENAME,
                        users: [
                            Network.createUser({
                                username: M02_HOME_NAS_USERNAME,
                                password: M02_HOME_NAS_PASSWORD,
                            }),
                        ],
                        ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
                        rootFiles: [
                            {
                                name: M02_AFFILIATE_ENDPOINTS_FILE_NAME,
                                extension: M02_AFFILIATE_ENDPOINTS_FILE_EXTENSION,
                                data: M02_AFFILIATE_ENDPOINTS_CONTENT,
                            },
                        ],
                    },
                    {
                        ip: M02_SMART_TV_IP,
                        lanIp: M02_SMART_TV_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M02_SMART_TV_CODENAME,
                        users: [],
                        ports: [{ external: 8008, internal: 8008, active: true, service: "http" }],
                    },
                    {
                        ip: M02_CAMERA_IP,
                        lanIp: M02_CAMERA_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M02_CAMERA_CODENAME,
                        users: [],
                        ports: [{ external: 554, internal: 554, active: true, service: "rtsp" }],
                    },
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
                                active: false,
                                service: "rdp",
                                version: "FreeRDP 7.1.9",
                            },
                        ],
                        rootFiles: [
                            {
                                name: M02_FINANCIAL_DOC_FILE_NAME,
                                extension: M02_FINANCIAL_DOC_FILE_EXTENSION,
                                data: M02_FINANCIAL_DOC_CONTENT,
                            },
                            {
                                name: M02_WORKSTATION_ERRANDS_FILE_NAME,
                                extension: M02_WORKSTATION_ERRANDS_FILE_EXTENSION,
                                data: M02_WORKSTATION_ERRANDS_CONTENT,
                            },
                            {
                                name: M02_WORKSTATION_UNSENT_FILE_NAME,
                                extension: M02_WORKSTATION_UNSENT_FILE_EXTENSION,
                                data: M02_WORKSTATION_UNSENT_CONTENT,
                            },
                        ],
                    },
                    {
                        ip: M02_GAME_CONSOLE_IP,
                        lanIp: M02_GAME_CONSOLE_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M02_GAME_CONSOLE_CODENAME,
                        users: [],
                        ports: [],
                    },
                ],
            },
        ],
    });

    Network.setVulnerabilities(M02_WORKSTATION_IP, [{ type: "RCE", version: "FreeRDP 7.1.9" }]);
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
    override Dialog = M02_DIALOG;

    override Objectives = applyDevGating(M02_OBJECTIVES, isQuestDevFocus("m02"));

    private databaseId = "";

    override CreateData(): M02QuestData {
        return {
            deployLogFound: false,
            firewallLoggedIn: false,
            firewallBreached: false,
            aftermathShown: false,
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

        // if (isDev) {
        //     Network.destroyNetwork(M02_DEV_ROUTER_IP);
        // }
        registerM02SubfinderDomains();

        registerM02WorkstationNetwork();
        registerM02CloserRigNetwork();

        if (this.Data.firewallBreached) {
            Network.removeFirewallRule(M02_FIREWALL_IP, 3389);
            Network.openPort(M02_WORKSTATION_IP, 3389);
        }

        Network.registerDomain(M02_ROOT_DOMAIN, M02_ROOT_IP);

        registerM02ShellFixtures();
        this.databaseId = registerM02Database();

        Mail.registerTemplate({
            id: M02_REPORT_TEMPLATE_ID,
            label: M02_REPORT_TEMPLATE_LABEL,
            title: M02_REPORT_SUBJECT,
            content: M02_REPORT_TEMPLATE_CONTENT,
            fields: ["developer_url", "shellCompany"],
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (this.Data.deployLogFound) return;
            if (data.name !== M02_DEPLOY_LOG_FILE_NAME || data.data !== M02_DEPLOY_LOG_CONTENT) return;

            this.SetData("deployLogFound", true);
            this.createDialog("default");
        });

        this.Events.on("PFSense.Login", (data) => {
            if (data.ip !== M02_FIREWALL_IP) return;

            this.SetData("firewallLoggedIn", true);
        });

        this.Events.on("PFSense.Changes", () => {
            if (!this.Data.firewallLoggedIn) return;
            if (this.Data.firewallBreached) return;

            this.SetData("firewallBreached", true);
            Network.removeFirewallRule(M02_FIREWALL_IP, 3389);
            Network.openPort(M02_WORKSTATION_IP, 3389);
        });

        this.Events.on("Files.Transfer", (data) => {
            if (this.Data.aftermathShown) return;
            if (data.type !== "DOWNLOAD") return;
            const workstationFiles: string[] = [
                M02_FINANCIAL_DOC_FILE_NAME,
                M02_WORKSTATION_ERRANDS_FILE_NAME,
                M02_WORKSTATION_UNSENT_FILE_NAME,
            ];
            if (!workstationFiles.includes(data.file?.name ?? "")) return;

            this.SetData("aftermathShown", true);
            this.createDialog("aftermath");
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (!this.isReport(data.subject, data.content)) return;
            if (data.to !== M02_DEAD_DROP_EMAIL) return;

            this.SetData("reportSent", true);
            this.completeObjective(M02_OBJECTIVE_IDS.reportFindings);
        });
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
        Network.removeDomain(M02_DECOY_SUBDOMAIN_1);
        Network.removeDomain(M02_DECOY_SUBDOMAIN_2);
        for (const subdomain of M02_EMPTY_SUBDOMAINS) {
            Network.removeDomain(`${subdomain.label}.${M02_ROOT_DOMAIN}`);
        }
        Network.destroyNetwork(M02_ROOT_IP);
        Network.destroyNetwork(M02_DEV_ROUTER_IP);
        Network.destroyNetwork(M02_DECOY_SUBDOMAIN_1_ROUTER_IP);
        Network.destroyNetwork(M02_DECOY_SUBDOMAIN_2_ROUTER_IP);
        Network.destroyNetwork(M02_WORKSTATION_ROUTER_IP);
        Network.destroyNetwork(M02_CLOSER_RIG_ROUTER_IP);
        if (this.databaseId) Database.remove(this.databaseId);

        const decoyDb1 = Database.getByHost(M02_DECOY_SUBDOMAIN_1_IP);
        if (decoyDb1) Database.remove(decoyDb1.id);
        const decoyDb2 = Database.getByHost(M02_DECOY_SUBDOMAIN_2_IP);
        if (decoyDb2) Database.remove(decoyDb2.id);
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

        const { developer_url, shellCompany } = fields as Record<string, unknown>;
        return developer_url === M02_DEV_SUBDOMAIN && shellCompany === M02_SHELL_COMPANY_NAME;
    }
}
