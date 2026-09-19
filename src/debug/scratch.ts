import {
    Network,
    NetworkDeviceType,
    type NetworkVulnerability,
    Quest,
    type QuestEvents,
    type QuestObjectiveDefinition,
    RegisterQuest,
    Shell,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/dev-flag.js";
import { trace } from "../helpers/logger.js";

const SCRATCH_USERNAME = "test";
const SCRATCH_PASSWORD = "test";
const SCRATCH_FTP_DATA = "230 Login successful. scratch.txt (12 bytes)";

const ACTIVE_EXPERIMENT: number = 9;

const registerFtpFixture = (ip: string): void => {
    Shell.addCommandData(
        "ftp",
        { host: ip, username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD },
        SCRATCH_FTP_DATA,
    );
};

const runDiagnosticLogExperiment = (): void => {
    const ip = "192.0.2.10";
    Network.destroyNetwork(ip);
    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Router,
        users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
        ports: [{ external: 21, internal: 21, active: true, service: "ftp" }],
        children: [],
    });
    Network.removeFirewallRule(ip, 21);
    Network.addFirewallRule(ip, { allowed: true, port: 21 });
    registerFtpFixture(ip);
    trace("scratch-1-diagnostic", `ip=${ip} firewall=${JSON.stringify(Network.getFirewall(ip))}`);
    trace("scratch-1-diagnostic", `isRequestBlocked(21)=${Network.isRequestBlocked(ip, 21)}`);
};

const runOpenPortExperiment = (): void => {
    const ip = "192.0.2.20";
    Network.destroyNetwork(ip);
    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Router,
        users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
        ports: [{ external: 21, internal: 21, active: false, service: "ftp" }],
        children: [],
    });
    Network.openPort(ip, 21);
    registerFtpFixture(ip);
    trace("scratch-2-openport", `ip=${ip} openPort(21) called after create`);
};

const runDeviceChildExperiment = (): void => {
    const routerIp = "192.0.2.30";
    const deviceIp = "192.0.2.31";
    Network.destroyNetwork(routerIp);
    Network.createSubnetNetwork({
        ip: routerIp,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: [
            {
                ip: deviceIp,
                type: NetworkDeviceType.Device,
                users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
                ports: [{ external: 21, internal: 21, active: true, service: "ftp" }],
            },
        ],
    });
    registerFtpFixture(deviceIp);
    trace("scratch-3-device-child", `router=${routerIp} device=${deviceIp} (ftp against device ip)`);
};

const runRandomIpExperiment = (): void => {
    const ip = Network.randomIp();
    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Router,
        users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
        ports: [{ external: 21, internal: 21, active: true, service: "ftp" }],
        children: [],
    });
    registerFtpFixture(ip);
    trace("scratch-4-random-ip", `generated ip=${ip} — use this exact ip in-game`);
};

const runSshControlExperiment = (): void => {
    const ip = "192.0.2.50";
    Network.destroyNetwork(ip);
    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Router,
        users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
        ports: [
            { external: 21, internal: 21, active: true, service: "ftp" },
            { external: 22, internal: 22, active: true, service: "ssh" },
        ],
        children: [],
    });
    registerFtpFixture(ip);
    Shell.addCommandData(
        "ssh",
        { host: ip, key: SCRATCH_PASSWORD },
        { ip, status: "OPEN" },
    );
    trace("scratch-5-ssh-control", `ip=${ip} — compare "ftp -h ${ip} -u ${SCRATCH_USERNAME} -p ${SCRATCH_PASSWORD}" vs "ssh -h ${SCRATCH_USERNAME}@${ip}"`);
};

const runRandomRouterDomainChildExperiment = (): void => {
    const routerIp = Network.randomIp();
    const deviceIp = Network.randomIp();
    Network.createSubnetNetwork({
        ip: routerIp,
        type: NetworkDeviceType.Router,
        users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
        ports: [{ external: 80, internal: 80, active: true, service: "http" }],
        domain: { name: "scratch-test.corp" },
        children: [
            {
                ip: deviceIp,
                type: NetworkDeviceType.Device,
                users: [Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD })],
                ports: [{ external: 21, internal: 21, active: true, service: "ftp" }],
            },
        ],
    });
    registerFtpFixture(deviceIp);
    trace("scratch-6-random-domain-child", `router=${routerIp} device=${deviceIp} domain=scratch-test.corp — ftp against device ip`);
};

const runMetasploitExperiment = (events: QuestEvents): void => {
    const ip = "192.0.2.70";
    Network.destroyNetwork(ip);
    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [{ external: 21, internal: 21, active: true, service: "ftp" }],
        children: [],
    });
    Network.setVulnerabilities(ip, [{ type: "RCE" }]);

    events.on("Metasploit.Search", (data) => trace("scratch-7-metasploit", `Search: ${JSON.stringify(data)}`));
    events.on("Metasploit.Use", (data) => trace("scratch-7-metasploit", `Use: ${JSON.stringify(data)}`));
    events.on("Metasploit.SetOption", (data) => trace("scratch-7-metasploit", `SetOption: ${JSON.stringify(data)}`));
    events.on("Metasploit.Event", (data) => trace("scratch-7-metasploit", `Event: ${JSON.stringify(data)}`));
    events.on("Metasploit.Rootgrab", (data) => trace("scratch-7-metasploit", `Rootgrab: ${JSON.stringify(data)}`));
    events.on("Metasploit.Meterpreter.Connected", (data) => trace("scratch-7-metasploit", `Meterpreter.Connected: ${JSON.stringify(data)}`));
    events.on("Meterpreter.Download", (data) => trace("scratch-7-metasploit", `Meterpreter.Download: ${JSON.stringify(data)}`));

    trace("scratch-7-metasploit", `ip=${ip} tagged RCE — search/use/set RHOST/run a metasploit module against it`);
};

