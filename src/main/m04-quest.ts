import {
    Mail,
    Network,
    NetworkDeviceType,
    Quest,
    RegisterQuest,
    Shell,
} from "@hotbunny/hackhub-content-sdk";

import { ATTRCHECK_REVEALED_EVENT } from "../commands/attrcheck.js";
import {
    M04_ARCHITECT_NMAP_RESULT,
    M04_ARCHITECT_REAL_NAME,
    M04_ARCHITECT_VPN_IP,
    M04_ASHVECTOR_CODENAME,
    M04_ASHVECTOR_IP,
    M04_ASHVECTOR_LAN_IP,
    M04_C2_IP,
    M04_C2_LAN_IP,
    M04_CHOICE_DESTROY,
    M04_CHOICE_EXPOSE,
    M04_CHOICE_HANDOFF,
    M04_DEAD_DROP_EMAIL,
    M04_DIALOG,
    M04_FIREWALL_IP,
    M04_FIREWALL_LAN_IP,
    M04_HONEYPOT_ALERT_CONTENT,
    M04_HONEYPOT_ALERT_FROM,
    M04_HONEYPOT_ALERT_SUBJECT,
    M04_HONEYPOT_DECOY_CONTENT,
    M04_HONEYPOT_DECOY_FILE_EXTENSION,
    M04_HONEYPOT_DECOY_FILE_NAME,
    M04_HONEYPOT_PASSWORD,
    M04_HONEYPOT_USERNAME,
    M04_IDENTITY_FILE_CONTENT,
    M04_IDENTITY_FILE_EXTENSION,
    M04_IDENTITY_FILE_NAME,
    M04_LEGACY_CMS_PATH,
    M04_NULLCROWN_CODENAME,
    M04_NULLCROWN_IP,
    M04_NULLCROWN_LAN_IP,
    M04_OBJECTIVES,
    M04_OBJECTIVE_IDS,
    M04_REPORT_BODY_DESTROY,
    M04_REPORT_BODY_EXPOSE,
    M04_REPORT_BODY_HANDOFF,
    M04_REPORT_SUBJECT,
    M04_REPORT_TEMPLATE_CONTENT,
    M04_REPORT_TEMPLATE_ID,
    M04_REPORT_TEMPLATE_LABEL,
    M04_REWARDS,
    M04_ROUTER_LAN_IP,
    M04_SPLITTER_IP,
    M04_SPLITTER_LAN_IP,
    M04_TIP_CONTENT,
    M04_TIP_SUBJECT,
    M04_TRAP_WARNING_CONTENT,
    M04_TRAP_WARNING_FROM,
    M04_TRAP_WARNING_SUBJECT,
} from "../content/m04.js";
import { applyDevGating, isDev, isQuestDevFocus, isQuestTesterFocus, questGate } from "../guard/flags.js";

interface M04QuestData {
    readonly leadReviewed: boolean;
    readonly vpnWhoisDone: boolean;
    readonly vpnGeoipDone: boolean;
    readonly vpnTraced: boolean;
    readonly dashboardScanned: boolean;
    readonly hiddenDashboardFound: boolean;
    readonly frameworkCveFound: boolean;
    readonly initialShellObtained: boolean;
    readonly privilegesEscalated: boolean;
    readonly identityFileListed: boolean;
    readonly boobyTrapRevealed: boolean;
    readonly safelyExtracted: boolean;
    readonly dialogStarted: boolean;
    readonly honeypotAlertSent: boolean;
    readonly reportSent: boolean;
}

const resetM04ShellFixtures = (): void => {
    Shell.removeCommandData("whois", M04_ARCHITECT_VPN_IP);
    Shell.removeCommandData("geoip", M04_ARCHITECT_VPN_IP);
    Shell.removeCommandData("nmap", M04_C2_IP);
    Shell.removeCommandData("ssh", { host: M04_NULLCROWN_IP, key: M04_HONEYPOT_PASSWORD });
    Shell.removeCommandData("ssh", { host: M04_ASHVECTOR_IP, key: M04_HONEYPOT_PASSWORD });
};

