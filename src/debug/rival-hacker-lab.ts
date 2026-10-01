import {
    Bank,
    Command,
    Events,
    Files,
    Mail,
    Quest,
    SaveStorage,
    Scheduler,
    Time,
    UI,
    type CommandAutoComplete,
    type CommandTools,
    type QuestObjectiveDefinition,
} from "@hotbunny/hackhub-content-sdk";

import { isDebug } from "../guard/flags.js";
import { trace } from "../helpers/logger.js";
import { registerDebugCommand, registerDebugQuest } from "./debug-gate.js";
import { dismissIncidentBanner, resolveIncidentBanner, showIncidentBanner } from "./rival-banner.js";
import { dismissBreach, isBreachActive, startBreach } from "./rival-breach.js";

declare module "@hotbunny/hackhub-content-sdk" {
    interface ModEventMap {
        "flatline.rivalStrikeStarted": RivalStrikePayload;
        "flatline.rivalRepelled": { ip: string };
    }
}

interface RivalStrikePayload {
    ip: string;
    alias: string;
}

interface RivalHackerData {
    attackerIp: string | null;
    attackerAlias: string | null;
}

const RIVAL_TICK_JOB = "flatline.rivalTick";
const RIVAL_DEADLINE_JOB = "flatline.rivalDeadline";
const RIVAL_STRIKE_EVENT = "flatline.rivalStrikeStarted";
const RIVAL_REPELLED_EVENT = "flatline.rivalRepelled";
const RIVAL_BOOTSTRAPPED_KEY = "rivalBootstrapped";

const HEAT_KEY = "rivalHeat";
const LAST_STRIKE_KEY = "rivalLastStrikeAt";
const FIRST_STRIKE_KEY = "rivalFirstStrikeDone";
const ACTIVE_ATTACKER_KEY = "rivalActiveAttackerIp";
const ACTIVE_ALIAS_KEY = "rivalActiveAttackerAlias";

const TICK_REAL_MS = 15_000;
const DEADLINE_REAL_MS = 60_000;
const STRIKE_COOLDOWN_REAL_MS = 45_000;
const STRIKE_THRESHOLD_HEAT = 50;
const HEAT_DECAY_PER_TICK = 2;
const HEAT_GAIN_ON_STRIKE = 15;
const HEAT_RELIEF_ON_REPEL = 20;
const FAILURE_WITHDRAWAL_AMOUNT = 250;
const REPEL_REWARD_AMOUNT = 100;

const RIVAL_IDENTITIES: readonly { alias: string; ip: string }[] = [
    { alias: "TR4C3#404", ip: "185.220.101.7" },
    { alias: "the Custodian", ip: "45.61.184.22" },
    { alias: "GHOSTWIRE", ip: "91.203.145.19" },
];

const getHeat = (): number => SaveStorage.get<number>(HEAT_KEY) ?? 0;
const setHeat = (value: number): void => SaveStorage.set(HEAT_KEY, Math.max(0, Math.min(100, value)));
const getLastStrikeAt = (): number => SaveStorage.get<number>(LAST_STRIKE_KEY) ?? 0;
const hasFirstStrikeHappened = (): boolean => SaveStorage.get<boolean>(FIRST_STRIKE_KEY) ?? false;
const getActiveAttackerIp = (): string | null => SaveStorage.get<string | null>(ACTIVE_ATTACKER_KEY) ?? null;

const clearActiveAttacker = (): void => {
    SaveStorage.set(ACTIVE_ATTACKER_KEY, null);
    SaveStorage.set(ACTIVE_ALIAS_KEY, null);
};

const pickRivalIdentity = (): { alias: string; ip: string } =>
    RIVAL_IDENTITIES[Math.floor(Math.random() * RIVAL_IDENTITIES.length)];

const senderAddress = (alias: string): string => `${alias.toLowerCase().replace(/[^a-z0-9]/g, "")}@darknull.io`;

const strikeChance = (heat: number): number =>
    Math.max(0, Math.min(1, ((heat - STRIKE_THRESHOLD_HEAT) / 50) * 0.5));

