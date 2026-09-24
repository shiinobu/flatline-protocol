import {
    Database,
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
} from "@hotbunny/hackhub-content-sdk";

import { setBacktraceMission } from "../applications/backtrace-state.js";
import {
    M03_ACCOMPLICE_CODENAME,
    M03_ACCOMPLICE_IP,
    M03_ACCOMPLICE_PASSWORD,
    M03_ACCOMPLICE_USERNAME,
    M03_COINDRIFT_CODENAME,
    M03_COINDRIFT_IP,
    M03_DEAD_DROP_EMAIL,
    M03_FINANCE_EMPLOYEE_HANDLE,
    M03_FINANCE_PASSWORD,
    M03_FINANCE_USERNAME,
    M03_LEAK_PATTERN,
    M03_LEDGER_TABLE,
    M03_MX_HOST,
    M03_OBJECTIVES,
    M03_OBJECTIVE_IDS,
    M03_PARENT_ENTITY_NAME,
    M03_PFSENSE_IP,
    M03_PFSENSE_LAN_IP,
    M03_PFSENSE_PASSWORD,
    M03_PFSENSE_USERNAME,
    M03_REPORT_BODY,
    M03_REPORT_SUBJECT,
    M03_REPORT_TEMPLATE_CONTENT,
    M03_REPORT_TEMPLATE_ID,
    M03_REPORT_TEMPLATE_LABEL,
    M03_REWARDS,
    M03_SKYNET_DOMAIN,
    M03_SKYNET_IP,
    M03_SKYNET_NMAP_RESULT,
    M03_SPLITTER_IP,
    M03_SPREADSHEET_CONTENT,
    M03_SPREADSHEET_FILE_EXTENSION,
    M03_SPREADSHEET_FILE_NAME,
    M03_TIP_CONTENT,
    M03_TIP_SUBJECT,
} from "../content/m03.js";
import { M02_SHELL_COMPANY_NAME } from "../content/m02.js";
import { applyDevGating, isDev, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

interface M03QuestData {
    readonly leadReviewed: boolean;
    readonly publicSiteScanned: boolean;
    readonly publicSiteReconned: boolean;
    readonly emailFormatMapped: boolean;
    readonly passwordLeakFound: boolean;
    readonly pfsenseCracked: boolean;
    readonly pfsenseLoggedIn: boolean;
    readonly natPivotDone: boolean;
    readonly internalTrafficCaptured: boolean;
    readonly ledgerDumped: boolean;
    readonly shareExplored: boolean;
    readonly natReverted: boolean;
    readonly reportSent: boolean;
    readonly pfsenseChangeCount: number;
}

const resetM03ShellFixtures = (): void => {
    Shell.removeCommandData("nmap", M03_SKYNET_IP);
    Shell.removeCommandData("lynx", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE);
    Shell.removeCommandData("mxlookup", M03_SKYNET_DOMAIN);
    Shell.removeCommandData("hydra", { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP });
};

const registerM03ShellFixtures = (): void => {
    resetM03ShellFixtures();

    Shell.addCommandData("nmap", M03_SKYNET_IP, M03_SKYNET_NMAP_RESULT);
    Shell.addCommandData("lynx", M03_SKYNET_DOMAIN, {
        ips: [M03_SKYNET_IP],
        address: [`https://${M03_SKYNET_DOMAIN}/`],
        additional: [
            "Import-export logistics firm. Generic corporate front.",
            `Staff directory blurb name-drops a finance analyst active online: ${M03_FINANCE_EMPLOYEE_HANDLE}.`,
        ],
    });
    Shell.addCommandData("mxlookup", M03_SKYNET_DOMAIN, M03_MX_HOST);
    Shell.addCommandData("lynx", M03_FINANCE_EMPLOYEE_HANDLE, {
        socialMedia: [M03_FINANCE_EMPLOYEE_HANDLE],
        additional: [
            "Finance analyst. Complained publicly about being forced to reuse the company's " +
                "standard password format across every internal tool.",
            `"ugh, IT still makes us do ${M03_LEAK_PATTERN} for everything. so predictable."`,
        ],
    });
    Shell.addCommandData(
        "hydra",
        { user: M03_PFSENSE_USERNAME, target: M03_PFSENSE_IP },
        { credentials: { username: M03_PFSENSE_USERNAME, password: M03_PFSENSE_PASSWORD } },
    );
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
            amount: { value: 42000, type: "number" },
        },
    ]);

    return databaseId;
};