const registerM04ShellFixtures = (): void => {
    resetM04ShellFixtures();

    Shell.addCommandData("whois", M04_ARCHITECT_VPN_IP, {
        ip: M04_ARCHITECT_VPN_IP,
        contact: "Bulletproof VPN Ltd.",
        status: true,
    });
    Shell.addCommandData("geoip", M04_ARCHITECT_VPN_IP, {
        country: "Unknown",
        city: "Unknown",
        latitude: "0.0000",
        longitude: "0.0000",
    });
    Shell.addCommandData("nmap", M04_C2_IP, M04_ARCHITECT_NMAP_RESULT);
    Shell.addCommandData(
        "ssh",
        { host: M04_NULLCROWN_IP, key: M04_HONEYPOT_PASSWORD },
        { ip: M04_NULLCROWN_IP, status: "OPEN" },
    );
    Shell.addCommandData(
        "ssh",
        { host: M04_ASHVECTOR_IP, key: M04_HONEYPOT_PASSWORD },
        { ip: M04_ASHVECTOR_IP, status: "OPEN" },
    );
};

const registerM04Network = (): void => {
    if (isDev) {
        Network.destroyNetwork(M04_ARCHITECT_VPN_IP);
    }

    Network.createSubnetNetwork({
        ip: M04_ARCHITECT_VPN_IP,
        lanIp: M04_ROUTER_LAN_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: M04_FIREWALL_IP,
                lanIp: M04_FIREWALL_LAN_IP,
                type: NetworkDeviceType.Firewall,
                users: [],
                rules: [
                    { allowed: false, port: 22, destination: M04_C2_IP },
                    { allowed: false, port: 3389, destination: M04_C2_IP },
                ],
            },
            {
                ip: M04_SPLITTER_IP,
                lanIp: M04_SPLITTER_LAN_IP,
                type: NetworkDeviceType.Splitter,
                users: [],
                children: [
                    {
                        ip: M04_C2_IP,
                        lanIp: M04_C2_LAN_IP,
                        type: NetworkDeviceType.Device,
                        users: [Network.createUser({ username: "root" })],
                        ports: [{ external: 443, internal: 443, active: true, service: "https", version: "LegacyCMS 2.1" }],
                        rootFiles: [
                            {
                                name: M04_IDENTITY_FILE_NAME,
                                extension: M04_IDENTITY_FILE_EXTENSION,
                                data: M04_IDENTITY_FILE_CONTENT,
                            },
                        ],
                    },
                    {
                        ip: M04_NULLCROWN_IP,
                        lanIp: M04_NULLCROWN_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M04_NULLCROWN_CODENAME,
                        users: [
                            Network.createUser({
                                username: M04_HONEYPOT_USERNAME,
                                password: M04_HONEYPOT_PASSWORD,
                            }),
                        ],
                        ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
                        rootFiles: [
                            {
                                name: M04_HONEYPOT_DECOY_FILE_NAME,
                                extension: M04_HONEYPOT_DECOY_FILE_EXTENSION,
                                data: M04_HONEYPOT_DECOY_CONTENT,
                            },
                        ],
                    },
                    {
                        ip: M04_ASHVECTOR_IP,
                        lanIp: M04_ASHVECTOR_LAN_IP,
                        type: NetworkDeviceType.Device,
                        name: M04_ASHVECTOR_CODENAME,
                        users: [
                            Network.createUser({
                                username: M04_HONEYPOT_USERNAME,
                                password: M04_HONEYPOT_PASSWORD,
                            }),
                        ],
                        ports: [{ external: 22, internal: 22, active: true, service: "ssh" }],
                        rootFiles: [
                            {
                                name: M04_HONEYPOT_DECOY_FILE_NAME,
                                extension: M04_HONEYPOT_DECOY_FILE_EXTENSION,
                                data: M04_HONEYPOT_DECOY_CONTENT,
                            },
                        ],
                    },
                ],
            },
        ],
    });

    Network.setVulnerabilities(M04_C2_IP, [{ type: "RCE", version: "LegacyCMS 2.1" }]);
};

@RegisterQuest
export class FlatlineM04Quest extends Quest<M04QuestData> {
    override Name = "flatline.m04";
    override Title = "\"The Architect\"";
    override Description = "Confirm The Architect's real identity and decide what happens to BLACKLEDGER.";
    override Group = "storyline" as const;
    override AutoStart = true;
    override AutoComplete = true;
    override QuestsToComplete = questGate("m04", ["flatline.m03"]);
    override Rewards = (isQuestDevFocus("m04") || isQuestTesterFocus("m04")) ? { money: 0, xp: 0 } : M04_REWARDS;

