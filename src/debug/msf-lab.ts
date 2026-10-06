import {
    Command,
    Events,
    Network,
    NetworkDeviceType,
    type ChildSubnetDefinition,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";
import { registerDebugCommand } from "./debug-gate.js";

interface MsfLabTarget {
    readonly label: string;
    readonly host: number;
    readonly port: number;
    readonly protocol: string;
    readonly service: string;
    readonly module: string;
}

const MSF_LAB_REV = "r6 command-trace";
const MSF_LAB_VERSION = "1.0.0";
const MSF_LAB_ROUTER_IP = "198.18.0.1";
const MSF_LAB_IP_BASE = "198.18.0.";
const MSF_LAB_LAN_BASE = "192.168.1.";

const MSF_LAB_TARGETS: readonly MsfLabTarget[] = [
    { label: "Telnet digger", host: 2, port: 23, protocol: "telnet", service: "Telnet", module: "exploit/telnet/telnet_access" },
    { label: "MariaDB login", host: 3, port: 3306, protocol: "mysql", service: "MariaDB", module: "auxiliary/scanner/mysql/mysql_login" },
    { label: "vsftpd", host: 4, port: 21, protocol: "ftp", service: "vsftpd", module: "auxiliary/dos/ftp/vsftpd" },
    { label: "OpenSSH login", host: 5, port: 22, protocol: "ssh", service: "OpenSSH", module: "auxiliary/scanner/ssh/ssh_login" },
    { label: "RDP exploit", host: 6, port: 3389, protocol: "rdp", service: "FreeRDP", module: "exploit/rdp/cve_2019_0708_bluekeep" },
    { label: "SMTP enum", host: 7, port: 25, protocol: "smtp", service: "Postfix", module: "auxiliary/scanner/smtp/smtp_enum" },
    { label: "Nginx HTTP", host: 8, port: 80, protocol: "http", service: "Nginx", module: "exploits/http/nginx_chunked_size" },
    { label: "Apache HTTP", host: 9, port: 443, protocol: "https", service: "Apache", module: "exploit/multi/http/apache_normalize_path_rce" },
    { label: "POP3 capture", host: 10, port: 110, protocol: "pop3", service: "Dovecot-pop3d", module: "auxiliary/scanner/pop3/capture" },
    { label: "IMAP exploit", host: 11, port: 143, protocol: "imap", service: "Courier", module: "auxiliary/remote/remote/imap" },
];

const publicIpOf = (target: MsfLabTarget): string => `${MSF_LAB_IP_BASE}${target.host}`;

const lanIpOf = (target: MsfLabTarget): string => `${MSF_LAB_LAN_BASE}${target.host}`;

const isMsfLabUp = (): boolean => Network.getSubnet(MSF_LAB_ROUTER_IP) !== null;

const buildMsfLabChild = (target: MsfLabTarget): ChildSubnetDefinition => ({
    ip: publicIpOf(target),
    lanIp: lanIpOf(target),
    type: NetworkDeviceType.Device,
    name: `MSF-LAB: ${target.label}`,
    users: [Network.createUser({ username: "guest", online: true })],
    ports: [
        {
            external: target.port,
            internal: target.port,
            active: true,
            service: target.protocol,
            version: `${target.service} ${MSF_LAB_VERSION}`,
        },
    ],
});

const createMsfLab = (): void => {
    Network.createSubnetNetwork({
        ip: MSF_LAB_ROUTER_IP,
        type: NetworkDeviceType.Router,
        users: [],
        ports: [],
        children: MSF_LAB_TARGETS.map(buildMsfLabChild),
    });
    trace("MSFLAB", `up router=${MSF_LAB_ROUTER_IP} targets=${MSF_LAB_TARGETS.length}`);
};

const printMsfLabSheet = (tools: CommandTools): void => {
    tools.println(`MSF-LAB router: ${MSF_LAB_ROUTER_IP}`);
    for (const target of MSF_LAB_TARGETS) {
        tools.println(
            `- ${target.label}: use ${target.module} | RHOST ${publicIpOf(target)} | RPORT ${target.port} | Version ${MSF_LAB_VERSION}`,
        );
    }
};

const describeMsfLabRow = (host: string, port: string): string => {
    const subnet = Network.getSubnet(host);
    if (!subnet) return "target not found";

    const rows = subnet.ports.filter((row) => String(row.port) === port);
    const users = subnet.users.map((user) => user.username).join(",");
    return `type=${subnet.type} lanIp=${subnet.lanIp} users=${users} rows=${JSON.stringify(rows)}`;
};

const registerMsfLabTraceListeners = (): void => {
    Events.on("Metasploit.Use", (module) => {
        if (isMsfLabUp()) trace("MSFLAB", `use ${module.name}`);
    });

    Events.on("Metasploit.Search", (search) => {
        if (isMsfLabUp()) {
            trace("MSFLAB", `search "${search.search}" matched ${search.matchedModules.length} module(s)`);
        }
    });

    Events.on("Metasploit.SetOption", (option) => {
        if (isMsfLabUp()) {
            trace("MSFLAB", `set ${option.name}=${option.value} on ${option.module.name} allFilled=${option.allFilled}`);
        }
    });

    Events.on("Terminal.NmapScan", (scan) => {
        if (isMsfLabUp()) trace("MSFLAB", `nmap ${scan.ip} versionScan=${scan.versionScan ?? false}`);
    });

    Events.on("Metasploit.Event.Try", (attempt) => {
        if (!isMsfLabUp()) return;

        const { host, port, version } = attempt.data;
        trace(
            "MSFLAB",
            `try ${attempt.module.name} host=${host} port=${port} version=${version} ${describeMsfLabRow(String(host), String(port))}`,
        );
    });

    Events.on("Metasploit.Event", (fired) => {
        if (isMsfLabUp()) trace("MSFLAB", `success ${fired.module.name} host=${fired.data?.host}`);
    });

    Events.on("RemoteConnection.Established", (connection) => {
        if (!isMsfLabUp() || connection.t !== "METASPLOIT") return;

        trace(
            "MSFLAB",
            `session ${connection.targetIp}:${connection.targetPort ?? "-"} as ${connection.user?.username}`,
        );
    });

    Events.on("Terminal.Command", (terminalCommand) => {
        trace("MSFLAB", `command ${terminalCommand.command} args=[${terminalCommand.args.join(" ")}]`);
    });
};

if (isDebug) {
    registerMsfLabTraceListeners();
    trace("MSFLAB", `loaded rev=${MSF_LAB_REV} router=${MSF_LAB_ROUTER_IP} targets=${MSF_LAB_TARGETS.length}`);
}

@registerDebugCommand({ default: true, scope: "both" })
export class MsfLabCommand extends Command {
    CommandName = "msflab";
    Description = "debug: stand up/tear down one sandbox host per Metasploit module for live-testing";
    Autocomplete: CommandAutoComplete[] = [
        { label: "msflab", type: "STRING" },
        { label: "<up|down>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const args = tools.getArgs();
        trace("MSFLAB", `run rev=${MSF_LAB_REV} args=[${args.join(" ")}]`);
        tools.println(`msflab rev ${MSF_LAB_REV}`);

        try {
            await this.execute(tools, args[0]);
        } catch (error: unknown) {
            const reason = error instanceof Error ? error.message : String(error);
            trace("MSFLAB", `run failed: ${reason}`);
            tools.printError(`msflab failed: ${reason}`);
        }
    }

    private async execute(tools: CommandTools, action: string | undefined): Promise<void> {
        if (action !== undefined && action !== "up" && action !== "down") {
            tools.printError("Usage: msflab [up|down]");
            return;
        }

        if (action === "down") {
            if (!isMsfLabUp()) {
                tools.printWarning("MSF-LAB is not up.");
                return;
            }
            await Network.destroyNetwork(MSF_LAB_ROUTER_IP);
            trace("MSFLAB", `down router=${MSF_LAB_ROUTER_IP}`);
            tools.printSuccess("MSF-LAB torn down.");
            return;
        }

        if (action === undefined) {
            if (!isMsfLabUp()) {
                tools.printWarning("MSF-LAB is not up. Run: msflab up");
                return;
            }
            printMsfLabSheet(tools);
            return;
        }

        if (isMsfLabUp()) {
            tools.printWarning("MSF-LAB is already up. Run: msflab down");
            return;
        }

        createMsfLab();

        tools.printSuccess("MSF-LAB is up.");
        printMsfLabSheet(tools);
    }
}
