import {
    Database,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
    Twotter,
    type DatabaseRowDefinition,
    type NetworkPortInfo,
} from "@hotbunny/hackhub-content-sdk";

import { appendBacktraceLogs, setBacktraceMission, traceBacktraceFinding } from "../applications/backtrace-state.js";
import { OPEN_FILE_READ_EVENT } from "../commands/open.js";
import { trace } from "../helpers/logger.js";
import { resetMissionNetworks } from "../components/topology.js";
import {
    M03_ACCESS_TABLE,
    M03_ACCOMPLICE_CODENAME,
    M03_ACCOMPLICE_IP,
    M03_ACCOMPLICE_LAN_IP,
    M03_ACCOMPLICE_PASSWORD,
    M03_ACCOMPLICE_USERNAME,
    M03_ARCHITECT_VPN_LEAD,
    M03_COINDRIFT_CODENAME,
    M03_COINDRIFT_IP,
    M03_COINDRIFT_LAN_IP,
    M03_COMPANY_SHORT_NAME,
    M03_DEAD_DROP_EMAIL,
    M03_DECOY_EMPLOYEE_HANDLE,
    M03_DECOY_HOST_CODENAME,
    M03_DECOY_HOST_IP,
    M03_DECOY_HOST_LAN_IP,
    M03_DECOY_HOST_PASSWORD,
    M03_DECOY_HOST_README_CONTENT,
    M03_DECOY_HOST_USERNAME,
    M03_FINANCE_EMPLOYEE_HANDLE,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
    M03_FORWARD_TARGETS,
    M03_HELPDESK_RESET_NOTE,
    M03_HYDRA_DEFAULT_USER,
    M03_LEDGER_DOMAIN,
    M03_LEDGER_TABLE,
    M03_LEGACY_PFSENSE_IP,
    M03_LOG_ENTRIES,
    M03_MX_HOST,
    M03_OBJECTIVES,
    M03_OBJECTIVE_IDS,
    M03_OKAFOR_BIO,
    M03_OKAFOR_FIRST_NAME,
    M03_OKAFOR_HANDLE,
    M03_OKAFOR_LAST_NAME,
    M03_OKAFOR_POSTS,
    M03_PARENT_ENTITY_NAME,
    M03_PFSENSE_IP,
    M03_PFSENSE_LAN_IP,
    M03_PFSENSE_NMAP_RESULT,
    M03_PFSENSE_PASSWORD,
    M03_PFSENSE_USERNAME,
    M03_POLICY_YEAR,
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
    M03_SITE_ACCESS_NOTICE,
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
    M03_VAULTLINE_CODENAME,
    M03_VAULTLINE_IP,
    M03_VAULTLINE_LAN_IP,
    M03_VAULTLINE_RDP_VERSION,
    M03_VPN_CONFIG_CONTENT,
    M03_VPN_CONFIG_FILE_EXTENSION,
    M03_VPN_CONFIG_FILE_NAME,
    M03_VPN_GEOIP,
    buildM03LedgerRows,
    type M03ForwardTarget,
    type M03TwotterPost,
} from "../content/m03.js";
import { M02_SHELL_COMPANY_NAME } from "../content/global/entities.js";
import { applyDevGating, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";
import "../websites/m03/skynet-importexport/index.js";

interface M03Forward {
    readonly ip: string;
    readonly external: number;
    readonly internal: number;
    readonly active: boolean;
}

interface M03QuestData {
    readonly portalReached: boolean;
    readonly natPivotDone: boolean;
    readonly ledgerDumped: boolean;
    readonly gatewayShellObtained: boolean;
    readonly gatewayRooted: boolean;
    readonly vpnConfigRead: boolean;
    readonly accompliceReached: boolean;
    readonly reportSent: boolean;
    readonly networkBuilt: boolean;
    readonly forwards: readonly M03Forward[];
}

interface M03MatchedForward {
    readonly target: M03ForwardTarget;
    readonly port: NetworkPortInfo;
}

const findForwardTarget = (port: NetworkPortInfo): M03ForwardTarget | undefined =>
    M03_FORWARD_TARGETS.find(
        (target) => target.lanIp === port.lanIp?.trim() && target.internal === port.internal,
    );

const matchForwards = (ports: readonly NetworkPortInfo[]): readonly M03MatchedForward[] =>
    ports.flatMap((port) => {
        const target = findForwardTarget(port);
        return target ? [{ target, port }] : [];
    });

const toForward = ({ target, port }: M03MatchedForward): M03Forward => ({
    ip: target.ip,
    external: port.external,
    internal: port.internal,
    active: port.active === true,
});

const hasBanner = ({ target, port }: M03MatchedForward): boolean =>
    port.service === target.service && port.version === target.version;

const writeForward = (target: M03ForwardTarget, forward: M03Forward): void => {
    Network.removePort(forward.ip, forward.external);
    Network.addPort(forward.ip, {
        external: forward.external,
        internal: forward.internal,
        active: forward.active,
        service: target.service,
        version: target.version,
    });
};

const syncM03Forwards = (ports: readonly NetworkPortInfo[]): readonly M03Forward[] => {
    const matched = matchForwards(ports);

    for (const match of matched) {
        if (!hasBanner(match)) writeForward(match.target, toForward(match));
    }

    return matched.map(toForward);
};

const restoreM03Forwards = (forwards: readonly M03Forward[]): void => {
    for (const forward of forwards) {
        const target = M03_FORWARD_TARGETS.find(
            (candidate) => candidate.ip === forward.ip && candidate.internal === forward.internal,
        );
        if (target) writeForward(target, forward);
    }
};

const M03_PFSENSE_HYDRA_TARGET = `${M03_PFSENSE_IP}:80`;
const M03_PFSENSE_HYDRA_USERS: readonly string[] = [M03_HYDRA_DEFAULT_USER, M03_PFSENSE_USERNAME];

const resetM03ShellFixtures = (): void => {
    Shell.removeCommandData("nmap", M03_SKYNET_IP);
    Shell.removeCommandData("nmap", M03_PFSENSE_IP);
    Shell.removeCommandData("nslookup", M03_REMOTE_PORTAL_DOMAIN);
    Shell.removeCommandData("lynx", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE);
    Shell.removeCommandData("lynx", M03_DECOY_EMPLOYEE_HANDLE);
    Shell.removeCommandData("mxlookup", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("hydra", { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP });
    for (const user of M03_PFSENSE_HYDRA_USERS) {
        Shell.removeCommandData("hydra", { user, target: M03_PFSENSE_HYDRA_TARGET });
    }
    Shell.removeCommandData("geoip", M03_ARCHITECT_VPN_LEAD);
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
            `Import-export logistics firm. Trades publicly as "${M03_COMPANY_SHORT_NAME}".`,
            `Staff directory lists a finance analyst active online: ${M03_FINANCE_EMPLOYEE_HANDLE} (${M03_TWOTTER_FIRST_NAME} ${M03_TWOTTER_LAST_NAME}).`,
            `Also listed: ${M03_DECOY_EMPLOYEE_HANDLE} (${M03_OKAFOR_FIRST_NAME} ${M03_OKAFOR_LAST_NAME}), operations.`,
            `Staff remote-access portal: ${M03_REMOTE_PORTAL_DOMAIN}.`,
            M03_SITE_ACCESS_NOTICE,
            `Site footer: "IT security policy in force since ${M03_POLICY_YEAR}. Annual password rotation."`,
        ],
    });
    Shell.addCommandData("mxlookup", M03_SKYNET_DOMAIN, M03_MX_HOST);
    Shell.addCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE, {
        socialMedia: [M03_FINANCE_EMPLOYEE_HANDLE],
        additional: [
            "Finance analyst. Posts constantly, mostly about work she shouldn't.",
            "Spelled out the corporate password recipe in one post: the short company name, the year the policy came in, one word, capitalized, '!' on the end.",
            "Also mentions reusing her family's names on her own personal shares. Careless in two directions at once.",
        ],
    });
    Shell.addCommandData("lynx", M03_DECOY_EMPLOYEE_HANDLE, {
        socialMedia: [M03_DECOY_EMPLOYEE_HANDLE],
        additional: [
            "Facilities/operations. Loud about 'running the building', badges and the server room.",
            "Brags about access he clearly doesn't have; even admits he can't reach the finance systems.",
            "The one credential he actually posts is the guest wifi -- a dead end, nothing internal behind it.",
        ],
    });
    for (const user of M03_PFSENSE_HYDRA_USERS) {
        Shell.addCommandData(
            "hydra",
            { user, target: M03_PFSENSE_HYDRA_TARGET },
            { credentials: { username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD } },
        );
    }
    Shell.addCommandData("geoip", M03_ARCHITECT_VPN_LEAD, M03_VPN_GEOIP);
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

    Database.setTable(
        databaseId,
        M03_LEDGER_TABLE,
        buildM03LedgerRows().map((row): DatabaseRowDefinition => ({
            id: { value: row.id, type: "number" },
            postedAt: { value: row.postedAt, type: "string" },
            direction: { value: row.direction, type: "string" },
            party: { value: row.party, type: "string" },
            amount: { value: row.amount, type: "number" },
            balance: { value: row.balance, type: "number" },
            memo: { value: row.memo, type: "string" },
        })),
    );

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
                    },
                    {
                        ip: M03_VAULTLINE_IP,
                        lanIp: M03_VAULTLINE_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_VAULTLINE_CODENAME,
                        users: [Network.createUser({ username: "svc-vpn", online: true }), Network.createUser({ username: "root" })],
                        rootFiles: [
                            {
                                name: M03_VPN_CONFIG_FILE_NAME,
                                extension: M03_VPN_CONFIG_FILE_EXTENSION,
                                data: M03_VPN_CONFIG_CONTENT,
                            },
                        ],
                    },
                ],
            },
        ],
    });

    Network.setVulnerabilities(M03_COINDRIFT_IP, [{ type: "SQL_INJECTION" }]);
    Network.setVulnerabilities(M03_VAULTLINE_IP, [{ type: "RCE", version: M03_VAULTLINE_RDP_VERSION }]);
};

