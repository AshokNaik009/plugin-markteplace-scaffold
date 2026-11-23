# plugin-marketplace-demo

Demo Claude Code plugin marketplace, shipped as a Node package.

## Usage

```sh
npx plugin-marketplace-demo init
```

or install globally:

```sh
npm install -g plugin-marketplace-demo
plugin-marketplace-demo init
```

`init` does two things:

1. Copies the marketplace to `~/.claude/plugins/marketplaces/plugin-marketplace-demo/`
2. Registers it in `~/.claude/plugins/known_marketplaces.json`

Then, inside Claude Code:

```
/plugin install starter@plugin-marketplace-demo
```

Re-run `init` after upgrading the package to refresh the installed copy. `plugin-marketplace-demo remove` unregisters the marketplace and deletes its files.

Set `CLAUDE_CONFIG_DIR` to target a config directory other than `~/.claude`.

## Layout

```
bin/cli.js                         CLI (init, remove)
marketplace/
  .claude-plugin/marketplace.json  marketplace manifest
  plugins/
    starter/
      .claude-plugin/plugin.json
      commands/hello.md
      skills/team-conventions/SKILL.md
```

## Adding a plugin

1. Create `marketplace/plugins/<name>/.claude-plugin/plugin.json` plus its `commands/`, `skills/`, `agents/` or `hooks/`.
2. Add an entry to `marketplace/.claude-plugin/marketplace.json`.
3. Validate with `claude plugin validate marketplace`, bump the version, and publish.

## Development

```sh
npm test
```
