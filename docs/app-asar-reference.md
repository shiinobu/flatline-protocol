# FLATLINE PROTOCOL — app.asar (HackHub engine) reference

Engine facts that the design docs, the mission specs and the implementation prompt rely on, written down with verbatim excerpts so they can be checked without the decompiled engine. The decompiled engine is not in the repo: `.reverse/` is gitignored and lives only on the owner's machine.

Read it together with `docs/bugs.md` (live-test findings), `docs/mechanics.md` (tool registry) and the SDK declarations in `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts` (0.25.0).

## Provenance

- Game build: HackHub 1.3.13 (Steam app 2980270). The extracted `package.json` inside `app.asar` reads `"name": "hackhub", "version": "1.3.13"`.
- Source file: `.reverse/extracted-1.3.13/index.js`, extracted from the game's `app.asar` (`.reverse/app.asar` is a link to the Steam install). 22,048,466 bytes, SHA-256 `5fc130d9f0d9049c01169ca8a456afbe453dd95662a3794b91ec0eedf5193045`.
- Offsets are JavaScript character offsets (`String.prototype.indexOf`) into that file. `docs/world-building/04-web-layer.md` §C quotes approximate byte offsets for the same file.
- Excerpts are verbatim from the minified source, with runs of whitespace collapsed to one space; `[...]` marks a cut. Minified identifiers (`ht`, `vt`, `Fr`, `Ji`, ...) are specific to this build: search for the string literals instead. Each excerpt lists the exact needle it was found with.
- Status: **VERIFIED 2026-10-02** means the code was read in this pass. **VERIFIED 2026-10-04, live** means the code was read and the behavior was then seen in the running game, with the weblab probes in `src/debug/` (`portal-lab.ts`, `seo-lab.ts`, `exports-lab.ts`). **CARRIED OVER** means another doc states it and it was not re-read here.
- Scope: static reading, except E-13 to E-16, which were also checked live. Other findings from the running game are recorded in `docs/bugs.md`.
- Do not take excerpts from `.reverse/extracted/index.js`. It is a different extraction (21,795,069 bytes, SHA-256 `dcf559f40b3839be0972453b9d743e70d3416a80dfb146f2dcd6a9e28a6f0c4a`) with other minified identifiers and other offsets. The logic read there for E-13 to E-16 is the same, but every excerpt in this file comes from `.reverse/extracted-1.3.13/index.js`.
- After a game update: re-extract `app.asar`, search the needles listed under each excerpt, then refresh the offsets, excerpts, hash and date, and re-check each claim.

## Index

- **E-1** `Network.registerDomain` and `Network.setVulnerabilities` do nothing without a subnet
- **E-2** `subfinder` reads subnets that carry a `domain`
- **E-3** `dirhunter` lists every registered path of a website and finds the website by host
- **E-4** `mods.reset`: exactly what it clears
- **E-5** Quest `Rewards`: optional, and guarded where it is paid
- **E-6** Files carry no timestamps; `ls` prints names only
- **E-7** `IsLocalIp` accepts only `192.168.1.x`
- **E-8** Firewall rules: `destination` is compared with the target's `lanIp`, and the panel validates it on Save
- **E-9** `PFSense.Login` fires only after a credential match; the panel also raises `Browser.Meta`
- **E-10** Which iframes are sandboxed how
- **E-11** Metasploit RDP module (bluekeep): what the target port and the session must look like
- **E-12** `geoip` and `nmap` and LAN addresses
- **E-13** Goagle matches `search` keywords only on static pages
- **E-14** A closed `seo` page is skipped by Goagle only when `metadata()` returns `null`
- **E-15** A site's `Icon` and the `Popular` grid: an empty `Icon` shows a pale default globe
- **E-16** Website `Exports`: arguments, return values and the mod context
- **Other engine facts** and the **UNVERIFIED** list at the end.

## E-1 `Network.registerDomain` and `Network.setVulnerabilities` do nothing without a subnet

Status: VERIFIED 2026-10-02.

**Claim.**

`Network.registerDomain(domain, ip, vulnerabilities?)` looks up the subnet at `ip`. When there is none it returns silently (no error, no warning). When there is one it replaces the subnet's whole `domain` field with `{ name, vulnerabilities }`. `Network.setVulnerabilities(ip, list)` also returns silently when no subnet exists.

**Excerpts.** Needles: `registerDomain(t,e,n){ru("network","Network.registerDomain");`.

```js
// offset 20500760
registerDomain(t,e,n){ru("network","Network.registerDomain");const i=ht.GetSubnet(e);i&&ht.UpdateSubnet({...i,domain:{name:t,vulnerabilities:n}})},setVulnerabilities(t,e){ru("network","Network.setVulnerabilities");const n=ht.GetSubnet(t);if(!n)return;const i=n.domain??{name:""};ht.UpdateSubnet({...n,domain:{...i,vulnerabilities:e}})}
```

**Consequences for the mod.**

- `DomainSpec.needsSubnet: true` (`src/components/domains.ts`) creates a bare `Device` subnet at the IP before registering; `false` assumes a subnet already exists. With no subnet at that IP the domain is not registered at all, whatever `needsSubnet` says.
- The shell fixtures (`whois`, `nslookup`, `geoip`, `nmap`) do not read the subnet, so they keep answering for such a domain. That hides the gap until a tool that reads the subnet is used (E-2, `python3 net_tree.py`).
- One IP carries one domain name: a second `registerDomain` on the same IP overwrites the first. Do not register a domain on an IP whose subnet belongs to another mission unless overwriting its domain is intended.
- First met in M1's recon layer (2026-09-20): `subfinder` reported "No subdomains found" and `net_tree.py` "Subnet not found" for domains that only had a bare `registerDomain`. Logged as `docs/bugs.md` #39.

**Used by.** `docs/world-building/08-spec-m5-m6.md` §C4, `09-konten-m5-m6.md` §A and §C, implementation prompt §2.5.

## E-2 `subfinder` reads subnets that carry a `domain`

Status: VERIFIED 2026-10-02.

**Claim.**

`subfinder <domain>` first requires a subnet whose `domain.name` equals the queried domain; otherwise it waits 3-6 seconds and finds nothing. The result list is the `domain` record of every subnet whose `domain.name` ends with the query.

**Excerpts.** Needles: `Exec(n){if(!Ji().Network.find(h=>{var _;return((_=h.domain)==null?void 0:_.name)===n}))`.

```js
// offset 14528932
Exec(n){if(!Ji().Network.find(h=>{var _;return((_=h.domain)==null?void 0:_.name)===n})){const h=Zt.number(3e3,6e3);return await this.sleep(h),{subDomains:[],timeout:h}}const s=Ji().Network.filter(h=>{var _;return(_=h.domain)==null?void 0:_.name.endsWith(n)}),l=[];var u=0;for(const h of s){if(!h.domain)continue;const _=Zt.number(250,750);u+=_,await this.sleep(_),l.push(h.domain)}return{subDomains:l,timeout:u}}
```