const beginStrike = (): void => {
    const identity = pickRivalIdentity();
    SaveStorage.set(ACTIVE_ATTACKER_KEY, identity.ip);
    SaveStorage.set(ACTIVE_ALIAS_KEY, identity.alias);
    SaveStorage.set(LAST_STRIKE_KEY, Time.now());
    SaveStorage.set(FIRST_STRIKE_KEY, true);
    setHeat(getHeat() + HEAT_GAIN_ON_STRIKE);

    Scheduler.schedule(RIVAL_DEADLINE_JOB, { ip: identity.ip }, { realMs: DEADLINE_REAL_MS }, RIVAL_DEADLINE_JOB);
    showIncidentBanner({ ip: identity.ip, alias: identity.alias, totalRealMs: DEADLINE_REAL_MS });

    Mail.send({
        from: senderAddress(identity.alias),
        subject: "you left a door open",
        content:
            `saw your traffic, ${identity.ip} is already through your firewall logs.\n` +
            `run "repel ${identity.ip}" before I finish, if you can find me.`,
    });

    Events.emit(RIVAL_STRIKE_EVENT, { ip: identity.ip, alias: identity.alias });
    UI.toast(`Unusual activity on your firewall - something from ${identity.ip} is pushing in.`, "warning");
    trace("RIVALLAB", `strike started ip=${identity.ip} alias=${identity.alias}`);
};

const compromiseDesktop = async (intruder: { alias: string; ip: string }): Promise<boolean> => {
    if (!(await startBreach(intruder))) return false;

    Mail.send({
        from: senderAddress(intruder.alias),
        subject: "nice desktop",
        content:
            "compositor unloaded, display config rewritten.\n" +
            "the logs are still there if you want your desktop back. sysdiag will show you where to start.",
    });
    return true;
};

const resolveDeadlineExpired = async (ip: string): Promise<void> => {
    if (getActiveAttackerIp() !== ip) return;

    const alias = SaveStorage.get<string | null>(ACTIVE_ALIAS_KEY) ?? "unknown";
    Bank.withdraw({ amount: FAILURE_WITHDRAWAL_AMOUNT, description: "Unauthorized transfer - rival hacker" });
    setHeat(getHeat() + HEAT_GAIN_ON_STRIKE);
    clearActiveAttacker();
    resolveIncidentBanner("breached", FAILURE_WITHDRAWAL_AMOUNT);
    UI.toast(`Too slow - ${ip} got out with $${FAILURE_WITHDRAWAL_AMOUNT}.`, "error");
    trace("RIVALLAB", `deadline expired ip=${ip} withdrawal=${FAILURE_WITHDRAWAL_AMOUNT}`);
    await compromiseDesktop({ ip, alias });
};

const runTick = (): void => {
    if (getActiveAttackerIp() === null && !isBreachActive()) {
        setHeat(getHeat() - HEAT_DECAY_PER_TICK);

        if (!hasFirstStrikeHappened()) {
            if (getHeat() >= STRIKE_THRESHOLD_HEAT) beginStrike();
        } else {
            const cooledDown = Time.now() - getLastStrikeAt() >= Time.toGameMs(STRIKE_COOLDOWN_REAL_MS);
            if (cooledDown && Math.random() < strikeChance(getHeat())) beginStrike();
        }
    }

    Scheduler.schedule(RIVAL_TICK_JOB, {}, { realMs: TICK_REAL_MS });
};

if (isDebug) {
    Scheduler.register<{ ip: string }>(RIVAL_DEADLINE_JOB, (payload) => resolveDeadlineExpired(payload.ip));
    Scheduler.register(RIVAL_TICK_JOB, runTick);

    Events.on("Game.SessionStarted", () => {
        if (SaveStorage.get<boolean>(RIVAL_BOOTSTRAPPED_KEY)) return;
        SaveStorage.set(RIVAL_BOOTSTRAPPED_KEY, true);
        Scheduler.schedule(RIVAL_TICK_JOB, {}, { realMs: TICK_REAL_MS });
        trace("RIVALLAB", "tick loop bootstrapped");
    });
}

trace("RIVALLAB", `loaded debug=${isDebug}`);

@registerDebugQuest
export class RivalHackerStrike extends Quest<RivalHackerData> {
    override Name = "RivalHackerStrike";
    override Title = "Incoming Intrusion";
    override Description = "Someone is pushing on your own firewall. Find them before they finish.";
    override Group = "side" as const;
    override AutoStart = true;
    override AutoComplete = true;

    override Objectives: QuestObjectiveDefinition[] = [
        {
            name: "detect",
            description: "Unknown activity on your own network.",
            hidden: true,
            trigger: { event: RIVAL_STRIKE_EVENT, condition: () => true },
        },
        {
            name: "repel",
            description: "Run repel <ip> against the intruder before they finish.",
            unlocksAfter: ["detect"],
            trigger: {
                event: RIVAL_REPELLED_EVENT,
                condition: (data: { ip: string }) => data.ip === this.Data.attackerIp,
            },
        },
    ];

    override CreateData(): RivalHackerData {
        return { attackerIp: null, attackerAlias: null };
    }

    override OnObjectivesStart() {
        this.Events.on(RIVAL_STRIKE_EVENT, (data: RivalStrikePayload) => {
            this.SetData("attackerIp", data.ip);
            this.SetData("attackerAlias", data.alias);
        });
    }

