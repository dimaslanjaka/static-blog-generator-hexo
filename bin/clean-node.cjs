const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// ----------------------
// CLI
// ----------------------
const argv = minimist(process.argv.slice(2), {
  boolean: ['force', 'help'],
  alias: { h: 'help', f: 'force' },
  default: { force: false }
});

if (argv.help) {
  console.log(`Usage: clean-node [--force]
By default runs in dry-run mode. Use --force to actually delete.`);
  process.exit(0);
}

const DRY_RUN = !argv.force;

// ----------------------
// CONSTANTS
// ----------------------
const customChars = '@.';
const vowels = 'aeiouAEIOU';
const alnum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const combined = alnum + vowels + customChars;

const ROOT = process.cwd();

// ----------------------
// HELPERS
// ----------------------
function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function remove(target) {
  // 🚫 skip symlinks entirely
  if (isSymlink(target)) {
    console.log('Skipping symlink', target);
    return;
  }

  if (DRY_RUN) {
    console.log('Would remove', target);
    return;
  }

  try {
    fs.rmSync(target, { recursive: true, force: true });
    console.log('Deleting', target);
  } catch (e) {
    console.error('Failed:', target, e.message);
  }
}

/**
 * Walk (no symlink traversal)
 */
function walk(dir, callback, { skipNodeModulesChildren = false } = {}) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 🚫 never follow symlinks
    if (entry.isSymbolicLink()) continue;

    // skip inside node_modules/*
    if (skipNodeModulesChildren && dir.includes('node_modules')) continue;

    callback(fullPath, entry);

    if (entry.isDirectory()) {
      if (skipNodeModulesChildren && entry.name === 'node_modules') {
        continue;
      }
      walk(fullPath, callback, { skipNodeModulesChildren });
    }
  }
}

// ----------------------
// NODE_MODULES HANDLER
// ----------------------
function processNodeModules(dir) {
  console.log('Found:', dir);

  let items;
  try {
    items = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const char of combined) {
    for (const name of items) {
      if (!name.startsWith(char)) continue;

      const target = path.join(dir, name);

      // 🚫 skip symlinked deps (important)
      if (isSymlink(target)) {
        console.log('Skipping symlink', target);
        continue;
      }

      remove(target);
    }
  }

  remove(dir);
}

// ----------------------
// MAIN
// ----------------------
function main() {
  const nodeModulesDirs = [];

  // find node_modules
  walk(ROOT, (fullPath, entry) => {
    if (entry.isDirectory() && entry.name === 'node_modules') {
      nodeModulesDirs.push(fullPath);
    }
  });

  for (const dir of nodeModulesDirs) {
    processNodeModules(dir);
  }

  // package-lock.json
  if (DRY_RUN) console.log('Would remove package-lock.json files:');
  walk(
    ROOT,
    (fullPath) => {
      if (path.basename(fullPath) === 'package-lock.json') {
        if (DRY_RUN) console.log(fullPath);
        else remove(fullPath);
      }
    },
    { skipNodeModulesChildren: true }
  );

  // yarn.lock
  if (DRY_RUN) console.log('Would remove yarn.lock files:');
  walk(
    ROOT,
    (fullPath) => {
      if (path.basename(fullPath) === 'yarn.lock') {
        if (DRY_RUN) console.log(fullPath);
        else remove(fullPath);
      }
    },
    { skipNodeModulesChildren: true }
  );

  // .yarn/cache
  if (DRY_RUN) console.log('Would remove .yarn/cache directories:');
  walk(
    ROOT,
    (fullPath, entry) => {
      if (entry.isDirectory() && fullPath.endsWith(path.join('.yarn', 'cache'))) {
        if (DRY_RUN) console.log(fullPath);
        else remove(fullPath);
      }
    },
    { skipNodeModulesChildren: true }
  );
}

main();