**Consequences for the mod.**

- A domain that must be discoverable by `subfinder` needs a real subnet (E-1) and must be registered when the step that reveals it is reached, not when the world is built (`docs/rules.md`, section "Step gating and engine contexts", point 2).

**Used by.** `docs/rules.md`, `docs/bugs.md` #38, implementation prompt §2.5.

## E-3 `dirhunter` lists every registered path of a website and finds the website by host

Status: VERIFIED 2026-10-02.

**Claim.**

`dirhunter <domain>` needs the `dirhunter` package installed and an internet connection. It looks the website up in the website registry by host name (`Url === hostname`), not by subnet, prints every page whose `isHidden` is falsy, and raises `Terminal.Dirhunter` with `{ host, results }` where `results` holds the path of **every** page, hidden or not.

SDK 0.25.0 page definitions (`WebsitePageDefinition`, `DynamicWebsitePageDefinition`) have no `isHidden` field, so a mod cannot hide a page from `dirhunter`. The base game's own sites set `isHidden: true` on some pages (for example `/team`, `/internal`), which is why the engine has the flag.

**Excerpts.** Needles: `async Run(){const n="Usage: dirhunter <domain>";`, `{path:"/internal",seo:!1,isHidden:!0,`.

```js
// offset 14551861
async Run(){const n="Usage: dirhunter <domain>";let i=this.Args[0];if(!i)return this.Tools.PrintError(n);if(!tc.network.isConnected())return this.Tools.PrintError("No internet connection.");!i.startsWith("http")&&!i.startsWith("https")&&(i="https://"+i);const s=cR(i);if(!s.hostname)return this.Tools.PrintError("Invalid domain.");const l=s.hostname,u=this.Tools.Println;u("Dirhunter v1.4.7"),this.Tools.NewLine(),u(`[+] Target: ${l}`),this.Tools.NewLine(),u("Scanning...");const h=Zt.number(2e3,5e3);await this.sleep(h),u("Scan completed in "+(h/1e3).toFixed(2)+"s"),this.Tools.NewLine();const _=o7e().find(E=>E.Url===l);if(!_)return this.Tools.PrintError("Website not found.");for(const E of _.Pages.filter(v=>!v.isHidden))u(`[+] Found: ${E.path}`);this.Tools.NewLine(),vt.Trigger("Terminal.Dirhunter",{host:l,results:(_==null?void 0:_.Pages.map(E=>E.path))||[]})
// built-in page that sets the flag (shows the flag exists in the engine's own page shape)
// offset 14655213
{path:"/internal",seo:!1,isHidden:!0,
```

**Consequences for the mod.**

- A "hidden" page of a mod website means registered but not linked. Path names must never leak an answer or the next step: use opaque tokens or one dynamic pattern (`/entity/:id`). M1 already works this way: its listing paths are opaque tokens because `dirhunter` prints every registered path (`docs/changelog.md`, `docs/m01-playtest.md`).
- No subnet or domain registration is needed for `dirhunter <host>` to find a mod website, which matters for the zero-network mission M6. This is a static reading of the engine; the M6 walking skeleton confirms it live.
- The terminal also needs the target to be a website the engine knows; a host with no registered `Website` prints "Website not found.".

**Used by.** `docs/world-building/08-spec-m5-m6.md` §C2 and §C5, `09-konten-m5-m6.md` §C2, implementation prompt §2.5 and §6. Logged as `docs/bugs.md` #40.

## E-4 `mods.reset`: exactly what it clears

Status: VERIFIED 2026-10-02, **CORRECTED 2026-10-03**. The first version said the reset clears `SaveStorage`. It does not: the SDK object maps `Storage:jF`, `SaveStorage:tnt`, `Variables:GF` (offset 20457379) and `sDr` calls only `jF.clear()` and `GF.clear()`. The owner's M4 live test agreed (a banner timer and a breach flag outlived a reset).

**Claim.**