    override OnComplete() {
        trace("RIVALLAB", `quest objective chain completed ip=${this.Data.attackerIp}`);
    }
}

@registerDebugCommand({ default: true, scope: "both" })
export class RepelCommand extends Command {
    CommandName = "repel";
    Description = "Block an intruder currently breaching your own firewall";
    Autocomplete: CommandAutoComplete[] = [
        { label: "repel", type: "STRING" },
        { label: "<ip>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const [ip] = tools.getArgs();
        if (!ip) {
            tools.printError("Usage: repel <ip>");
            return;
        }

        const activeIp = getActiveAttackerIp();
        if (activeIp === null) {
            tools.printWarning("No active intrusion detected.");
            return;
        }

        if (ip !== activeIp) {
            tools.printError(`${ip} is not the intruder. Check your firewall logs again.`);
            return;
        }

        Scheduler.cancel(RIVAL_DEADLINE_JOB);
        clearActiveAttacker();
        setHeat(getHeat() - HEAT_RELIEF_ON_REPEL);
        Bank.transaction({ amount: REPEL_REWARD_AMOUNT, description: "Bounty - repelled a rival intrusion" });
        resolveIncidentBanner("severed", REPEL_REWARD_AMOUNT);

        tools.printSuccess(`Connection from ${ip} severed. +$${REPEL_REWARD_AMOUNT}.`);
        UI.toast(`Intruder locked out. +$${REPEL_REWARD_AMOUNT}.`, "success");
        Events.emit(RIVAL_REPELLED_EVENT, { ip });
    }
}

const printStatus = (tools: CommandTools): void => {
    const remainingGameMs = Scheduler.remaining(RIVAL_DEADLINE_JOB);
    const remainingRealSeconds = remainingGameMs === null ? null : Math.round(Time.toRealMs(remainingGameMs) / 1000);
    tools.println(`heat: ${getHeat()}/100`);
    tools.println(`first strike done: ${hasFirstStrikeHappened()}`);
    tools.println(`active attacker: ${getActiveAttackerIp() ?? "none"}`);
    tools.println(`deadline remaining: ${remainingRealSeconds === null ? "n/a" : `~${remainingRealSeconds}s`}`);
    tools.println(`desktop breach: ${isBreachActive() ? "ACTIVE" : "none"}`);
};

const applyHeatArgument = (tools: CommandTools, value: string | undefined): void => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        tools.printError("Usage: rivallab heat <0-100>");
        return;
    }
    setHeat(parsed);
    tools.printSuccess(`heat set to ${getHeat()}`);
};

const forceStrike = (tools: CommandTools): void => {
    if (getActiveAttackerIp() !== null) {
        tools.printWarning("An intrusion is already active.");
        return;
    }
    if (isBreachActive()) {
        tools.printWarning("The desktop is in recovery mode. Run: rivallab reset");
        return;
    }
    beginStrike();
    tools.printSuccess("Forced a rival strike.");
};

const forceBreach = async (tools: CommandTools): Promise<void> => {
    if (Files.isRemoteSession()) {
        tools.printError("Disconnect from the remote host first.");
        return;
    }
    if (isBreachActive()) {
        tools.printWarning("The desktop is already compromised.");
        return;
    }
    if (await compromiseDesktop(pickRivalIdentity())) tools.printSuccess("Forced a desktop breach.");
    else tools.printError("Breach failed. Check the game log.");
};

const resetAll = (tools: CommandTools): void => {
    Scheduler.cancel(RIVAL_DEADLINE_JOB);
    setHeat(0);
    SaveStorage.set(FIRST_STRIKE_KEY, false);
    clearActiveAttacker();
    dismissIncidentBanner();
    dismissBreach();
    tools.printSuccess("Rival-hacker state reset.");
};

@registerDebugCommand({ default: true, scope: "both" })
export class RivalLabCommand extends Command {
    CommandName = "rivallab";
    Description = "debug: inspect/force the rival-hacker background loop";
    Autocomplete: CommandAutoComplete[] = [
        { label: "rivallab", type: "STRING" },
        { label: "<status|heat|strike|breach|reset>", type: "STRING" },
    ];

    async Run(tools: CommandTools) {
        const [action, value] = tools.getArgs();
        trace("RIVALLAB", `run action=${action ?? "status"}`);

        switch (action) {
            case undefined:
            case "status":
                return printStatus(tools);
            case "heat":
                return applyHeatArgument(tools, value);
            case "strike":
                return forceStrike(tools);
            case "breach":
                return forceBreach(tools);
            case "reset":
                return resetAll(tools);
            default:
                tools.printError("Usage: rivallab <status|heat|strike|breach|reset>");
        }
    }
}