const runFixedTargetExperiment = async (events: QuestEvents): Promise<void> => {
    const ip = "192.0.2.80";
    const domain = "scratch-fixed.corp";
    const vulns: NetworkVulnerability[] = [{ type: "RCE" }];

    await Network.destroyNetwork(ip);

    Network.createSubnetNetwork({
        ip,
        type: NetworkDeviceType.Device,
        name: "Scratch Fixed Target",
        domain: { name: domain, vulnerabilities: vulns },
        ports: [
            { external: 21, internal: 21, active: true, service: "ftp", version: "vsftpd 2.3.4" },
        ],
        users: [
            Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD, online: true }),
        ],
    });

    Network.registerDomain(domain, ip, vulns);
    Network.setVulnerabilities(ip, vulns);

    registerFtpFixture(ip);

    events.on("Metasploit.Rootgrab", (data) => trace("scratch-8-fixed-retest", `Rootgrab: ${JSON.stringify(data)}`));
    events.on("Metasploit.Event", (data) => trace("scratch-8-fixed-retest", `Event: ${JSON.stringify(data)}`));
    events.on("Meterpreter.Download", (data) => trace("scratch-8-fixed-retest", `Meterpreter.Download: ${JSON.stringify(data)}`));

    trace(
        "scratch-8-fixed-retest",
        `ip=${ip} domain=${domain} version-tagged + triple-vuln + awaited destroy — retry "ftp -h ${ip} -u ${SCRATCH_USERNAME} -p ${SCRATCH_PASSWORD}" and the vsftpd metasploit module`,
    );
};

const runGuardedNoDestroyExperiment = (events: QuestEvents): void => {
    const ip = "192.0.2.90";
    const domain = "scratch-guarded.corp";
    const vulns: NetworkVulnerability[] = [{ type: "RCE" }];

    if (!Network.getSubnet(ip)) {
        Network.createSubnetNetwork({
            ip,
            type: NetworkDeviceType.Device,
            name: "Scratch Guarded Target",
            domain: { name: domain, vulnerabilities: vulns },
            ports: [
                { external: 21, internal: 21, active: true, service: "ftp", version: "vsftpd 2.3.4" },
            ],
            users: [
                Network.createUser({ username: SCRATCH_USERNAME, password: SCRATCH_PASSWORD, online: true }),
            ],
        });
    }

    Network.registerDomain(domain, ip, vulns);
    Network.setVulnerabilities(ip, vulns);

    registerFtpFixture(ip);

    events.on("Metasploit.Rootgrab", (data) => trace("scratch-9-guarded", `Rootgrab: ${JSON.stringify(data)}`));
    events.on("Metasploit.Event", (data) => trace("scratch-9-guarded", `Event: ${JSON.stringify(data)}`));
    events.on("Meterpreter.Download", (data) => trace("scratch-9-guarded", `Meterpreter.Download: ${JSON.stringify(data)}`));

    trace("scratch-9-guarded", `ip=${ip} existed=${Boolean(Network.getSubnet(ip))} — never destroyed, guarded create, domain/vuln reattached every call`);
};

interface ScratchQuestData {
    readonly ready: boolean;
}

@RegisterQuest
export class FlatlineScratchQuest extends Quest<ScratchQuestData> {
    override Name = "flatline.scratch";
    override Title = "Scratch — network isolation test";
    override Description = "Debug-only quest for isolating the ftp routing issue. Not part of the story.";
    override AutoStart = isDebug;
    override AutoComplete = false;
    override Objectives: QuestObjectiveDefinition[] = [
        { name: "scratch.ready", description: "Scratch test environment" },
    ];

    override CreateData(): ScratchQuestData {
        return { ready: true };
    }

    override OnObjectivesStart() {
        trace("scratch-quest", `OnObjectivesStart running experiment=${ACTIVE_EXPERIMENT}`);

        if (ACTIVE_EXPERIMENT === 1) runDiagnosticLogExperiment();
        if (ACTIVE_EXPERIMENT === 2) runOpenPortExperiment();
        if (ACTIVE_EXPERIMENT === 3) runDeviceChildExperiment();
        if (ACTIVE_EXPERIMENT === 4) runRandomIpExperiment();
        if (ACTIVE_EXPERIMENT === 5) runSshControlExperiment();
        if (ACTIVE_EXPERIMENT === 6) runRandomRouterDomainChildExperiment();
        if (ACTIVE_EXPERIMENT === 7) runMetasploitExperiment(this.Events);
        if (ACTIVE_EXPERIMENT === 8) void runFixedTargetExperiment(this.Events);
        if (ACTIVE_EXPERIMENT === 9) runGuardedNoDestroyExperiment(this.Events);
    }
}
