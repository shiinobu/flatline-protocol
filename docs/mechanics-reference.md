# HackHub — Hacking Tools & Commands Reference

**Scope: global, not tied to any single mission.** This is the one place
that tracks (1) every hacking/security tool HackHub's SDK exposes natively,
and (2) every custom terminal command this project has built. Update this
file whenever a mission introduces or confirms a new tool.

## How to read this doc

- **Native** — built into HackHub itself. We only supply data (via
  `Shell.addCommandData`), network/user declarations (via
  `Network.createSubnetNetwork`), or listen to the tool's event(s). We do not
  own or control the tool's internal behavior.
- **Custom** — a command this project wrote from scratch as a `Command`
  subclass registered with `@RegisterCommand`. We own 100% of its logic.
- **Source of truth for the Master Tool Registry below**:
  `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts`, specifically the
  `ModEventMap` interface (event names HackHub's native tools fire) and the
  `Shell.CommandDataMap` interface (built-in commands that accept typed
  `Shell.addCommandData` responses). This is bundled with the project itself
  — re-grep that file directly if the SDK version ever changes; do not rely
  on external wikis for this list.

## 1. Master Tool Registry (every native hacking tool the SDK exposes)

### Recon / info-gathering

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `nmap` | `Terminal.NmapScan`, `CommandDataMap.nmap` | Port/service scan against an IP |
| `lynx` | `Terminal.Lynx.Search`, `Terminal.Lynx.Lookup`, `CommandDataMap.lynx` | Terminal-based web browsing/lookup |
| `nslookup` | `Terminal.Nslookup`, `CommandDataMap.nslookup` | Resolve a hostname to an IP |
| `whois` | `Terminal.Whois`, `CommandDataMap.whois` | Domain/IP registration lookup |
| `mxlookup` | `Terminal.Mxlookup`, `CommandDataMap.mxlookup` | Mail-exchange record lookup |
| `dig` | `Terminal.Dig` | DNS record lookup |
| `geoip` | `Terminal.Geoip`, `CommandDataMap.geoip` | Geolocate an IP |
| `ifconfig` | `Terminal.Ifconfig` | Show the player's own network interface/IP |
| `dirhunter` | `Terminal.Dirhunter` (`{host, results}`) | Enumerate hidden paths on a web host |
| `subfinder` | `Subfinder.Try`, `Subfinder.Results` | Subdomain enumeration |
| `nuclei` | `Nuclei.Item`, `Nuclei.Results` | Templated vulnerability scanning |

### Access / connection

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `ssh` | `Terminal.SSH.Connected`/`.Disconnected`/`.FileDownload`/`.Shutdown`, `CommandDataMap.ssh` | Remote shell session — requires `-h [user@ip]` syntax, not a bare IP |
| `ftp` | `Terminal.FTP.Connect`, `CommandDataMap.ftp` | File transfer session |
| `weechat` | `WeeChat.Connected`/`.Disconnected`/`.Message`, `CommandDataMap.weechat` | IRC chat client |

### Password / credential attacks

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `hydra` | `Terminal.Hydra`, `Terminal.Hydra.Try`, `CommandDataMap.hydra` | Online brute-force login |
| `hashcat` | `Hashcat` | GPU hash cracking |
| `john` | `John.DecryptHash` | Wordlist-based hash cracking (John the Ripper) |
| `fern` | `Fern.FindPassword` | WiFi password recovery |

### Network attack / MITM

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `bettercap` | `Bettercap.Open`/`.Close`/`.NetProbe`/`.NetShow`/`.WifiRecon`/`.WifiDeAuth` | Network MITM / WiFi recon & deauth |
| `wireshark` | `Wireshark.Started`/`.Stopped` | Packet capture |

### Exploitation

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `metasploit` / `msfconsole` | `Metasploit.Event`, `.Search`, `.Use`, `.Event.Try`, `.Msfconsole`, `.ShowOptions`, `.SetOption`, `.Rootgrab`, `.Meterpreter.Connected`, `Meterpreter.Download` | Exploit framework (search/use/configure/run modules, Meterpreter sessions) |
| `sqlmap` | `Sqlmap.ListTables`, `Sqlmap.DumpTable` | Automated SQL injection |

### File / OS / scripting

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `ls` | `Terminal.Ls` (`{id, name}`) | List directory contents (file-ID based) |
| `cd` | `Terminal.Cd` | Change working directory |
| `cat` | `Terminal.Cat` | Print file contents |
| `openssl` | `Terminal.Openssl` (`{type: "enc"\|"dec", input, output}`) | Base64 encode/decode (`btoa`/`atob`), not real cryptography — confirmed by reading strings out of the base game's own `app.asar`, whose official tutorial quest uses the identical mechanic. Falls back to plain `atob()`/`btoa()` when no `Shell.addCommandData("openssl", {type, text}, ...)` fixture matches, so a mission can just seed valid base64 content without registering a fixture at all. |
| `python3` | `Python3.ExecFile` | Execute a Python script file |
| `explorer` | `Terminal.Explorer` | GUI file explorer (not a terminal command) |
| process kill | `Process.Killed` | Kill a running process by PID |

### Infrastructure / admin (borderline "hacking tool", included for completeness)

| Tool | SDK hook(s) | What it does |
|---|---|---|
| pfSense | `PFSense.Login`, `PFSense.Changes` | Router/firewall admin web panel |

**Explicitly out of scope for this doc** (general in-game apps, not hacking
tools): Twotter, Kisscord, Mail, Bank, Database, generic Browser/AppStore/BCC
News events, and the generic `Files.*` / `Terminal.Command` /
`Terminal.InstallPackage` mechanisms (those are plumbing every tool above
rides on, not tools themselves).

## 2. Custom Commands Registry (built by this project)

| Command | File | Built for | Registration | Notes |
|---|---|---|---|---|
| `attrcheck` | `src/commands/attrcheck.ts` | M04's booby-trapped `master_identity_backup` file | `@RegisterCommand({ default: true, scope: "both" })` | Resolves the given path via `Files.getByPath` (session-aware, so it works against the remote host over SSH) and, if it matches the trap file, prints a warning and emits a custom mod event (`flatline.m04.attrcheckRevealed`) the quest listens for instead of completing the objective directly. Not yet live-tested. |
