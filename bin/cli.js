#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const NAME = 'plugin-marketplace-demo';
const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'marketplace');

const claudeDir = () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');
const pluginsDir = () => join(claudeDir(), 'plugins');
const installDir = () => join(pluginsDir(), 'marketplaces', NAME);
const knownFile = () => join(pluginsDir(), 'known_marketplaces.json');

const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback);

function writeJson(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  renameSync(tmp, file);
}

function init() {
  const dest = installDir();
  const manifest = readJson(join(SOURCE, '.claude-plugin', 'marketplace.json'));
  const known = readJson(knownFile(), {});

  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(SOURCE, dest, { recursive: true });

  known[NAME] = {
    source: { source: 'directory', path: dest },
    installLocation: dest,
    lastUpdated: new Date().toISOString(),
  };
  writeJson(knownFile(), known);

  console.log(`Installed marketplace "${NAME}" to ${dest}`);
  console.log(`Registered in ${knownFile()}`);
  console.log('\nAvailable plugins:');
  for (const p of manifest.plugins) console.log(`  - ${p.name}: ${p.description}`);
  console.log('\nInstall one from Claude Code with:');
  for (const p of manifest.plugins) console.log(`  /plugin install ${p.name}@${NAME}`);
}

function remove() {
  const known = readJson(knownFile(), {});
  if (NAME in known) {
    delete known[NAME];
    writeJson(knownFile(), known);
  }
  rmSync(installDir(), { recursive: true, force: true });
  console.log(`Removed marketplace "${NAME}" from ${pluginsDir()}`);
}

const HELP = `Usage: ${NAME} <command>

Commands:
  init      Copy the marketplace into ~/.claude/plugins/marketplaces/${NAME}
            and register it in ~/.claude/plugins/known_marketplaces.json
  remove    Unregister the marketplace and delete its files
  help      Show this message

Set CLAUDE_CONFIG_DIR to target a Claude config directory other than ~/.claude.`;

const commands = { init, remove, help: () => console.log(HELP), '--help': () => console.log(HELP), '-h': () => console.log(HELP) };
const cmd = process.argv[2] ?? 'help';

if (!commands[cmd]) {
  console.error(`Unknown command: ${cmd}\n\n${HELP}`);
  process.exit(1);
}
try {
  commands[cmd]();
} catch (err) {
  console.error(`${NAME} ${cmd} failed: ${err.message}`);
  process.exit(1);
}
