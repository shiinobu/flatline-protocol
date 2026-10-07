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
| `ssh` | `Terminal.SSH.Connected`/`.Disconnected`/`.FileDownload`/`.Shutdown`, `CommandDataMap.ssh` | Remote shell session — requires `-h [user@ip]` syntax, not a bare IP. Needs a `Device`, an active router row with external = the port (default 22) and internal 22 that applies to the host (no service or version needed), and a valid user and password; it raises `RemoteConnection.Established` with `t: "SSH"` and `targetIp` = the address typed (M3 uses it for Faded-Ledger, `bugs.md` #33). |
| `ftp` | `Terminal.FTP.Connect`, `CommandDataMap.ftp` | File transfer session |
| `weechat` | `WeeChat.Connected`/`.Disconnected`/`.Message`, `CommandDataMap.weechat` | IRC chat client |

### Password / credential attacks

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `hydra` | `Terminal.Hydra`, `Terminal.Hydra.Try`, `CommandDataMap.hydra` | Online brute-force login. `-T` must be `ip:port`; `-l` is optional and **defaults to `guest`**. The fixture is matched on the whole `{user, target}` object (case-sensitive) and the success table prints the fixture's own credentials, so a fixture keyed on `guest` can reveal a different username; a miss only prints "Could not connect to the server." `-P` needs a wordlist with a real `wordCount` (a HackDB download, not a hand-typed `.lst`). See `bugs.md` #25. |
| `hashcat` | `Hashcat` | GPU hash cracking |
| `john` | `John.DecryptHash` | Wordlist-based hash cracking (John the Ripper) |
| `fern` | `Fern.FindPassword` | WiFi password recovery |

### Network attack / MITM

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `bettercap` | `Bettercap.Open`/`.Close`/`.NetProbe`/`.NetShow`/`.WifiRecon`/`.WifiDeAuth` | Network MITM / **Wi-Fi** recon & deauth. Its events carry no target (only `NetProbe`'s plain `boolean`), and it is a physical-proximity Wi-Fi tool — M2 used it (bettercap + `fern` to crack a home AP) until the 2026-09-24 redesign replaced that step with `sync-home.txt`, and M3 had it wrongly (a wired remote pivot, no Wi-Fi component) until pass 2 removed it; **no mission uses `bettercap` or `fern` today**. |
| `wireshark` | `Wireshark.Started`/`.Stopped` | **No mission uses it any more** (M3's capture step was removed on 2026-09-29, `bugs.md` #34). Packet capture — an **App** installed from the App Store (▶ Start / Stop / Clear plus optional Source/Destination filters), not a terminal command. Payload is only the `{source?, destination?}` filter, no packets, and there is no SDK call to inject packets into the list — a mission that needs captured data must deliver it another way (M3 writes `finance_vlan_capture.pcap` and traces it when the player `open`s it). See `bugs.md` #8 and #28. |

### Exploitation

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `metasploit` / `msfconsole` | `Metasploit.Event`, `.Search`, `.Use`, `.Event.Try`, `.Msfconsole`, `.ShowOptions`, `.SetOption`, `.Rootgrab`, `.Meterpreter.Connected`, `Meterpreter.Download` | Exploit framework: `search`, `use exploit/rdp/cve_2019_0708_bluekeep`, `set RHOST <public ip>` / `RPORT` / `Version <banner version, e.g. 7.1.9>`, then **`exploit`** (there is no `run`); needs an `online` or `guest` user on the target; then a `meterpreter >` prompt with `download`, `explorer`, `rootgrab /etc/passwd`, `show users`. `rootgrab` needs a `root` user on the target (`bugs.md` #26). No migrated mission listens to `Metasploit.Rootgrab` any more (M3 dropped it on 2026-10-01; M4's flat `main/m04.ts` still does until its migration). Targets resolve by public IP only (`bugs.md` #27). `Meterpreter.Download` never fires reliably — use `open`/`Files.Transfer`. A successful plain `exploit` raises `Metasploit.Event` (`data.host`) and `RemoteConnection.Established` (`t: "METASPLOIT"`, match on `targetIp`); `Metasploit.Meterpreter.Connected` is raised only by the reverse-TCP listener (`tcp_listener`, LHOST/LPORT) — `bugs.md` #29. |
| `sqlmap` | `Sqlmap.ListTables`, `Sqlmap.DumpTable` | Automated SQL injection |

### File / OS / scripting

| Tool | SDK hook(s) | What it does |
|---|---|---|
| `ls` | `Terminal.Ls` (`{id, name}`) | List directory contents (file-ID based) |
| `cd` | `Terminal.Cd` | Change working directory |
| `cat` | `Terminal.Cat` | Print file contents — only `.txt`/`.log`; any other extension fails with "Unable to read file." (use the project's `open` command, section 2) |
| `openssl` | `Terminal.Openssl` (`{type: "enc"\|"dec", input, output}`) | Base64 encode/decode (`btoa`/`atob`), not real cryptography — confirmed by reading strings out of the base game's own `app.asar`, whose official tutorial quest uses the identical mechanic. Falls back to plain `atob()`/`btoa()` when no `Shell.addCommandData("openssl", {type, text}, ...)` fixture matches, so a mission can just seed valid base64 content without registering a fixture at all. |
| `python3` | `Python3.ExecFile` | Execute a Python script file. `python3 net_tree.py <ip>` (NetTree, downloaded from hackdb.net; needs `apt-get install python3`) finds the router a public IP belongs to and lists the devices behind it, including a Splitter's children with their public IPs (`bugs.md` #27); `kimai.py` and `jwt_decoder.py` are the M1 tools. |
| `explorer` | `Terminal.Explorer` | GUI file explorer. `Terminal.Explorer` is raised only by `explorer` in a Meterpreter session or an `evil-rm` session; the `explorer` of an SSH session opens the window and raises nothing (`bugs.md` #33). `evil-rm -H` needs a hash the engine itself registered, not a plain password. |
| process kill | `Process.Killed` | Kill a running process by PID |

### Infrastructure / admin (borderline "hacking tool", included for completeness)

| Tool | SDK hook(s) | What it does |
|---|---|---|
| pfSense | `PFSense.Login`, `PFSense.Changes` | The admin page of a **`Firewall`** node only (M1, M2). Its firewall rules are the editable list. |
| TP-Link router panel | `Network.PortChanges` (`{subnet, oldPorts, newPorts}`) | The admin page of a **`Router`** node (M3's remote gateway): login form, then Status and Port Forwarding tabs. **Login raises no event**; each Save raises `Network.PortChanges` with the whole table before and after. The table is the router's real port table — every child device's ports live in it, tagged with the child's `lanIp` — so rows cannot be hidden, and `Network.addPort`/`removePort`/`openPort`/`closePort` edit the same rows. The "Add Rule" form takes external, internal and Local IP (a LAN address, or empty for Any); a typed rule has no `service`/`version` until a mission adds them (`Network.removePort` + `Network.addPort`), and sqlmap/Metasploit ignore a row without them. `nmap` shows a host's row `OPEN` (`external === internal`), `FORWARDED` (different) or `CLOSE` (inactive). `bugs.md` #31. |

**Explicitly out of scope for this doc** (general in-game apps, not hacking
tools): Twotter, Kisscord, Mail, Bank, Database, generic Browser/AppStore/BCC
News events, and the generic `Files.*` / `Terminal.Command` /
`Terminal.InstallPackage` mechanisms (those are plumbing every tool above
rides on, not tools themselves).

## 2. Custom Commands Registry (built by this project)

| Command | File | Built for | Registration | Notes |
|---|---|---|---|---|
| `open` | `src/commands/open.ts` | M2 and M3 evidence files (`.pdf`, `.xlsx`, …) | `@RegisterCommand({ default: true, scope: "both" })` | Prints a file of **any** extension (`cat` only reads `.txt`/`.log`) **line by line** (since 2026-09-29; a single `println` of the whole string collapsed every newline into one paragraph, `bugs.md` #34; leading spaces are kept as non-breaking spaces) and emits `flatline.open.fileRead` `{ id, name, extension }`, which quests use as a checkpoint — "the player provably read this file". Resolves the path with `Files.getByPath` like `attrcheck`: that API is session-aware **over SSH only** (`isRemote` = the terminal has `ssh_ip`), so on its own it reads the player's own PC at a `meterpreter >` prompt (engine-verified, `bugs.md` #30). Since 2026-10-01 (not yet live-tested) `open` is **Meterpreter-aware** (`src/commands/meterpreter-files.ts`): it tracks the session target from `RemoteConnection.Established` / `.Disconnected` (`t: "METASPLOIT"`) and, for a path that does not start with `~`, resolves it with `Files.resolvePath` (the target's cwd in that session) and walks it from the target's root file (`Files.getById(<ip>)` + `Files.getChildren`, the ID-based calls that are not session-limited). A miss, a `~` path or no session falls back to the player's own PC, so Meterpreter's `download` (it lands in `~/downloads`) followed by `open ~/downloads/<file>` still works. Without a session a relative path resolves from the home folder, not the cwd (`Files.resolvePath` is the cwd-aware helper; making the local side use it is an open proposal). The event carries only `{ id, name, extension }`, so quests match on `name`/`extension` and accept the local copy. Confirmed in M2's live-test on a local copy (`open wire_authorization.pdf` after it had been downloaded) and in M3's live-test on the old `.conf`/`.pcap` files. M3's gateway config is now a `.txt` read with `cat` (`bugs.md` #34). Replaces the download-based `Files.Transfer` gate for M2's shell-company lead and M3. |
| `flatline` | `src/commands/flatline.ts` | M4's hunt end and the intrusion banners | `@RegisterCommand({ default: true, scope: "both" })` | `flatline <ip>` cuts a host. It finishes the active repellable strike when the IP matches, or a registered target (M4's hunt, refused until `originLinked`); strikes with `repellable: false` (M4's, M7's duel) print their own refusal. It emits `flatline.intrusion.repelled`, which M4 listens to for `huntEnded`, so it is a player command, not a dev one. |
| `sysdiag` | `src/commands/sysdiag.ts` | The desktop breach recovery (`components/desktop-breach.ts`) | `@RegisterCommand({ default: true, scope: "local" })` | Reports the display module, config, initramfs, incident log and recovery images; a healthy session prints a success line. Refuses in a remote session. |
| `sysrepair` | `src/commands/sysrepair.ts` | The desktop breach recovery | `@RegisterCommand({ default: true, scope: "local" })` | `sysrepair --rebuild` restores the desktop session once `sysdiag` verified the components; it refuses while one is missing or damaged, and in a remote session. |

### Mail API caveats (verified 2026-10-01)

- `Mail.send` mail is not removed by `mods.reset`; withdraw it yourself (`Mail.remove(id)`).
- `Mail.getInbox()` returns an empty `subject` for mod mail (the title sits in `content.title`); match on `from` or on the id `Mail.send` returned.
