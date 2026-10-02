# FLATLINE PROTOCOL — app.asar (HackHub engine) reference

Engine facts that the design docs, the mission specs and the implementation prompt rely on, written down with verbatim excerpts so they can be checked without the decompiled engine. The decompiled engine is not in the repo: `.reverse/` is gitignored and lives only on the owner's machine.

Read it together with `docs/bugs.md` (live-test findings), `docs/mechanics.md` (tool registry) and the SDK declarations in `node_modules/@hotbunny/hackhub-content-sdk/index.d.ts` (0.25.0).

## Provenance

- Game build: HackHub 1.3.13 (Steam app 2980270). The extracted `package.json` inside `app.asar` reads `"name": "hackhub", "version": "1.3.13"`.
- Source file: `.reverse/extracted-1.3.13/index.js`, extracted from the game's `app.asar` (`.reverse/app.asar` is a link to the Steam install). 22,048,466 bytes, SHA-256 `5fc130d9f0d9049c01169ca8a456afbe453dd95662a3794b91ec0eedf5193045`.
- Offsets are JavaScript character offsets (`String.prototype.indexOf`) into that file. `docs/world-building/04-web-layer.md` §C quotes approximate byte offsets for the same file.
- Excerpts are verbatim from the minified source, with runs of whitespace collapsed to one space; `[...]` marks a cut. Minified identifiers (`ht`, `vt`, `Fr`, `Ji`, ...) are specific to this build: search for the string literals instead. Each excerpt lists the exact needle it was found with.
- Status: **VERIFIED 2026-10-02** means the code was read in this pass. **CARRIED OVER** means another doc states it and it was not re-read here.
- Scope: static reading only. What happens in the running game is recorded in `docs/bugs.md`.
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

Status: VERIFIED 2026-10-02.

**Claim.**

`mods.reset <modId>` unclaims every quest of the mod (`Manager.Unclaim`: listeners released, the quest's tweets and messages removed; it does not run `OnComplete` or `OnAbandon`), removes quest-bound mail and quest posts, clears the mod's `SaveStorage` and `Variables`, and resets and closes the mod's apps. The function never touches networks, `SharedVariables`, mail created with `Mail.send`, or the player's own filesystem.

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
| Website engine table (page context, `HackhubSDK` bridge, `Browser.navigate`, `Popular`, `BCC` news) | `docs/world-building/04-web-layer.md` §C (**CARRIED OVER**: items #3, #4, #5, #6, #8 and #10 were not re-read on 2026-10-02) |

## UNVERIFIED

- Where XP from `Rewards` is granted, and whether the quest store's `Complete` is the path a mod quest takes (E-5).
- Whether any UI surface other than `ls` shows file dates or sizes (E-6); none was found.
- Whether the M6 zero-network mission can be completed end to end with no subnet at all (E-3 says `dirhunter` needs none); the M6 walking skeleton tests it live.
- The relation between the in-game clock (`Time`) and the 2026 story dates (`docs/world-building/06-pertanyaan.md` T-b is OPEN).