const registerM03FinanceVlan = (): void => {
    if (isDev) {
        Network.destroyNetwork(M03_PFSENSE_IP);
    }

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
        ports: [{ external: 443, internal: 443, active: true, service: "https" }],
        children: [
            {
                ip: M03_SPLITTER_IP,
                lanIp: M03_SPLITTER_IP,
                type: NetworkDeviceType.Splitter,
                users: [],
                children: [
                    {
                        ip: M03_COINDRIFT_IP,
                        lanIp: M03_COINDRIFT_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_COINDRIFT_CODENAME,
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
                        lanIp: M03_ACCOMPLICE_IP,
                        type: NetworkDeviceType.Device,
                        name: M03_ACCOMPLICE_CODENAME,
                        users: [
                            Network.createUser({
                                username: M03_ACCOMPLICE_USERNAME,
                                password: M03_ACCOMPLICE_PASSWORD,
                            }),
                        ],
                        ports: [{ external: 445, internal: 445, active: true, service: "smb" }],
                        rootFiles: [
                            {
                                name: M03_SPREADSHEET_FILE_NAME,
                                extension: M03_SPREADSHEET_FILE_EXTENSION,
                                data: M03_SPREADSHEET_CONTENT,
                            },
                        ],
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
            leadReviewed: false,
            publicSiteScanned: false,
            publicSiteReconned: false,
            emailFormatMapped: false,
            passwordLeakFound: false,
            pfsenseCracked: false,
            pfsenseLoggedIn: false,
            natPivotDone: false,
            internalTrafficCaptured: false,
            ledgerDumped: false,
            shareExplored: false,
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

        registerM03ShellFixtures();
        this.databaseId = registerM03Database();

        Mail.registerTemplate({
            id: M03_REPORT_TEMPLATE_ID,
            label: M03_REPORT_TEMPLATE_LABEL,
            title: M03_REPORT_SUBJECT,
            content: M03_REPORT_TEMPLATE_CONTENT,
            fields: ["shellCompany", "parentEntity"],
        });

        this.Events.on("Mail.Read", (data) => {
            if (this.Data.leadReviewed) return;
            if (data.from !== M03_DEAD_DROP_EMAIL || data.subject !== M03_TIP_SUBJECT) return;

            this.SetData("leadReviewed", true);
            this.completeObjective(M03_OBJECTIVE_IDS.reviewLead);
        });

        this.Events.on("Terminal.NmapScan", (data) => {
            if (this.Data.publicSiteScanned) return;
            if (data.ip !== M03_SKYNET_IP) return;

            this.SetData("publicSiteScanned", true);
            this.completeObjective(M03_OBJECTIVE_IDS.scanPublicSite);
        });

        this.Events.on("Terminal.Lynx.Lookup", (data) => {
            if (data.input === M03_SKYNET_DOMAIN && !this.Data.publicSiteReconned) {
                this.SetData("publicSiteReconned", true);
                this.completeObjective(M03_OBJECTIVE_IDS.reconPublicSite);
                return;
            }

            if (
                (data.input === M03_FINANCE_EMPLOYEE_HANDLE || data.input.includes("reyes")) &&
                !this.Data.passwordLeakFound
            ) {
                this.SetData("passwordLeakFound", true);
                this.completeObjective(M03_OBJECTIVE_IDS.findPasswordLeak);
            }
        });

        this.Events.on("Terminal.Mxlookup", (data) => {
            if (this.Data.emailFormatMapped) return;
            if (data.domain !== M03_SKYNET_DOMAIN) return;

            this.SetData("emailFormatMapped", true);
            this.completeObjective(M03_OBJECTIVE_IDS.mapEmailFormat);
        });

        this.Events.on("Terminal.Hydra", (data) => {
            if (this.Data.pfsenseCracked) return;
            if (data.ip !== M03_PFSENSE_IP) return;
            if (
                data.credentials.username !== M03_PFSENSE_USERNAME ||
                data.credentials.password !== M03_PFSENSE_PASSWORD
            ) {
                return;
            }

            this.SetData("pfsenseCracked", true);
            this.completeObjective(M03_OBJECTIVE_IDS.crackPfsenseLogin);
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
                this.completeObjective(M03_OBJECTIVE_IDS.pivotViaNat);
                return;
            }

            if (count >= 2 && !this.Data.natReverted && this.Data.ledgerDumped) {
                this.SetData("natReverted", true);
                this.completeObjective(M03_OBJECTIVE_IDS.revertNatRule);
            }
        });

        this.Events.on("Wireshark.Started", () => {
            if (this.Data.internalTrafficCaptured) return;
            if (!this.Data.natPivotDone) return;

            this.SetData("internalTrafficCaptured", true);
            this.completeObjective(M03_OBJECTIVE_IDS.captureInternalTraffic);
        });

        this.Events.on("Sqlmap.DumpTable", (data) => {
            if (this.Data.ledgerDumped) return;
            if (data.host !== M03_COINDRIFT_IP || data.tableName !== M03_LEDGER_TABLE) return;

            this.SetData("ledgerDumped", true);
            this.completeObjective(M03_OBJECTIVE_IDS.dumpFinanceLedger);
        });

        this.Events.on("Terminal.Explorer", (data) => {
            if (this.Data.shareExplored) return;
            if (data.ip !== M03_ACCOMPLICE_IP) return;

            this.SetData("shareExplored", true);
            this.completeObjective(M03_OBJECTIVE_IDS.bonusExploreShare);
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (!this.isReport(data.subject, data.content)) return;
            if (data.to !== M03_DEAD_DROP_EMAIL) return;

            this.SetData("reportSent", true);
            this.completeObjective(M03_OBJECTIVE_IDS.reportFindings);
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

    private teardown(): void {
        resetM03ShellFixtures();
        Network.removeDomain(M03_SKYNET_DOMAIN);
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

        const { shellCompany, parentEntity } = fields as Record<string, unknown>;
        return shellCompany === M02_SHELL_COMPANY_NAME && parentEntity === M03_PARENT_ENTITY_NAME;
    }
}
