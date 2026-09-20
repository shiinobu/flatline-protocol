import {
    Database,
    type DynamicWebsitePageDefinition,
    Network,
    NetworkDeviceType,
    type NetworkVulnerability,
    type PageContext,
    type PageMetadata,
    Quest,
    type QuestObjectiveDefinition,
    RegisterQuest,
    RegisterWebsite,
    Website,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";

const SCRATCH_ROUTER_IP = "192.0.2.101";
const SCRATCH_NESTED_IP = "192.0.2.102";
const SCRATCH_NESTED_DOMAIN = "scratch-sqli-nested.corp";
const SCRATCH_VULNS: NetworkVulnerability[] = [{ type: "SQL_INJECTION" }];

const scratchPage = (label: string): DynamicWebsitePageDefinition => ({
    path: "/",
    metadata: (_context: PageContext): PageMetadata => ({
        title: `Scratch — ${label}`,
        description: "Debug-only placeholder page.",
        html: `<h1>${label}</h1><p>Isolating whether a registered Website is required for sqlmap to detect Network vulnerabilities, independent of nesting.</p>`,
    }),
});

@RegisterWebsite
export class ScratchNestedWebsite extends Website {
    override SiteName = "Scratch Nested";
    override Host = SCRATCH_NESTED_DOMAIN;
    override Icon = "";
    override Pages: DynamicWebsitePageDefinition[] = [scratchPage("nested child Device")];
}

const SCRATCH_FIREWALL_ROUTER_IP = "192.0.2.211";
const SCRATCH_FIREWALL_IP = "192.0.2.210";
const SCRATCH_FIREWALL_LAN_IP = "10.99.0.1";
const SCRATCH_FIREWALL_USERNAME = "scratchadmin";
const SCRATCH_FIREWALL_PASSWORD = "kimai-test-pw";

interface ScratchQuestData {
    readonly ready: boolean;
    readonly kimaiRan: boolean;
}

@RegisterQuest
export class FlatlineScratchQuest extends Quest<ScratchQuestData> {
    override Name = "flatline.scratch";
    override Title = "Scratch — SQL_INJECTION detection isolation";
    override Description =
        "Debug-only quest isolating whether a nested-child Network device supports sqlmap SQL_INJECTION detection the same as a flat top-level device, now that both are backed by a real registered Website. Also isolates the REAL built-in Kimai tool against a scratch Firewall-type device, ahead of relying on it for M01 (no custom capture logic needed — Kimai only works against type:Firewall targets and leaks that node's own users[0] credential as a signed token).";
    override AutoStart = isDebug;
    override AutoComplete = false;
    override Objectives: QuestObjectiveDefinition[] = [
        { name: "scratch.ready", description: "Scratch test environment" },
        {
            name: "scratch.kimai-ran",
            description:
                `Get kimai.py the normal way, open Wireshark and start capturing, then run: python3 kimai.py ${SCRATCH_FIREWALL_IP}`,
        },
        {
            name: "scratch.kimai-decoded",
            description:
                `Find the "Cookie" packet in Wireshark, copy its token, then run: python3 jwt_decoder.py <token> — should reveal ${SCRATCH_FIREWALL_USERNAME}/${SCRATCH_FIREWALL_PASSWORD}`,
        },
    ];

    override CreateData(): ScratchQuestData {
        return { ready: true, kimaiRan: false };
    }

    override OnObjectivesStart() {
        try {
            Network.createSubnetNetwork({
                ip: SCRATCH_ROUTER_IP,
                type: NetworkDeviceType.Router,
                users: [],
                ports: [],
                children: [
                    {
                        ip: SCRATCH_NESTED_IP,
                        type: NetworkDeviceType.Device,
                        name: "Scratch Nested Target",
                        domain: { name: SCRATCH_NESTED_DOMAIN, vulnerabilities: SCRATCH_VULNS },
                        ports: [
                            { external: 443, internal: 443, active: true, service: "https" },
                            { external: 3306, internal: 3306, active: true, service: "mysql", version: "mariadb" },
                        ],
                        users: [],
                    },
                ],
            });
            trace("scratch-quest", "step=createSubnetNetwork:done (no-op if address already existed)");

            Network.removePort(SCRATCH_ROUTER_IP, 3306);
            Network.addPort(SCRATCH_NESTED_IP, {
                external: 3306,
                internal: 3306,
                active: true,
                service: "mysql",
                version: "mariadb",
            });
            Network.setVulnerabilities(SCRATCH_NESTED_IP, SCRATCH_VULNS);
            trace("scratch-quest", "step=reconcile:done (forced port+vuln to current desired state)");

            trace("scratch-quest", `router-state=${JSON.stringify(Network.getSubnet(SCRATCH_ROUTER_IP))}`);
            trace("scratch-quest", `nested-state=${JSON.stringify(Network.getSubnet(SCRATCH_NESTED_IP))}`);

            Database.create({
                host: SCRATCH_NESTED_IP,
                user: "test",
                password: "test",
                tables: {
                    users: [
                        { id: { value: 1, type: "number" }, username: { value: "admin", type: "string" } },
                    ],
                },
            });
            trace("scratch-quest", "step=Database.create:done");

            trace(
                "scratch-quest",
                `flat=nested=${SCRATCH_NESTED_DOMAIN} ` +
                    `(${SCRATCH_NESTED_IP} under router ${SCRATCH_ROUTER_IP}) — both now have a real Website. ` +
                    `Test: sqlmap -u https://${SCRATCH_NESTED_DOMAIN}/ -tables`,
            );

            Network.destroyNetwork(SCRATCH_FIREWALL_ROUTER_IP);
            Network.createSubnetNetwork({
                ip: SCRATCH_FIREWALL_ROUTER_IP,
                type: NetworkDeviceType.Router,
                users: [],
                ports: [],
                children: [
                    {
                        ip: SCRATCH_FIREWALL_IP,
                        lanIp: SCRATCH_FIREWALL_LAN_IP,
                        type: NetworkDeviceType.Firewall,
                        users: [
                            Network.createUser({
                                username: SCRATCH_FIREWALL_USERNAME,
                                password: SCRATCH_FIREWALL_PASSWORD,
                            }),
                        ],
                        rules: [{ allowed: false, port: 9999 }],
                    },
                ],
            });
            trace(
                "scratch-quest",
                `step=kimai-setup:done firewall=${SCRATCH_FIREWALL_IP} type=Firewall users[0]=${SCRATCH_FIREWALL_USERNAME}/${SCRATCH_FIREWALL_PASSWORD} — ` +
                    `get kimai.py the normal way, open Wireshark and start capturing FIRST, then run: python3 kimai.py ${SCRATCH_FIREWALL_IP}`,
            );
            trace("scratch-quest", `firewall-router-state=${JSON.stringify(Network.getSubnet(SCRATCH_FIREWALL_ROUTER_IP))}`);
            trace("scratch-quest", `firewall-state=${JSON.stringify(Network.getSubnet(SCRATCH_FIREWALL_IP))}`);
        } catch (error) {
            trace("scratch-quest", `step=ERROR ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
        }

        this.Events.on("Python3.ExecFile", (data) => {
            if (data.file.name === "kimai" && data.args[0] === SCRATCH_FIREWALL_IP) {
                this.SetData("kimaiRan", true);
                this.completeObjective("scratch.kimai-ran");
                trace(
                    "scratch-quest",
                    "step=kimai-ran:file+args matched — this only proves the command was invoked, not that Kimai found the target. " +
                        `firewall-state-at-run-time=${JSON.stringify(Network.getSubnet(SCRATCH_FIREWALL_IP))}`,
                );
                return;
            }

            if (data.file.name === "jwt_decoder" && data.args.length === 1) {
                if (!this.Data.kimaiRan) return;

                this.completeObjective("scratch.kimai-decoded");
                trace(
                    "scratch-quest",
                    `step=kimai-decoded:ran jwt_decoder.py ${data.args[0]} — confirm the printed output shows ` +
                        `${SCRATCH_FIREWALL_USERNAME}/${SCRATCH_FIREWALL_PASSWORD}`,
                );
            }
        });
    }
}