const M03_TWOTTER_TWEET_PREFIX = "m03-reyes-tweet-";
const M03_OKAFOR_TWEET_PREFIX = "m03-okafor-tweet-";

const seedM03Persona = (
    username: string,
    firstName: string,
    lastName: string,
    bio: string,
    gender: "male" | "female",
    prefix: string,
    posts: readonly M03TwotterPost[],
): void => {
    const user =
        Twotter.getUserByUsername(username) ??
        Twotter.createUser({ username, firstName, lastName, bio, gender });
    if (!Twotter.getUserByUsername(username)) {
        Twotter.addUser(user);
    }
    Twotter.updateUser(user.id, { name: firstName, surname: lastName, bio });
    posts.forEach((post, index) => {
        const id = `${prefix}${index}`;
        Twotter.removeTweet(id);
        Twotter.postTweet({ id, userId: user.id, content: post.content, interaction: post.interaction });
    });
};

const registerM03TwotterPersonas = (): void => {
    seedM03Persona(
        M03_TWOTTER_HANDLE,
        M03_TWOTTER_FIRST_NAME,
        M03_TWOTTER_LAST_NAME,
        M03_TWOTTER_BIO,
        "female",
        M03_TWOTTER_TWEET_PREFIX,
        M03_TWOTTER_POSTS,
    );
    seedM03Persona(
        M03_OKAFOR_HANDLE,
        M03_OKAFOR_FIRST_NAME,
        M03_OKAFOR_LAST_NAME,
        M03_OKAFOR_BIO,
        "male",
        M03_OKAFOR_TWEET_PREFIX,
        M03_OKAFOR_POSTS,
    );
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
            portalReached: false,
            natPivotDone: false,
            ledgerDumped: false,
            gatewayShellObtained: false,
            gatewayRooted: false,
            vpnConfigRead: false,
            accompliceReached: false,
            reportSent: false,
            networkBuilt: false,
            forwards: [],
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

        const vlanKept = this.Data.networkBuilt && Network.getSubnet(M03_PFSENSE_IP) !== null;
        if (!vlanKept) {
            registerM03FinanceVlan();
            restoreM03Forwards(this.Data.forwards ?? []);
        }

        Network.registerDomain(M03_SKYNET_DOMAIN, M03_SKYNET_IP);
        Network.registerDomain(M03_REMOTE_PORTAL_DOMAIN, M03_PFSENSE_IP);

        registerM03ShellFixtures();
        registerM03TwotterPersonas();
        this.databaseId = registerM03Database();

        Mail.registerTemplate({
            id: M03_REPORT_TEMPLATE_ID,
            label: M03_REPORT_TEMPLATE_LABEL,
            title: M03_REPORT_SUBJECT,
            content: M03_REPORT_TEMPLATE_CONTENT,
            fields: ["shellCompany", "parentEntity", "vpnLead"],
        });

        this.Events.on("Network.PortChanges", (data) => {
            if (data.subnet.ip !== M03_PFSENSE_IP) return;

            this.onRouterSaved(data.newPorts);
        });

        this.Events.on("Sqlmap.DumpTable", (data) => {
            if (data.host !== M03_COINDRIFT_IP && data.host !== M03_LEDGER_DOMAIN) return;
            if (data.tableName !== M03_LEDGER_TABLE) return;
            this.markLedgerDumped();
        });

        this.Events.on("Database.Connected", (data) => {
            if (data.host !== M03_COINDRIFT_IP && data.host !== M03_LEDGER_DOMAIN) return;
            this.markLedgerDumped();
        });

        this.Events.on("RemoteConnection.Established", (data) => {
            trace("M03", `remote connection ${data.t} -> ${data.targetIp}`);
            if (data.t === "SSH" && data.targetIp === M03_ACCOMPLICE_IP) {
                this.markAccompliceReached();
                return;
            }
            if (data.t !== "METASPLOIT" || data.targetIp !== M03_VAULTLINE_IP) return;

            this.markGatewayShell();
        });

        this.Events.on("Metasploit.Meterpreter.Connected", (data) => {
            if (data.ip !== M03_VAULTLINE_IP) return;

            this.markGatewayShell();
        });

        this.Events.on("Metasploit.Rootgrab", (data) => {
            if (this.Data.gatewayRooted) return;
            if (data.ip !== M03_VAULTLINE_IP) return;
            if (!this.Data.gatewayShellObtained) return;

            this.SetData("gatewayRooted", true);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.root);
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (data.name !== M03_VPN_CONFIG_FILE_NAME || data.extension !== M03_VPN_CONFIG_FILE_EXTENSION) return;

            this.markVpnConfigRead();
        });

        this.Events.on(OPEN_FILE_READ_EVENT, (data: { id: string; name: string; extension?: string }) => {
            if (data.name !== M03_VPN_CONFIG_FILE_NAME || data.extension !== M03_VPN_CONFIG_FILE_EXTENSION) return;

            this.markVpnConfigRead();
        });

        this.Events.on("Terminal.Explorer", (data) => {
            if (data.ip !== M03_ACCOMPLICE_IP && data.ip !== M03_ACCOMPLICE_LAN_IP) return;

            this.markAccompliceReached();
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.reyes);
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (data.name !== M03_REYES_NOTE_FILE_NAME || data.extension !== M03_REYES_NOTE_FILE_EXTENSION) return;

            appendBacktraceLogs("m3", M03_LOG_ENTRIES.reyes);
        });

        this.Events.on(OPEN_FILE_READ_EVENT, (data: { id: string; name: string; extension?: string }) => {
            if (data.name !== M03_REYES_NOTE_FILE_NAME || data.extension !== M03_REYES_NOTE_FILE_EXTENSION) return;

            appendBacktraceLogs("m3", M03_LOG_ENTRIES.reyes);
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (data.to !== M03_DEAD_DROP_EMAIL) return;
            if (!this.Data.ledgerDumped || !this.Data.vpnConfigRead) return;
            if (!this.isReport(data.subject, data.content)) return;

            this.SetData("reportSent", true);
            appendBacktraceLogs("m3", M03_LOG_ENTRIES.aftermath);
            this.completeObjective(M03_OBJECTIVE_IDS.reportFindings);
        });

        if (!vlanKept) this.SetData("networkBuilt", true);
    }

    override OnComplete() {
        setBacktraceMission("m3", "complete");
        this.teardown();
    }

    override OnAbandon() {
        setBacktraceMission("m3", "locked");
        this.teardown();
    }

    private onRouterSaved(ports: readonly NetworkPortInfo[]): void {
        if (!this.Data.portalReached) {
            this.SetData("portalReached", true);
            traceBacktraceFinding("m3", "portal");
        }

        const forwards = syncM03Forwards(ports);
        this.SetData("forwards", forwards);

        if (!this.Data.natPivotDone && forwards.some((forward) => forward.active)) {
            this.SetData("natPivotDone", true);
        }
    }

    private markVpnConfigRead(): void {
        if (this.Data.vpnConfigRead) return;

        this.SetData("vpnConfigRead", true);
        traceBacktraceFinding("m3", "vpnPeer");
        appendBacktraceLogs("m3", M03_LOG_ENTRIES.tunnel);
    }

    private markAccompliceReached(): void {
        if (this.Data.accompliceReached) return;

        this.SetData("accompliceReached", true);
        traceBacktraceFinding("m3", "accomplice");
    }

    private markGatewayShell(): void {
        traceBacktraceFinding("m3", "gateway");
        if (this.Data.gatewayShellObtained) return;

        this.SetData("gatewayShellObtained", true);
    }

    private markLedgerDumped(): void {
        if (this.Data.ledgerDumped) return;
        this.SetData("ledgerDumped", true);
        traceBacktraceFinding("m3", "parentEntity");
        appendBacktraceLogs("m3", M03_LOG_ENTRIES.ledger);
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