`mods.reset <modId>` unclaims every quest of the mod (`Manager.Unclaim`: listeners released, the quest's tweets and messages removed; it does not run `OnComplete` or `OnAbandon`), removes quest-bound mail and quest posts, clears the mod's `Storage` (the global one, shared by every save) and `Variables`, and resets and closes the mod's apps. The function never touches `SaveStorage`, persisted `Scheduler` jobs, `Desktop` widgets, networks, `SharedVariables`, mail created with `Mail.send`, or the player's own filesystem. `quest.Data` does reset, because the quest is unclaimed.

**Excerpts.** Needles: `name:"mods.reset",description:`, `async function sDr(t){`, `y.Unclaim=D=>{`.

```js
// offset 20566094
name:"mods.reset",description:"Reset a mod's save-state (quests, mails, messages, data, apps) so its questline replays from scratch. Mod stays loaded."
// offset 20540224
async function sDr(t){const e={ok:!1,quests:0,mails:0,apps:0,closedWindows:0},n=pT.getMod(t);if(!n)return e.reason=`Mod "${t}" not found.`,e;const i=new Set;for(const h of n.quests)try{i.add(new h().Name)}catch{}const s=Ji(),l=(s.Quests??[]).filter(h=>h.name&&i.has(h.name)),u=new Set(l.map(h=>h.id));e.quests=l.length;for(const h of l)try{ka.Manager.Unclaim(h.id)}catch(_){console.error(`[ContentSDK] resetMod: failed to unclaim quest "${h.name}":`,_)}for(const h of s.Mails??[]){const _=h.content;_&&typeof _=="object"&&"questId"in _&&u.has(_.questId)&&(Ai(iK.Remove(h.id)),e.mails++)}try{const h=Dx.GetHistory();if(h.length>0){const _=h.filter(E=>{if(typeof E.host=="string"&&E.host.startsWith(`mod_${t}`))return!1;const v=E.message;return!(v&&typeof v=="object"&&"questId"in v&&u.has(v.questId))});_.length!==h.length&&Dx.SetHistory(_)}}catch{}try{Ai(jCn.removeQuestPosts([...i]))}catch{}try{LF.UnregisterModEntries(t)}catch{}try{jF.__setCurrentModId__(t),jF.clear(),GF.__setCurrentModId__(t),GF.clear()}catch(h){console.error(`[ContentSDK] resetMod: failed to clear storage/variables for "${t}":`,h)}finally{jF.__setCurrentModId__("__unknown__"),GF.__setCurrentModId__("__unknown__")}for(const h of n.apps)try{const _=`mod_${t}_${new h().AppName}`;for(const E of vl.GetSurfacesByName(_))vl.Close(E.id),e.closedWindows++;Ai(Z3t(_)),Ai(hYn(_)),cDr(_),e.apps++}catch(_){console.error(`[ContentSDK] resetMod: failed to reset app for "${t}":`,_)}try{await ka.Manager.HandleAutoClaims()}catch(h){console.error(`[ContentSDK] resetMod: HandleAutoClaims failed for "${t}":`,h)}return h9e.enqueue("HandleQuestHackhubPosts"),e.ok=!0,e}
// offset 9158371
y.Unclaim=D=>{(0,y.ReleaseListeners)(D),Bd.RemoveTweetsAssociatedToQuest(D),rS.Manager.RemoveMessagesAssociatedToQuest(D),Ai(aDs(D))}
```

**Consequences for the mod.**

- A checkpoint that depends only on a file existing on the player's own PC can be satisfied by a leftover copy after a reset. Gate it on a quest-data flag that the real upstream action sets in the current playthrough.
- Cleanup written in `OnAbandon` never runs on a reset; the rebuild path of `core/register` does the cleaning (`docs/bugs.md` #35).
- `SharedVariables` mirrors can be stale after a reset until `OnStart` or `OnObjectivesStart` rewrites them.
- Everything a mission keeps in `SaveStorage` (kit state such as `flatline.m04.activeStrike`, `flatline.incidentBanner`, the desktop-breach flag, BACKTRACE state), every persisted `Scheduler` job and every `Desktop.addWidget` widget outlives a reset, while `quest.Data` does not. A mission's start (`onStartM0X`) must therefore cancel its own jobs and clear its own kit state instead of assuming they are gone. M4 does it with `abandonStrike`, `cancelM04Strike`, `cancelM04BreachJobs` and `resetBreach`.
- `Mail.send` mail survives a reset (`docs/bugs.md` #37); networks survive too (`docs/bugs.md` #35).
- After a reset the mod's world is rebuilt by a `Scheduler` job (`src/core/rebuild.ts`, 250 ms real-time delay, sequential destroy then build). A tool used inside that short window can report a missing target; retry before concluding that a mission is broken (`docs/bugs.md` #35).

**Used by.** `docs/bugs.md` #35 and #37, `docs/world-building/10-spec-m4.md` §I, implementation prompt §2.5. Logged as `docs/bugs.md` #44.

## E-5 Quest `Rewards`: optional, and guarded where it is paid

Status: VERIFIED 2026-10-02.

**Claim.**

The mod quest wrapper builds a `Rewards` object only when the mod quest declares one. The quest store's `Complete` pays `Rewards.Money` through `Bank.Transaction`, guarded by `Rewards != null && Rewards.Money`. The `Rewards` class reads `money` and `xp` (`xp` defaults to 0). Where XP is granted was not traced.

Separately, in the owner's live test of the rival-hacker lab (2026-10-01, `src/debug/rival-hacker-lab.ts`) a quest with `Rewards` and `AutoComplete` ran `OnComplete` but did **not** pay. The engine excerpts do not explain that; it is a live observation.

**Excerpts.** Needles: `n.Rewards&&(this.Rewards=new ka.Rewards(n.Rewards))`, `class n{constructor(C){Ne(this,"XP");Ne(this,"Money");`, `y.Complete=async D=>{var W,X,Z;const U=(0,y.GetById)(D);if(!U)return;const J=tc.Bank.GetMy...`.

```js
// offset 20520854
n.Rewards&&(this.Rewards=new ka.Rewards(n.Rewards))
// offset 9151995
class n{constructor(C){Ne(this,"XP");Ne(this,"Money");typeof C=="number"?(this.Money=C,this.XP=0):(this.Money=C.money,this.XP=C.xp??0)}}t.Rewards=n;
// offset 9159957
y.Complete=async D=>{var W,X,Z;const U=(0,y.GetById)(D);if(!U)return;const J=tc.Bank.GetMyAccount();(W=U.Rewards)!=null&&W.Money&&tc.Bank.Transaction({accountId:J.id,amount:(X=U.Rewards)==null?void 0:X.Money,description:nn("QUESTS.PAYMENT_DESCRIPTION"),transactionAt:new Date().getTime(),from:{IBAN:np.finance.iban(),name:U.Employer.fullName},to:J.IBAN})
```

**Consequences for the mod.**

- Project rule (README decision #34): mission rewards are money only; pay with `Bank.transaction` in `OnComplete` and leave the quest's `Rewards` unset. An unset `Rewards` is safe: both the construction and the payout are guarded. Declaring the reward in `Rewards` as well risks a double payment if the engine does pay it.
- Pay nothing while the mission is under dev or tester focus, mirroring the 0/0 gate of `docs/rules.md` §2a, so repeated test completions do not inflate the player's balance.

**Used by.** `docs/world-building/README.md` #30 and #34, `10-spec-m4.md` §A, `11-spec-m7.md` §A, implementation prompt D1. Logged as `docs/bugs.md` #42.

## E-6 Files carry no timestamps; `ls` prints names only

Status: VERIFIED 2026-10-02.

**Claim.**

The SDK file types (`FileDefinition`, `FileInfo`, `FileCreateOptions`, `NetworkFileMap` in SDK 0.25.0) have no date or size field. The `Files.create` bridge hands the engine only `{ id, name, extension, data, isFolder, parent }`, and the terminal command `ls` prints names (with extension) and nothing else. Searching the engine for date-modified labels and size formatters in the file-manager code found none.

**Excerpts.** Needles: `async create(t){var s;ru("filesystem","Files.create");`, `Ne(this,"Command","ls");`.

```js
// offset 20494536
async create(t){var s;ru("filesystem","Files.create");const e=Zt.id(),n=await Snt();let i;if(t.parentPath?i=(s=await HVn(t.parentPath))==null?void 0:s.id:i=n==null?void 0:n.id,!i)throw new Error(`[ContentSDK] Files.create: Parent path "${t.parentPath}" could not be resolved. Make sure the directory exists before creating files in it.`);return Fr.Create({id:e,name:t.name,extension:t.extension,data:t.data,isFolder:t.isFolder,parent:i}),{id:e,name:t.name,extension:t.extension,isFolder:t.isFolder,data:t.data,parent:i}}
// offset 10649056
Ne(this,"Command","ls");Ne(this,"Description",nn("TERMINAL.LS.DESCRIPTION"));Ne(this,"Autocomplete",[{label:"ls",type:"STRING"}])}async Run(){const n=this.Args,i=n.length?n.join(" ").toString():"",s=this.DirectoryId;if(!s)return this.Tools.PrintError("Directory not initialized.");const l=i.length>0?await Fr.GetByPath(i,s):this.Tools.directory;if(!l)return this.Tools.PrintError("Directory not found.");const h=(await Fr.GetFileMapToRoot(l)).find(y=>y.userId),_=this.Tools.GetShellUserId();if(h&&h.userId&&_){const y=ht.GetUserById(_);if(y&&y.username!=="root"&&h.userId!==y.id)return this.Tools.PrintError("Access denied.")}const v=(await Fr.GetChildFiles(l.id)).map(y=>({content:y.name+(y.extension?"."+y.extension:""),class:y.isFolder?"text-sky-500":"text-green-500"}));return vt.Trigger("Terminal_ls",l),v.length===0?ce("span",{className:"text-gray-400/70",children:["* Directory ",M("span",{className:"text-gray-400",children:l.name})," is empty."]}):v.map(y=>y.content).join(
```

**Consequences for the mod.**

- A date can only be seen in a file's name (for example a folder called `2026-08-14`) or in its contents. The story dates in `docs/world-building/13-story-timeline.md` therefore go into names and contents; there is no metadata to set.
- Never derive such a date from `Time.now()`, `Date.now()` or `new Date()`: the in-game clock runs on its own calendar (`Time` in the SDK) and is unrelated to story time.

**Used by.** `docs/world-building/13-story-timeline.md`, implementation prompt §3. Logged as `docs/bugs.md` #43.

## E-7 `IsLocalIp` accepts only `192.168.1.x`

Status: VERIFIED 2026-10-02.

**Claim.**

The engine's notion of a local (LAN) address is a string starting with `192.168.1.`. Nothing else is local: not `192.168.2.x`, not `10.x`, not `172.16.x`.

**Excerpts.** Needles: `function Me(en){return Jq(en)&&en.startsWith("192.168.1.")}t.IsLocalIp=Me;function He(en){...`.

```js
// offset 20404473
function Me(en){return Jq(en)&&en.startsWith("192.168.1.")}t.IsLocalIp=Me;function He(en){return Jq(en)}t.IsIp=He;
```

**Consequences for the mod.**

- Every `lanIp` of a node behind a Firewall or a Router panel that the player edits must be `192.168.1.x`: the panels validate rule destinations and port-forward targets with `IsLocalIp` (E-8). M2 and M3 use `192.168.1.x` throughout; M1 uses one prefix per router, `192.168.1.x` to `192.168.5.x` (`src/content/m01/network.ts`).
- The old M4 design used `172.16.0.x`; M7 must re-address its LAN side to `192.168.1.x`. Drafts of the M4/M5/M6 specs wrote "192.168.x.x", which is too loose; corrected on 2026-10-02.
- `lanIp` is sequential inside one router tree (router `.1`) and must not repeat inside it.
- `geoip` refuses LAN addresses and `nmap` resolves a LAN address only inside an SSH session (E-12).

**Used by.** `docs/network.md`, `docs/world-building/08-spec-m5-m6.md` §B4, `10-spec-m4.md` §E, `11-spec-m7.md` §E, implementation prompt §5 and §8. Logged as `docs/bugs.md` #41.

## E-8 Firewall rules: `destination` is compared with the target's `lanIp`, and the panel validates it on Save

Status: VERIFIED 2026-10-02.

**Claim.**

A request to `ip:port` is blocked when the firewall protecting `ip` has a rule that denies that port, whose `source` is empty or equals the requester, and whose `destination` is empty or equals the **target subnet's `lanIp`**. A rule whose `destination` is a public IP therefore never matches.

The firewall that protects `ip` is `ip` itself when it is a Firewall node, otherwise the Firewall node whose `parent` is the router of `ip`'s tree.

The pfSense panel's Save validates every rule: the port, the `source` (valid IP) and the `destination` (valid IP **and** `IsLocalIp`), and rejects a Deny rule on port 80 whose destination is empty or the firewall's own `lanIp` (panel lockout). Only when all rules pass does it store the rules and raise `PFSense.Changes` with `{ old, new }`.

`Network.removeFirewallRule(ip, port)` removes **every** rule with that port from the firewall protecting `ip`.

**Excerpts.** Needles: `function se(en){const Zn=J(en);if((Zn==null?void 0:Zn.type)==="FIREWALL")return Zn;`, `function Ce(en,Zn,jn){const xt=jn??t.GetMyIp(),Ur=J(en);`, `_=()=>{for(const v of n){if(!ht.IsPort(v.port))`, `removeFirewallRule(t,e){ru("network","Network.removeFirewallRule");`.

```js
// offset 20403821
function se(en){const Zn=J(en);if((Zn==null?void 0:Zn.type)==="FIREWALL")return Zn;const jn=ee(en);if(jn)return Ji().Network.find(xt=>xt.type==="FIREWALL"&&xt.parent===jn.ip)}t.GetFirewall=se;
// offset 20404980
function Ce(en,Zn,jn){const xt=jn??t.GetMyIp(),Ur=J(en);if(!Ur)return!1;const qt=se(en);return qt?!!qt.rules.find(Jt=>!Jt.allowed&&Jt.port.toString()===Zn.toString()&&(!Jt.source||Jt.source===xt)&&(!Jt.destination||Jt.destination===Ur.lanIp)):!1}t.IsRequestBlocked=Ce;
// offset 9314911
_=()=>{for(const v of n){if(!ht.IsPort(v.port))return l(`${v.port} is not a valid port.`);if(v.source&&!Jq(v.source))return l(`${v.source} is not a valid ip address.`);if(v.destination){if(!Jq(v.destination))return l(`${v.destination} is not a valid ip address.`);if(!ht.IsLocalIp(v.destination))return l(`${v.destination} is outside this network. Destination must be a local address (192.168.1.x) or left empty for Any.`)}}if(ht.FindPanelLockoutRules(n,t.lanIp,ht.GetMyIp()).length)return l(`A Deny rule on port 80 with Destination "Any" or ${t.lanIp} would lock you out of this panel.`);const E=structuredClone(t);E.rules=n,ht.UpdateSubnet(E),vt.Trigger("PFSense.Changes",{old:structuredClone(t),new:structuredClone(E)}),l(""),h(!0),setTimeout(()=>h(!1),2500)};
// offset 20502092
removeFirewallRule(t,e){ru("network","Network.removeFirewallRule");const n=ht.GetFirewall(t);if(!n)return;const i=(n.rules??[]).filter(s=>s.port!==e);ht.UpdateSubnet({...n,rules:i})},
```

**Consequences for the mod.**

- Live shapes use rules without a `destination` (M1: `{ allowed: false, port: 22 }`, M2: `{ allowed: false, port: 3389 }`). That blocks the port for every device of the network, so use it only when the port belongs to one device.
- The old M4 gave its rules `destination: M04_C2_IP` (the C2's **public** IP). Those rules never match, and the panel's Save would reject them as "outside this network" while they remain in the list. M7 must use the C2's `lanIp` (`192.168.1.x`) as `destination`, and must not add a port-22 rule without a destination, because that would also block SSH to Null-Crown and Ash-Vector. Logged as `docs/bugs.md` #41.
- A Deny rule on port 80 with an empty destination is rejected by the panel; do not ship one.

**Used by.** `docs/world-building/11-spec-m7.md` §B and §E, `08-spec-m5-m6.md` §B4, implementation prompt §5 and §8. Logged as `docs/bugs.md` #41.

## E-9 `PFSense.Login` fires only after a credential match; the panel also raises `Browser.Meta`

Status: VERIFIED 2026-10-02.

**Claim.**

The pfSense login handler raises `PFSense.Login` with `{ ip }` only after it finds a user on that firewall node whose username **and** password match. The failure branch sets the form errors and returns before the event. The login page also raises `Browser.Meta` with `{ hostname: ip }` each time it mounts. A successful save in the panel raises `PFSense.Changes` (E-8).

**Excerpts.** Needles: `i=async()=>{if(vt.Trigger("NetworkPacketTransfer",{id:Zt.id(),source:Ji().Computer.network...`, `n.setErrors({username:"Username may be incorrect.",password:"Password may be incorrect."})...`, `const l=t.users.find(h=>h.username===n.values.username&&h.password===n.values.password),u=...`, `vt.Trigger("PFSense.Login",{ip:t.ip}),e(!0)};Ee.useEffect(()=>{vt.Trigger("Browser.Meta",{...`.

```js
// offset 9312300
i=async()=>{if(vt.Trigger("NetworkPacketTransfer",{id:Zt.id(),source:Ji().Computer.network.ip,destination:t.ip,protocol:"HTTP",info:"AUTH_REQUEST",data:JSON.stringify({username:n.values.username,password:n.values.password})}),!t||!t.users.find(h=>h.username===n.values.username&&h.password===n.values.password))return vt.Trigger(
[...]
// offset 9313103
n.setErrors({username:"Username may be incorrect.",password:"Password may be incorrect."});
// offset 9313194
const l=t.users.find(h=>h.username===n.values.username&&h.password===n.values.password),u=btoa(JSON.stringify({username:l.username,password:l.password}));
[...]
// offset 9313737
vt.Trigger("PFSense.Login",{ip:t.ip}),e(!0)};Ee.useEffect(()=>{vt.Trigger("Browser.Meta",{hostname:t.ip})},[t.ip]);
```

**Consequences for the mod.**

- The event carries only the IP, so a Firewall must have **exactly one** valid user: any extra valid decoy user would open the gate too (`docs/world-building/README.md` #21).
- Visiting the panel of a Firewall raises `Browser.Meta` with `hostname` equal to the Firewall's IP and no `pathname`.

**Used by.** `docs/world-building/08-spec-m5-m6.md` §B2, `09-konten-m5-m6.md` §B1, `11-spec-m7.md` §C and §E, `docs/bugs.md` #31.

## E-10 Which iframes are sandboxed how

Status: VERIFIED 2026-10-02.

**Claim.**

Mod website pages are rendered in an iframe with `sandbox="allow-scripts allow-same-origin"`: scripts run, forms cannot submit (no `allow-forms`). Mod apps use the same attribute set. HTTP documents fetched by the browser use `allow-scripts allow-same-origin allow-forms`. One further iframe uses `allow-scripts` only.

**Excerpts.** Needles: `M("iframe",{ref:v,title:t,sandbox:"allow-scripts",`, `return C?M(tLr,{frameRef:h,srcDoc:C,sandbox:`, `function ZLr(t,e,n,i,s,l){return TS.createElement("iframe",{srcDoc:Qwc(t,e,n,i,s,l,_Ft()),...`, `const n=Jon(t,e),i='__mod_exports_${e}_${n.AppName}__';`.

```js
// offset 9826244
M("iframe",{ref:v,title:t,sandbox:"allow-scripts",...h?{src:_??void 0}:{srcDoc:u},
// offset 20261468
return C?M(tLr,{frameRef:h,srcDoc:C,sandbox:"allow-scripts allow-same-origin allow-forms",
// offset 20530837
function ZLr(t,e,n,i,s,l){return TS.createElement("iframe",{srcDoc:Qwc(t,e,n,i,s,l,_Ft()),sandbox:"allow-scripts allow-same-origin"
// offset 20536810
const n=Jon(t,e),i=`__mod_exports_${e}_${n.AppName}__`;n.Exports&&zon(i,jot(n.Exports,e));const s=h=>TS.createElement(tLr,{srcDoc:F2c(n.HTML,e,i),sandbox:"allow-scripts allow-same-origin"
```

**Consequences for the mod.**

- Search boxes and any input on a mod website must use `<input>` plus JavaScript events; a `<form>` submit does nothing.

**Used by.** `docs/world-building/04-web-layer.md` §C #2, implementation prompt §6.

## E-11 Metasploit RDP module (bluekeep): what the target port and the session must look like

Status: VERIFIED 2026-10-02.

**Claim.**

`exploit/rdp/cve_2019_0708_bluekeep` accepts a target when the router's port list for that host has a port that is `active`, has a `version` string, has `external` equal to `RPORT`, has `internal === 3389`, applies to the host's `lanIp`, whose split service name is `FreeRDP` or `ms-wbt-server` (case-insensitive) and whose split version equals the module's `Version` option. The request must not be blocked by the firewall (E-8), and the host needs a user that is `online` or named `guest`.

On success the exploit raises the SDK event `RemoteConnection.Established` (the engine's internal name has a typo, `RemoteConnection.Etablished`, mapped by the SDK) with `{ targetIp, targetPort, fromIp, user, t: "METASPLOIT" }`.

**Excerpts.** Needles: `const iAt="exploit/rdp/cve_2019_0708_bluekeep";class Xtn extends Qs.Exploit{`, `let k1l=class extends kc.Command{`, `vt.Trigger("RemoteConnection.Etablished",{targetIp:i,targetPort:Number(s),fromIp:this.Tool...` (first occurrence after `const iAt="exploit/rdp/cve_2019_0708_bluekeep";...`), `"RemoteConnection.Established":"RemoteConnection.Etablished","RemoteConnection.Disconnecte...`.

```js
// offset 14366358
const iAt="exploit/rdp/cve_2019_0708_bluekeep";class Xtn extends Qs.Exploit{constructor(){super(...arguments);Ne(this,"name",iAt);Ne(this,"rank","normal");Ne(this,"description","RCE vulnerability in RDP service.");Ne(this,"disclosureDate","2019-05-14");Ne(this,"services",[{service:"FreeRDP",versions:["1.0.0","9.99.99"],keys:["rdp","ms-wbt-server"]},{service:"ms-wbt-server",versions:["1.0.0","9.99.99"],keys:["rdp","ms-wbt-server"]}]);Ne(this,"options",[{name:"RHOST",type:"ip",required:!0,description:"The target host"},{name:"RPORT",type:"port",required:!0,description:"The target port",default:3389},{name:"Version",type:"version",required:!0,description:"RDP Version in remote host.",default:"1.0.0"},{name:"LHOST",type:"ip",description:"The local host IP for the reverse shell."},{name:"LPORT",type:"port",description:"The local port for the reverse shell connection."}]);Ne(this,"commands",[k1l])}}
// offset 14367264
let k1l=class extends kc.Command{constructor(){super(...arguments);Ne(this,"Command","exploit");Ne(this,"Description",nn("TERMINAL.METASPLOIT.EXPLOIT_START.DESCRIPTION"));Ne(this,"Autocomplete",[{label:"exploit",type:"STRING"}])}async Run(){if(op()&&await Qs.RunMultiplayerExploit(this,iAt,new Xtn))return;const n=new Qs.Logger(this.Tools.Println);if(!Qs.CheckRequiredOptions(Xtn,this.Tools.data))return n.Log("Please fill all required fields in options.","RED");const i=Qs.GetVariable(this.Tools.data,"rhost"),s=Qs.GetVariable(this.Tools.data,"rport"),l=Qs.GetVariable(this.Tools.data,"version"),u=ht.GetSubnet(i),h=ht.GetSubnetRouter(i),_=new Xtn;var E=!!i&&!!s&&!!u&&!!h,v;E&&u&&h&&(v=ht.PortsForHost(h.ports,u.lanIp).find(D=>D.active&&D.version&&D.external.toString()===(s==null?void 0:s.toString())&&D.internal===3389&&ht.PortAppliesTo(D,u.lanIp)&&ht.SplitServiceVersion(D.version)[1]===l&&!!_.services.find(U=>ht.SplitServiceVersion(D.version)[0].toLowerCase()===U.service.toLowerCase())),v?E=!0:E=!1);const y=ht.IsRequestBlocked(i,Number(s),this.Tools.GetTerminalIp());y&&(E=!1);const C=u==null?void 0:u.users.find(D=>D.online||D.username==="guest");
// offset 14369203
vt.Trigger("RemoteConnection.Etablished",{targetIp:i,targetPort:Number(s),fromIp:this.Tools.GetTerminalIp(),user:C,t:"METASPLOIT"})
// offset 20489974
"RemoteConnection.Established":"RemoteConnection.Etablished","RemoteConnection.Disconnected":"RemoteConnection.Disconnected"
```

**Consequences for the mod.**

- The M7 C2 needs a 3389 port with `version: "FreeRDP 5.2.1"` (the module splits it into service and version), `external` and `internal` both 3389, `active` once the firewall step is done, and one online user (`svc-cms`). The module `Version` option is `5.2.1`. The nmap display of the port comes from the port's own fields or from a shell fixture (E-12).
- A gate on this exploit listens to `RemoteConnection.Established` with `t === "METASPLOIT"`, not to `Metasploit.Meterpreter.Connected` (`docs/bugs.md` #29).

**Used by.** `docs/world-building/11-spec-m7.md` §B #1-#2 and §E, `docs/world-building/08-spec-m5-m6.md` §B2 (bonus), `docs/bugs.md` #29.

## E-12 `geoip` and `nmap` and LAN addresses

Status: VERIFIED 2026-10-02.

**Claim.**

`geoip` refuses a LAN address. `nmap` answers from a registered shell fixture first; otherwise it computes the table from the subnet, and a LAN address is resolved only through the current SSH session's `ssh_ip`.

**Excerpts.** Needles: `if(this.Args.length!==1)return n("Invalid args.");const s=this.Args[0];if(!ht.IsIp(s))retu...`, `Exec(n,i){if(!Jq(n))return[];let s=gd.GetCommand({command:"nmap",input:n});`.

```js
// offset 14468288
if(this.Args.length!==1)return n("Invalid args.");const s=this.Args[0];if(!ht.IsIp(s))return n("Invalid ip address.");if(ht.IsLocalIp(s))return n("LAN ip addresses is not supported. Please enter an public ip address.")
// offset 10645471
Exec(n,i){if(!Jq(n))return[];let s=gd.GetCommand({command:"nmap",input:n});if(!s){const u=[];var l=ht.GetSubnet(n);const h=this.Tools.data.ssh_ip;if(ht.IsLocalIp(n)&&h&&(l=ht.GetSubnet(h,n)),l){const _=v=>{for(const y of v){const C=y.active?y.external===y.internal?"OPEN":"FORWARDED":"CLOSE";
```

**Consequences for the mod.**

- For a port that `nmap` computes from the subnet: `active: false` shows CLOSE, an active port with `external === internal` shows OPEN, an active port whose external and internal differ shows FORWARDED (`docs/rules.md` §12 covers the 443 rule).
- `nmap` consults a registered shell fixture first and computes from the subnet only when there is none (the `geoip` command does the same with its own fixture; the live missions rely on the same pattern for `whois` and `nslookup`, `docs/mechanics.md`). That is how the mod shows answers that differ from the real node.
- Players reach nodes behind a Splitter by their public IPs (`python3 net_tree.py <router ip>` lists them), as in `docs/bugs.md` #27.

**Used by.** `docs/bugs.md` #27, implementation prompt §8.

## E-13 Goagle matches `search` keywords only on static pages

Status: VERIFIED 2026-10-04, live.

**Claim.**

Goagle lists a site when at least one of its pages has `seo` not `false`, and keeps a page only when its `metadata()` does not return `null`. A lowercased query `u` then matches a page in any one of three ways: a keyword in the page object's `search` equals `u`; `u` contains a keyword; or `u` is a substring of the metadata title or of the site's `SiteName`. The score only ranks the result: +120 when a keyword equals `u`, else +90 when a keyword contains `u`; +100 when the title equals `u`, +80 when it starts with `u`, +60 when it contains `u`; +30 when the description contains `u`; +20 when the `SiteName` contains `u`.

The page object carries `search` only for a static page (`WebsitePageDefinition`): the engine helper `C2c` copies `search:t.search`. A dynamic page (`DynamicWebsitePageDefinition`, helper `N2c`) has no `search` on the page object. Its `search` exists only on the object that `metadata()` returns (`search:v.search`), and the matcher never reads that object's `search`. `seo` defaults to `false` for both kinds.

Live, 2026-10-04 (`src/debug/portal-lab.ts`): with dynamic pages and `search` inside `metadata()`, only `endpoint monitor` found the monitor site (a title match); `encrypt` and `workstation console` found nothing. After the pages became static, every keyword found its site. A partial query such as `seoprob` found "Seoprobe Lab" through its `SiteName`.

**Excerpts.** Needles: `.Pages.find(he=>he.seo!==!1))`, `return He.includes(u)?he+=120:`, `for(const Ie of y)for(const Me of Ie.Pages){if(Me.seo===!1)continue;`, `function C2c(t,e,n,i,s){return{path:t.path,seo:t.seo??!1,search:t.search,`, `function N2c(t,e,n,i,s){return{path:t.path,seo:t.seo??!1,metadata:`.

```js
// offset 10000337 (the sites Goagle looks at)
o7e().filter(se=>se.Pages.find(he=>he.seo!==!1))
// offset 10001093 (score; the cut starts at He)
He=(((Kn=se==null?void 0:se.page)==null?void 0:Kn.search)??[]).map(Rn=>Rn.toLowerCase());return He.includes(u)?he+=120:He.some(Rn=>Rn.includes(u))&&(he+=90),Se===u?he+=100:Se.startsWith(u)?he+=80:Se.includes(u)&&(he+=60),Ie.includes(u)&&(he+=30),Me.includes(u)&&(he+=20),he
// offset 10001321 (which pages match)
for(const Ie of y)for(const Me of Ie.Pages){if(Me.seo===!1)continue;const He=Me.metadata({...t,searchStr:u,data:Ie.Data});if(!He)continue;const an=Me.search&&Me.search.some(rn=>rn.toLowerCase()===u),Sn=He.title.toLowerCase().includes(u)||((Se=Ie.SiteName)==null?void 0:Se.toLowerCase().includes(u)),Ce=Me.search&&Me.search.some(rn=>u.includes(rn.toLowerCase()));if(!an&&!Sn&&!Ce)continue;[...]
// offset 20529896 (static page)
function C2c(t,e,n,i,s){return{path:t.path,seo:t.seo??!1,search:t.search,metadata:l=>({title:t.title,description:t.description,url:t.path,component:u=>{[...]
// offset 20530231 (dynamic page)
function N2c(t,e,n,i,s){return{path:t.path,seo:t.seo??!1,metadata:l=>{var C;const u=((C=l.meta)==null?void 0:C.pathname)??l.url??t.path,h=I2c(t.path,u)??{},_=k2c(l.url??""),E={url:l.url??"",params:h,query:_,searchStr:l.searchStr},v=t.metadata(E);if(!v)return null;const y=`${n}_dyn_${u}`;return v.exports&&zon(y,jot(v.exports,e)),{title:v.title,description:v.description,url:u,search:v.search,component:w=>{[...]
```

**Consequences for the mod.**

- A keyword in `search` works only on a static page. A site whose pages go through `gateMissionPages` (dynamic) is found by words in the page title or the `SiteName`, or through `Popular` (E-15).
- A `seo: true` page without `search` is found when the query is part of its title or `SiteName`, so a partial query works.
- A static page has no `metadata()` hook and cannot be gated (`docs/rules.md` §6). Per site, choose between keywords and gating.
- A keyword is matched in one direction only: the query must equal it or contain it. A query shorter than the keyword does not match by keyword.

**Used by.** `docs/draft.md` §6.6, `docs/bugs.md` #62, `src/debug/portal-lab.ts`.

## E-14 A closed `seo` page is skipped by Goagle only when `metadata()` returns `null`

Status: VERIFIED 2026-10-04, live.

**Claim.**

For every query Goagle calls `metadata()` of every `seo` page, and drops the page only when the result is falsy (`if(!He)continue`). `notFoundMetadata()` returns an object, so a page that is closed that way is not dropped: the site is still listed when the query is part of its `SiteName` or of the title "404 Not Found". For a dynamic page the wrapper `N2c` forwards the caller's `searchStr` into the context and returns `null` when the mod's `metadata()` returns a falsy value. Only Goagle sets `searchStr` (the query). A visit by address calls the same function without it, so it is `undefined` there (seen live, not read in the code).

Live, 2026-10-04 (`src/debug/seo-lab.ts`, a site named "Seoprobe Lab" whose page is titled "Seo Probe"):

- mode `open`: `seoprob` and `seo probe` found it; `not found` and `404` did not.
- mode `404` (`notFoundMetadata()`): `seoprobe`, `404` and `not found` found it, titled "404 Not Found"; `seo probe` did not.
- mode `null`: no query found it.
- mode `gate` (`searchStr === undefined ? notFoundMetadata() : null`): no Goagle query found it, and opening the address showed the 404 page.
- Every navigation to the address called `metadata()` twice, and every Goagle query called it once. The cause of the double call was not read.

**Excerpts.** The same two excerpts as E-13: the matcher at offset 10001321 (`const He=Me.metadata({...t,searchStr:u,data:Ie.Data});if(!He)continue;`) and the wrapper at offset 20530231 (`E={url:l.url??"",params:h,query:_,searchStr:l.searchStr},v=t.metadata(E);if(!v)return null;`).

**Consequences for the mod.**

- The closed-page rule for a `seo` page is `context.searchStr === undefined ? notFoundMetadata() : null`: hidden from Goagle, a 404 by address. `gateMissionPages` (`src/websites/global/page-guards.ts`) does not use it yet; its closed branch returns `notFoundMetadata()`. No mission page sets `seo` today, so nothing leaks yet. The M5 foundation (hospital home, Echoline) will.
- `metadata()` runs for every Goagle query and twice per navigation, so a render must not write (`docs/bugs.md` #36).

**Used by.** `docs/draft.md` §6.6 and §8 (R2), `docs/bugs.md` #63, `src/debug/seo-lab.ts`.

## E-15 A site's `Icon` and the `Popular` grid: an empty `Icon` shows a pale default globe

Status: VERIFIED 2026-10-04, live.

**Claim.**

`Popular` is read once, when the site class is built (`n.Popular??!1`), so it cannot change per step. The "Goagle apps" grid lists `o7e().filter(h=>h.Popular)` and draws each site as `<img src={Icon}>` at 32 px with the `SiteName` under it. A falsy `Icon` is replaced by the engine's default, a 32 x 32 PNG of a pale gray globe (1,032 bytes), which is almost invisible on the white grid. Any other value goes through the resolver `sEe`: `http(s)://`, `mod-asset://` and `data:` URLs are used as they are; `./x` or `x` becomes `mod-asset://<modId>/x`.

Live, 2026-10-04: the three lab sites had `Icon = ""` and their Popular entries looked icon-less. With `data:image/svg+xml` icons built in code (`src/debug/portal-lab.ts`) the icons appeared in the grid.

**Excerpts.** Needles: `Ne(this,"Icon",n.Icon?sEe(n.Icon,e):P9e)`, `function sEe(t,e){if(!t||t.startsWith(`, `const P9e="data:image/png;base64,`, `o7e().filter(h=>h.Popular)`, `M("img",{src:_.Icon,alt:_.SiteName,className:"w-8 h-8 object-contain"})`.

```js
// offset 20529710 (site class, cut)
Ne(this,"Icon",n.Icon?sEe(n.Icon,e):P9e);Ne(this,"Url",n.Host);Ne(this,"Popular",n.Popular??!1);[...]
// offset 20459881 (icon resolver)
function sEe(t,e){if(!t||t.startsWith("http://")||t.startsWith("https://")||t.startsWith("mod-asset://")||t.startsWith("data:"))return t;const n=t.startsWith("./")?t.slice(2):t;return`mod-asset://${e}/${n}`}
// offset 9237183 (default icon, cut)
const P9e="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADuklEQVR4nK1XTWhdRRS+adUuWhW0xVIrXUgFlUpLK6VQ[...]
// offset 9995446 (the grid's list)
o7e().filter(h=>h.Popular)
// offset 9996251 (one grid cell, cut)
M("img",{src:_.Icon,alt:_.SiteName,className:"w-8 h-8 object-contain"})
```

**Consequences for the mod.**

- Every mission site in `src/websites/` sets `Icon = ""`, so it would show the default globe. A `Popular` site (LeakIndex, planned as a global site) needs a real icon: a `data:` URI, or a file under `public/assets/` referenced as `./assets/<scope>/<file>` (BACKTRACE does this for its app icon).
- `Popular` is static (see the Claim). A site cannot become `Popular` at a step.

**Used by.** `docs/draft.md` §3.5 and §6.6, `docs/bugs.md` #64, `src/debug/portal-lab.ts`.

## E-16 Website `Exports`: arguments, return values and the mod context

Status: VERIFIED 2026-10-04, live. The call chain was also read in the code; the way the mod context ends was only read, not tried.

**Claim.**

A website's `Exports` object is wrapped by `jot`/`xLr` and registered on `window.__hhModGlobals__` under `__mod_exports_<modId>_<host>__` (`zon`). The page reads that table through `hhModGlobals()`, which returns the parent window's table. Each function is replaced by a wrapper that takes `...h`, passes it unchanged to `u.apply(this,h)` and returns the result, so arguments of any type and the return value reach their destination as they are. Around the call the wrapper pushes the mod id with `qne(e)` (and sets it on three internal modules) and pops it in `finally{Yne()}`; the permission check names the current mod (`Mod "${$Fe}" tried to use ...`). A page's own `metadata().exports` is registered the same way (`N2c`: `v.exports&&zon(y,jot(v.exports,e))`).

Live, 2026-10-04 (`src/debug/exports-lab.ts`):

- a string argument, a number argument (it arrives as a number) and a number inside an `Events.emit` payload (still a number) all reached the mod;
- the page received the return values unchanged: a string, a number (`43`), a boolean, an object (`{"received":21,"doubled":42}`), and `undefined` from a void function;
- `SharedVariables.set` worked directly inside an `Exports` function and inside an `Events.on` listener, and the terminal side (a command) read the value;
- after a page reload, `metadata()` read the mirror (`SharedVariables.get`) and the page showed it.

**Excerpts.** Needles: `n.Exports&&zon(i,jot(n.Exports,e))`, `function xLr(t,e,n){const i=n.get(t);if(i)return i;`, `function qne(t){qkn.push(t)`, `const BLr=`.

```js
// offset 20529583 (website registration, cut)
O2c(t,e){const n=Jon(t,e),i=`__mod_exports_${e}_${n.Host}__`,s=`__mod_browser_${e}__`;n.Exports&&zon(i,jot(n.Exports,e));[...]
// offset 20459481 (the wrapper)
function xLr(t,e,n){const i=n.get(t);if(i)return i;const s={};n.set(t,s);for(const l of Object.keys(t)){const u=t[l];typeof u=="function"?s[l]=function(...h){var _,E,v;qne(e),(_=jF.__setCurrentModId__)==null||_.call(jF,e),(E=GF.__setCurrentModId__)==null||E.call(GF,e),(v=$ne.__setCurrentModId__)==null||v.call($ne,e);try{return u.apply(this,h)}finally{Yne()}}:$wc(u)?s[l]=xLr(u,e,n):s[l]=u}return s}
// offset 20456802 (the mod context stack)
function qne(t){qkn.push(t),$Fe=t}function Yne(){qkn.pop(),$Fe=qkn.length?qkn[qkn.length-1]:null}
// offset 20460199 (what the page sees)
const BLr=`var hhModGlobals = function() { return g.parent.${Iqn} || {}; };`;
```

**Consequences for the mod.**

- A login can be two strings in and a boolean out: the page calls an `Exports` function, the mod checks the pair, writes the `SharedVariables` mirror inside the function, and the page switches view from the returned value or by reloading (`metadata()` reads the mirror). The "Continue" fallback of `docs/draft.md` §6.2 is not needed.
- Numeric ids can be passed as numbers, so `flatlineOpenLeakRecord(id: number)` and the numeric codes of the mock (`flatlineMonitorLogin(1)`) work.
- The mod context ends when the synchronous call returns (`Yne()`), so code after an `await` inside an `Exports` function runs outside it. That is read in the code, not tried; it matches `docs/bugs.md` #6 and #19. Do the work that needs the mod before the first `await`, or hand it to a listener with `Events.emit`.

**Used by.** `docs/draft.md` §6.1, §6.2 and §8 (R3), `src/debug/exports-lab.ts`, `src/websites/m01/ledgervault/index.ts`.

## Other engine facts

Facts about the engine that are documented elsewhere and not repeated here:

| Topic | Where |
|---|---|
| A website render has no mod context; `metadata()` cannot read `SaveStorage`; `Localization.t()` returns the raw key there | `docs/bugs.md` #20, #22, #36 |
| Mod context is lost in detached async chains and after an `await` before `createSubnetNetwork` | `docs/bugs.md` #6, #19 |
| `Metasploit.Meterpreter.Connected` comes only from the reverse-TCP listener; a plain `exploit` raises `RemoteConnection.Established` | `docs/bugs.md` #29 |
| `Files.getByPath` sees a remote filesystem only over SSH; Meterpreter targets need the ID-based walk | `docs/bugs.md` #30 |
| A Router node shows the TP-Link panel (`Network.PortChanges`); `PFSense.*` events come only from a Firewall node | `docs/bugs.md` #31 |
| `destroyNetwork` replies overwrite the whole store; destroy sequentially | `docs/bugs.md` #32, #35 |
| Mod mail after `mods.reset` | `docs/bugs.md` #37 |
| `john` cracks only hashes the engine itself generated | `docs/bugs.md` #13 |
| Website engine table (page context, `HackhubSDK` bridge, `Browser.navigate`, `Popular`, `BCC` news) | `docs/world-building/04-web-layer.md` §C (**CARRIED OVER**: items #3, #4, #5, #6, #8 and #10 were not re-read on 2026-10-02; `Popular` and the `Exports` bridge are now E-15 and E-16) |

## UNVERIFIED

- Where XP from `Rewards` is granted, and whether the quest store's `Complete` is the path a mod quest takes (E-5).
- Whether any UI surface other than `ls` shows file dates or sizes (E-6); none was found.
- Whether the M6 zero-network mission can be completed end to end with no subnet at all (E-3 says `dirhunter` needs none); the M6 walking skeleton tests it live.
- The relation between the in-game clock (`Time`) and the 2026 story dates (`docs/world-building/06-pertanyaan.md` T-b is OPEN).
- Whether code after an `await` inside a website `Exports` function has lost the mod context. E-16 shows the wrapper popping the mod id in `finally` when the synchronous call returns; this was read, not tried (compare `docs/bugs.md` #6 and #19).
- Why a website page's `metadata()` runs twice per navigation (seen live in `seo-lab` and `exports-lab`). The cause was not read, so a render must stay free of writes (`docs/bugs.md` #36).

