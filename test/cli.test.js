import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../bin/cli.js', import.meta.url));
const NAME = 'plugin-marketplace-demo';

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'pmd-'));
  const run = (cmd) => execFileSync(process.execPath, [CLI, cmd], { env: { ...process.env, CLAUDE_CONFIG_DIR: dir }, encoding: 'utf8' });
  const known = () => JSON.parse(readFileSync(join(dir, 'plugins', 'known_marketplaces.json'), 'utf8'));
  return { dir, run, known, dest: join(dir, 'plugins', 'marketplaces', NAME) };
}

test('init copies the marketplace and registers it, preserving other marketplaces', () => {
  const { dir, run, known, dest } = setup();
  mkdirSync(join(dir, 'plugins'), { recursive: true });
  writeFileSync(join(dir, 'plugins', 'known_marketplaces.json'), JSON.stringify({ other: { source: { source: 'github', repo: 'a/b' } } }));

  run('init');
  run('init');

  const manifest = JSON.parse(readFileSync(join(dest, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.equal(manifest.name, NAME);
  for (const p of manifest.plugins) assert.ok(existsSync(join(dest, p.source, '.claude-plugin', 'plugin.json')));
  assert.deepEqual(known()[NAME].source, { source: 'directory', path: dest });
  assert.equal(known()[NAME].installLocation, dest);
  assert.ok(known().other);
});

test('remove unregisters and deletes only this marketplace', () => {
  const { run, known, dest } = setup();
  run('init');
  run('remove');
  assert.ok(!existsSync(dest));
  assert.ok(!(NAME in known()));
});

test('unknown command exits non-zero', () => {
  const { run } = setup();
  assert.throws(() => run('bogus'));
});
