import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_PACKAGES = ['gulp', 'glob', 'sbg-utility', 'upath', 'fs-extra'];
const PACKAGE_JSON = path.join(__dirname, 'package.json');
const YARN_LOCK = path.join(__dirname, 'yarn.lock');
const TMP_DIR = path.join(__dirname, 'tmp');
const CHECKSUM_FILE = path.join(TMP_DIR, 'checksum.txt');

function resolvePackage(name) {
  try {
    import.meta.resolve(name);
    return true;
  } catch {
    return false;
  }
}

function getMissingPackages() {
  return REQUIRED_PACKAGES.filter((pkg) => !resolvePackage(pkg));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.error || result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

function ensureYarnLock() {
  if (!fs.existsSync(YARN_LOCK)) {
    fs.writeFileSync(YARN_LOCK, '');
  }
}

function getPackageChecksum() {
  const content = fs.readFileSync(PACKAGE_JSON);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getStoredChecksum() {
  if (!fs.existsSync(CHECKSUM_FILE)) {
    return '';
  }

  return fs.readFileSync(CHECKSUM_FILE, 'utf8').trim();
}

function saveChecksum(checksum) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(CHECKSUM_FILE, checksum);
}

function installDependenciesIfNeeded() {
  const missingPackages = getMissingPackages();
  const currentChecksum = getPackageChecksum();
  const previousChecksum = getStoredChecksum();

  const shouldInstall = missingPackages.length > 0 || currentChecksum !== previousChecksum;

  if (!shouldInstall) {
    console.log('Dependencies are up to date.');
    return;
  }

  if (missingPackages.length > 0) {
    console.log('Missing packages:', missingPackages.join(', '));
  } else {
    console.log('package.json changed.');
  }

  ensureYarnLock();

  console.log('Running yarn install...');
  run('yarn', ['install']);

  saveChecksum(currentChecksum);

  console.log('Checksum updated:', currentChecksum);
}

function runSetup() {
  run('npx', ['--yes', 'update-browserslist-db@latest']);
}

function main() {
  installDependenciesIfNeeded();
  runSetup();
}

main();