    override Objectives = applyDevGating(M04_OBJECTIVES, isQuestDevFocus("m04"));
    override Dialog = M04_DIALOG;

    private connectedToArchitect = false;

    override CreateData(): M04QuestData {
        return {
            leadReviewed: false,
            vpnWhoisDone: false,
            vpnGeoipDone: false,
            vpnTraced: false,
            dashboardScanned: false,
            hiddenDashboardFound: false,
            frameworkCveFound: false,
            initialShellObtained: false,
            privilegesEscalated: false,
            identityFileListed: false,
            boobyTrapRevealed: false,
            safelyExtracted: false,
            dialogStarted: false,
            honeypotAlertSent: false,
            reportSent: false,
        };
    }

    override OnStart() {
        Mail.send({
            from: M04_DEAD_DROP_EMAIL,
            subject: M04_TIP_SUBJECT,
            content: M04_TIP_CONTENT,
        });
    }

    override OnObjectivesStart() {
        registerM04Network();
        registerM04ShellFixtures();

        Mail.registerTemplate({
            id: M04_REPORT_TEMPLATE_ID,
            label: M04_REPORT_TEMPLATE_LABEL,
            title: M04_REPORT_SUBJECT,
            content: M04_REPORT_TEMPLATE_CONTENT,
            fields: ["realName", "choice"],
        });

        this.Events.on("Mail.Read", (data) => {
            if (this.Data.leadReviewed) return;
            if (data.from !== M04_DEAD_DROP_EMAIL || data.subject !== M04_TIP_SUBJECT) return;

            this.SetData("leadReviewed", true);
            this.completeObjective(M04_OBJECTIVE_IDS.reviewLead);
        });

        this.Events.on("Terminal.Whois", (data) => {
            if (data.domain !== M04_ARCHITECT_VPN_IP) return;
            this.SetData("vpnWhoisDone", true);
            this.tryCompleteVpnTrace();
        });

        this.Events.on("Terminal.Geoip", (data) => {
            if (data !== M04_ARCHITECT_VPN_IP) return;
            this.SetData("vpnGeoipDone", true);
            this.tryCompleteVpnTrace();
        });

        this.Events.on("Terminal.NmapScan", (data) => {
            if (this.Data.dashboardScanned) return;
            if (data.ip !== M04_C2_IP || !data.versionScan) return;

            this.SetData("dashboardScanned", true);
            this.completeObjective(M04_OBJECTIVE_IDS.scanC2Dashboard);
        });

        this.Events.on("Terminal.Dirhunter", (data) => {
            if (this.Data.hiddenDashboardFound) return;

            const host = data.host.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
            if (host !== M04_C2_IP) return;
            if (!data.results.includes(M04_LEGACY_CMS_PATH)) return;

            this.SetData("hiddenDashboardFound", true);
            this.completeObjective(M04_OBJECTIVE_IDS.findHiddenDashboard);
        });

        this.Events.on("Nuclei.Results", (data) => {
            if (this.Data.frameworkCveFound) return;
            if (!data.hosts.includes(M04_C2_IP)) return;

            this.SetData("frameworkCveFound", true);
            this.completeObjective(M04_OBJECTIVE_IDS.findFrameworkCve);
        });

        this.Events.on("Metasploit.Meterpreter.Connected", (data) => {
            if (this.Data.initialShellObtained) return;
            if (data.ip !== M04_C2_IP) return;

            this.SetData("initialShellObtained", true);
            this.completeObjective(M04_OBJECTIVE_IDS.initialShellAccess);
        });

        this.Events.on("Metasploit.Rootgrab", (data) => {
            if (this.Data.privilegesEscalated) return;
            if (data.ip !== M04_C2_IP) return;
            if (!this.Data.initialShellObtained) return;

            this.SetData("privilegesEscalated", true);
            this.completeObjective(M04_OBJECTIVE_IDS.escalatePrivileges);
        });

        this.Events.on("Terminal.SSH.Connected", (data) => {
            if (data === M04_C2_IP) {
                this.connectedToArchitect = true;
                return;
            }

            if (data !== M04_NULLCROWN_IP && data !== M04_ASHVECTOR_IP) return;
            if (this.Data.honeypotAlertSent) return;

            this.SetData("honeypotAlertSent", true);
            Mail.send({
                from: M04_HONEYPOT_ALERT_FROM,
                subject: M04_HONEYPOT_ALERT_SUBJECT,
                content: M04_HONEYPOT_ALERT_CONTENT,
            });
        });

        this.Events.on("Terminal.SSH.Disconnected", (data) => {
            if (data === M04_C2_IP) this.connectedToArchitect = false;
        });

        this.Events.on("Terminal.Ls", (data) => {
            if (this.Data.identityFileListed) return;
            if (!this.connectedToArchitect && !this.Data.privilegesEscalated) return;

            this.SetData("identityFileListed", true);
            this.completeObjective(M04_OBJECTIVE_IDS.discoverIdentityFile);
        });

        this.Events.on(ATTRCHECK_REVEALED_EVENT, (data: { id: string; name: string }) => {
            if (this.Data.boobyTrapRevealed) return;
            if (data.name !== M04_IDENTITY_FILE_NAME) return;

            this.SetData("boobyTrapRevealed", true);
            this.completeObjective(M04_OBJECTIVE_IDS.revealBoobyTrap);
        });

        this.Events.on("Terminal.Cat", (data) => {
            if (data.name !== M04_IDENTITY_FILE_NAME) return;
            if (this.Data.safelyExtracted) return;

            Mail.send({
                from: M04_TRAP_WARNING_FROM,
                subject: M04_TRAP_WARNING_SUBJECT,
                content: M04_TRAP_WARNING_CONTENT,
            });
        });

        this.Events.on("Files.Transfer", (data) => {
            if (this.Data.safelyExtracted) return;
            if (data.type !== "DOWNLOAD" || data.file.name !== M04_IDENTITY_FILE_NAME) return;

            this.SetData("safelyExtracted", true);
            this.completeObjective(M04_OBJECTIVE_IDS.extractSafely);

            if (!this.Data.dialogStarted) {
                this.SetData("dialogStarted", true);
                this.createDialog("default");
            }
        });

        this.Events.on("Mail.Sent", (data) => {
            if (this.Data.reportSent) return;
            if (!this.isReport(data.subject, data.content)) return;
            if (data.to !== M04_DEAD_DROP_EMAIL) return;

            this.SetData("reportSent", true);
            this.completeObjective(M04_OBJECTIVE_IDS.finalDecision);
        });
    }

