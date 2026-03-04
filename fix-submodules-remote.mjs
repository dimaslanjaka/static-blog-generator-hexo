import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import gch from 'git-command-helper';
import { execSync } from 'node:child_process';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ debug: false, quiet: true, override: true });

const token = process.env.ACCESS_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
  console.error('No GitHub token found in ACCESS_TOKEN or GITHUB_TOKEN');
  process.exit(1);
}

const argv = minimist(process.argv.slice(2));
const force = Boolean(argv.force || argv.f);
function runCmd(cmd, opts = {}) {
  if (force) {
    return execSync(cmd, opts);
  }
  console.log('[DRY-RUN]', cmd);
}

const git = new gch({ cwd: __dirname, user: process.env.GIT_USER || 'dimaslanjaka' });

const subs = git.submodules || [];
console.log(`Found ${subs.length} submodule(s)`);

// show raw URLs directly

for (const s of subs) {
  const urlStr = s.url;
  if (!urlStr) {
    console.log('Skipping', s.path, '(no URL)');
    continue;
  }
  if (urlStr.startsWith('git@') || urlStr.startsWith('ssh://')) {
    console.log('Skipping non-HTTPS submodule', s.path, urlStr);
    continue;
  }
  try {
    let remotesOutput = '';
    try {
      remotesOutput = execSync('git remote -v', { cwd: s.cwd, encoding: 'utf8' });
    } catch (e) {
      remotesOutput = '';
    }
    const remotes = {};
    if (remotesOutput) {
      for (const line of remotesOutput.split(/\r?\n/)) {
        const m = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
        if (m) {
          const name = m[1];
          const url = m[2];
          if (!remotes[name]) remotes[name] = url;
        }
      }
    }
    if (Object.keys(remotes).length === 0) remotes['origin'] = urlStr;
    const prefix = force ? '[APPLY]' : '[DRY-RUN]';
    console.log(`${prefix} ${s.path}`);
    for (const [name, rurl] of Object.entries(remotes)) {
      if (rurl.startsWith('git@') || rurl.startsWith('ssh://')) {
        console.log(`  ${name}: Skipping non-HTTPS remote (${rurl})`);
        continue;
      }
      const u = new URL(rurl);
      u.username = token;
      const newUrl = u.toString();
      console.log(`  ${name}:`);
      console.log(`    from: ${rurl}`);
      console.log(`      to: ${newUrl}`);
      if (force) {
        try {
          runCmd(`git remote set-url ${name} "${newUrl}"`, { cwd: s.cwd, stdio: 'inherit' });
          console.log(`  [OK] ${name} updated`);
        } catch (err) {
          console.error(`  [ERROR] ${name} update failed:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to update ${s.path}:`, err.message);
  }
}

console.log('Done. Review changes and commit any desired updates.');
