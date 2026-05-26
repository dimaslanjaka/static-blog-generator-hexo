// Run original postinstall commands in a cross-platform way and suppress non-zero exit.
const { spawn } = require('child_process');
const path = require('upath');
const fs = require('fs-extra');
const cwd = process.env.INIT_CWD || process.cwd();

function run(command, args = [], opts = { stdio: 'inherit' }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      cwd: __dirname,
      ...opts
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      if (opts.stdio === 'inherit') process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      if (opts.stdio === 'inherit') process.stderr.write(data);
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr,
        child
      });
    });

    child.on('error', (error) => {
      resolve({
        code: 1,
        stdout,
        stderr,
        error,
        child
      });
    });
  });
}

async function configLoader() {
  await run('node', [path.join(__dirname, '_config.loader.cjs')], { stdio: 'inherit' });
}

async function findExistingPath(candidates) {
  for (const candidate of [...new Set(candidates)]) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function main() {
  try {
    await configLoader();
  } catch (err) {
    console.error('Failed to load configuration:');
    console.error(err.stack || err.message);
  }
  try {
    await buildWorkspace();
  } catch (err) {
    console.error('Failed to build workspace:');
    console.error(err.stack || err.message);
  }
  // finish with success to suppress npm failure
  process.exit(0);
}

async function buildWorkspace() {
  const { stdout } = await run('yarn', ['workspaces', 'list', '--json'], { stdio: 'pipe' });

  const workspaces = stdout
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));

  const flowbiteTheme = workspaces.find((pkg) => pkg.name === 'hexo-theme-flowbite');
  const hexoThemes = workspaces.find((pkg) => pkg.name === 'hexo-themes');

  console.log(`hexo-theme-flowbite workspace ${flowbiteTheme ? 'found at ' + flowbiteTheme.location : 'not found'}`);

  if (flowbiteTheme?.location && hexoThemes?.location) {
    const tarballCandidates = [
      path.resolve(hexoThemes.location, 'releases/hexo-theme-flowbite.tgz'),
      path.resolve(cwd, hexoThemes.location, 'releases/hexo-theme-flowbite.tgz'),
      path.resolve(__dirname, '..', '..', '..', hexoThemes.location, 'releases/hexo-theme-flowbite.tgz')
    ];
    const tarballPath = await findExistingPath(tarballCandidates);
    if (!tarballPath) {
      console.error('Tarball not found in any candidate location. Skipping local installation.');
      console.error(tarballCandidates.map((candidate) => `- ${candidate}`).join('\n'));
      return;
    }
    const relativePath = path.relative(cwd, tarballPath);
    if (!process.env.SKIP_BUILD || !(await fs.pathExists(tarballPath))) {
      console.log(`Packing hexo-theme-flowbite to ${relativePath}...`);
      await run(
        'run-c',
        [
          '--pattern',
          'hexo-renderers/src/**/*',
          '--pattern',
          'yarn.lock',
          '--exec',
          'yarn workspace hexo-renderers run build'
        ],
        { stdio: 'inherit' }
      );
      if (!(await fs.pathExists(tarballPath))) {
        console.error(`Tarball not found at ${tarballPath} after packing. Skipping local installation.`);
        return;
      }
    }
    console.log(`Executing hexo-theme-flowbite from ${relativePath}...`);
    await run('npx', ['-y', 'hexo-theme-flowbite@' + tarballPath, '--debug'], { stdio: 'inherit' });
  } else {
    console.log('hexo-theme-flowbite workspace not found. building from npm registry...');
    await run('npx', ['-y', 'hexo-theme-flowbite', '--debug'], { stdio: 'inherit' });
  }
}

main().catch((err) => {
  console.error('Unexpected error during postinstall:');
  console.error(err.stack || err.message);
  process.exit(0); // exit with success to suppress npm failure
});
