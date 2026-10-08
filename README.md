# Flatline Protocol

A story mod for [HackHub - Ultimate Hacker Simulator](https://store.steampowered.com/app/2980270/HackHub__Ultimate_Hacker_Simulator/).
Trace a hospital ransomware attack across seven cases, back to the name behind it.

[Steam Workshop page](https://steamcommunity.com/sharedfiles/filedetails/?id=3815288996)

> **Everything in this mod is fiction.** Every company, person, host, IP address,
> domain and password is invented and lives only inside the game. The tools are
> simulated game commands. The mod ships data (quests, networks, files, mail,
> websites), not real exploits, payloads or scanners, and nothing in it works
> outside the game.

## What it is

You play GHOSTWIRE, an independent hacker with no client and no badge, following
the trail of a hospital ransomware attack.

- **Seven cases, played in order:** First Trace, The Maker, Money Trail, Burn
  Notice, The Door, Open Register and The Architect.
- **BACKTRACE**, a case-file app: a report per case, recovered evidence and a
  caseboard that connects people, companies and documents.
- **An in-game Handbook category** ("Flatline Protocol") with tool syntax, a list
  of the cases and the commands this mod adds.
- **Four terminal commands:** `open`, `flatline`, `sysdiag` and `sysrepair`.
- **A world to dig through:** marketplaces, a hospital site and webmail, an
  insurer's portals, public registers, mail, chat and social accounts.
- **English and Simplified Chinese.** The Chinese text is a draft.
- **Comfort setting:** "Reduce motion and flashing" in the mod settings (Mods
  menu). It covers the mod's own screen effects. Websites and BACKTRACE follow the
  system reduce-motion setting.
- **Rewards are money only:** 15,000 across the seven cases, no XP.

## Play

1. Subscribe on the Steam Workshop and enable the mod.
2. Load a save and open the HackHub homepage feed. GHOSTWIRE's post is the first
   case. Claim it.
3. Read the Handbook first, then check your inbox.

## Build from source

Requires Node.js and npm, and HackHub installed.

```
npm install
npm run build
npx tsc -p tsconfig.json --noEmit
```

- `npm run build` bundles the mod into `dist/` (`mod.js`, `manifest.json` and the
  assets). `npm run dev` rebuilds on change.
- The SDK build does not clear `dist/`, so files from older builds stay behind.
  Delete `dist/` before a build you intend to install or upload.
- To test locally, copy the contents of `dist/` into
  `<HackHub>\mods\flatline-protocol\` and restart the game.
- `debug/`, `archive/`, `package.json`, `package-lock.json` and `tsconfig.json`
  are not needed in the installed folder.
- The SDK is pinned: `@hotbunny/hackhub-content-sdk` 0.25.0 (API version 2).

There is no automated test suite. Verification is the typecheck above plus
manual playtests in game.

## Project layout

| Path | What lives there |
|---|---|
| `src/index.ts` | Mod entry point: settings and the Handbook binding |
| `src/main/` | Registers each case's quest and the shared features |
| `src/content/` | Per-case data (quest, network, files, mail) and shared content |
| `src/controller/` | Per-case logic that ties game events to objectives |
| `src/core/`, `src/components/`, `src/middleware/`, `src/context/` | Shared pipeline layers |
| `src/commands/` | The four terminal commands |
| `src/applications/` | The BACKTRACE app |
| `src/websites/` | In-game websites |
| `src/i18n/` | English and Chinese strings |
| `src/guard/` | Development focus flags (all off in a release) |
| `src/debug/` | Debug gate only |
| `src/archive/` | Backups from before rewrites, not built into the mod |
| `public/assets/` | Images, copied into the mod by the build |
| `docs/` | Design and reference documents |

## Conventions

- No comments in `src/`, and no direct `console.log` (the shared logger in
  `src/helpers/logger.ts` is the only place).
- Release flags in `src/guard/flags.ts` must all be `false` before a commit.
- Cover art must stay under 1 MB for the Workshop upload.
- Bump `version` in `manifest.json` only. The Steam description lives in
  `workshop-description.txt` (`docs/rules.md` §8).

## Documentation

Documents are written in English, except `docs/idea.md`, which is in
Indonesian.

- [`docs/architecture.md`](docs/architecture.md): how `src/` fits together.
- [`docs/mechanics.md`](docs/mechanics.md): the game tools and the custom commands.
- [`docs/rules.md`](docs/rules.md): process and structure rules.
- [`docs/network.md`](docs/network.md): network layouts.
- [`docs/story.md`](docs/story.md): the story canon and a solution guide for each case.
- [`docs/idea.md`](docs/idea.md): ideas that are not built yet.
- [`docs/bugs.md`](docs/bugs.md): known findings about the SDK and the mod.

**Spoilers:** `docs/story.md` describes the full plot and every solution.

## Credits

Made by shiinobu. Some images were made with AI tools. Font notes are in
[`docs/font-licenses.md`](docs/font-licenses.md). Built with the official HackHub
content SDK.

Suggestions, feedback and criticism are welcome.

## License

Not specified yet.
