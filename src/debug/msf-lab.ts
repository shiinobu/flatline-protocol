import {
    Command,
    Network,
    NetworkDeviceType,
    RegisterCommand,
    SaveStorage,
    type ChildSubnetDefinition,
    type CommandAutoComplete,
    type CommandTools,
} from "@hotbunny/hackhub-content-sdk";

interface MsfLabTarget {
    readonly key: string;
    readonly label: string;
    readonly lanIp: string;
    readonly port: number;
    readonly service: string;
    readonly module: string;
    readonly note?: string;
}

const MSF_LAB_VERSION = "1.0.0";
const MSF_LAB_LAN_BASE = "10.50.0.";

const MSF_LAB_TARGETS: readonly MsfLabTarget[] = [
    {
        key: "telnet",
        label: "Telnet digger",
        lanIp: `${MSF_LAB_LAN_BASE}2`,
        port: 23,
        service: "Telnet",
        module: "exploit/telnet/telnet_access",
        note: "internal port is a guess (23) -- confirm live",
    },
    { key: "mariadb", label: "MariaDB login", lanIp: `${MSF_LAB_LAN_BASE}3`, port: 3306, service: "MariaDB", module: "auxiliary/scanner/mysql/mysql_login" },
    { key: "vsftpd", label: "vsftpd", lanIp: `${MSF_LAB_LAN_BASE}4`, port: 21, service: "vsftpd", module: "auxiliary/dos/ftp/vsftpd" },
    { key: "ssh", label: "OpenSSH login", lanIp: `${MSF_LAB_LAN_BASE}5`, port: 22, service: "OpenSSH", module: "auxiliary/scanner/ssh/ssh_login" },
    { key: "rdp", label: "RDP exploit", lanIp: `${MSF_LAB_LAN_BASE}6`, port: 3389, service: "FreeRDP", module: "exploit/rdp/cve_2019_0708_bluekeep" },
    { key: "smtp", label: "SMTP enum", lanIp: `${MSF_LAB_LAN_BASE}7`, port: 25, service: "Postfix", module: "auxiliary/scanner/smtp/smtp_enum" },
    { key: "nginx", label: "Nginx HTTP", lanIp: `${MSF_LAB_LAN_BASE}8`, port: 80, service: "Nginx", module: "exploits/http/nginx_chunked_size" },
    { key: "apache", label: "Apache HTTP", lanIp: `${MSF_LAB_LAN_BASE}9`, port: 443, service: "Apache", module: "exploit/multi/http/apache_normalize_path_rce" },
    { key: "pop3", label: "POP3 capture", lanIp: `${MSF_LAB_LAN_BASE}10`, port: 110, service: "Dovecot-pop3d", module: "auxiliary/scanner/pop3/capture" },
    { key: "imap", label: "IMAP exploit", lanIp: `${MSF_LAB_LAN_BASE}11`, port: 143, service: "Courier", module: "auxiliary/remote/remote/imap" },
];

interface MsfLabState {
    readonly routerIp: string;
}

const MSF_LAB_STORAGE_KEY = "debug.msfLab";

const buildMsfLabChild = (target: MsfLabTarget): ChildSubnetDefinition => ({
    ip: target.lanIp,
    lanIp: target.lanIp,
    type: NetworkDeviceType.Device,
    name: `MSF-LAB: ${target.label}`,
    users: [Network.createUser({ username: "guest", online: true })],
    ports: [
        {
            external: target.port,
            internal: target.port,
            active: true,
            service: target.service,
            version: MSF_LAB_VERSION,
        },
    ],
});

const printMsfLabSheet = (tools: CommandTools, routerIp: string): void => {
    tools.println(`MSF-LAB router: ${routerIp}`);
    for (const target of MSF_LAB_TARGETS) {
        tools.println(
            `- ${target.label}: use ${target.module} | RHOST ${target.lanIp} | RPORT ${target.port} | Version ${MSF_LAB_VERSION}${target.note ? ` (${target.note})` : ""}`,
        );
    }
};

@RegisterCommand({ default: true, scope: "both" })
export class MsfLabCommand extends Command {
    CommandName = "msflab";
    Description = "debug: stand up/tear down one sandbox host per Metasploit module for live-testing";
    Autocomplete: CommandAutoComplete[] = [
        { label: "msflab", type: "STRING" },
        { label: "<up|down>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const [action] = tools.getArgs();
        const stored = SaveStorage.get<MsfLabState>(MSF_LAB_STORAGE_KEY);

        if (action === "down") {
            if (!stored?.routerIp) {
                tools.printWarning("MSF-LAB is not up.");
                return;
            }
            await Network.destroyNetwork(stored.routerIp);
            SaveStorage.remove(MSF_LAB_STORAGE_KEY);
            tools.printSuccess("MSF-LAB torn down.");
            return;
        }

        if (action !== undefined && action !== "up") {
            tools.printError("Usage: msflab [up|down]");
            return;
        }

        if (action === undefined) {
            if (stored?.routerIp) {
                printMsfLabSheet(tools, stored.routerIp);
                return;
            }
            tools.printWarning("MSF-LAB is not up. Run: msflab up");
            return;
        }

        if (stored?.routerIp) await Network.destroyNetwork(stored.routerIp);

        const routerIp = Network.randomIp();
        Network.createSubnetNetwork({
            ip: routerIp,
            type: NetworkDeviceType.Router,
            users: [],
            ports: [{ external: 80, internal: 80, active: false }],
            children: MSF_LAB_TARGETS.map(buildMsfLabChild),
        });
        SaveStorage.set(MSF_LAB_STORAGE_KEY, { routerIp } satisfies MsfLabState);

        tools.printSuccess("MSF-LAB is up.");
        printMsfLabSheet(tools, routerIp);
    }
}