    override OnComplete() {
        this.teardown();
    }

    override OnAbandon() {
        this.teardown();
    }

    private teardown(): void {
        resetM04ShellFixtures();
        Network.destroyNetwork(M04_ARCHITECT_VPN_IP);
    }

    private tryCompleteVpnTrace(): void {
        if (this.Data.vpnTraced) return;
        if (!this.Data.vpnWhoisDone || !this.Data.vpnGeoipDone) return;

        this.SetData("vpnTraced", true);
        this.completeObjective(M04_OBJECTIVE_IDS.traceVpnIp);
    }

    private isReport(subject: string, content: string): boolean {
        if (this.isTemplateReport(subject, content)) {
            return true;
        }

        const normalizedSubject = subject.trim().toLowerCase();
        const normalizedContent = content.trim();
        if (normalizedSubject !== M04_REPORT_SUBJECT.toLowerCase()) return false;

        return (
            normalizedContent === M04_REPORT_BODY_EXPOSE ||
            normalizedContent === M04_REPORT_BODY_HANDOFF ||
            normalizedContent === M04_REPORT_BODY_DESTROY
        );
    }

    private isTemplateReport(subject: string, content: string): boolean {
        if (subject !== M04_REPORT_TEMPLATE_ID) return false;

        let fields: unknown;
        try {
            fields = JSON.parse(content);
        } catch {
            return false;
        }

        if (!fields || typeof fields !== "object") return false;

        const { realName, choice } = fields as Record<string, unknown>;
        if (realName !== M04_ARCHITECT_REAL_NAME) return false;

        return choice === M04_CHOICE_EXPOSE || choice === M04_CHOICE_HANDOFF || choice === M04_CHOICE_DESTROY;
    }
}
