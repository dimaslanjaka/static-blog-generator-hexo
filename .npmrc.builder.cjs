
// This script generates a .npmrc file with recommended build settings for Windows native modules.

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const msvs_version = '2022'; // Specify the version of Visual Studio to use
const npmrcConfig = {
  'package-lock': 'false',
  msvs_version,
  python: 'D:\\bin\\python\\main\\python.exe',
  msbuild_path: `C:\\Program Files\\Microsoft Visual Studio\\${msvs_version}\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe`,
  VSINSTALLDIR: `C:\\Program Files\\Microsoft Visual Studio\\${msvs_version}\\Community`,
};

// Search python executable (cross-platform)
let pythonPath;
try {
  if (process.platform === 'win32') {
    pythonPath = childProcess.execSync('where python').toString().trim().split(/\r?\n/)[0];
  } else {
    pythonPath = childProcess.execSync('which python3 || which python').toString().trim().split(/\r?\n/)[0];
  }
  if (pythonPath) {
    npmrcConfig.python = pythonPath;
  }
} catch {
  // If python is not found, keep the default
}

const npmrcContent = Object.entries(npmrcConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n') + '\n';

const npmrcPath = path.resolve(__dirname, '.npmrc');
fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
console.log('.npmrc file generated at', npmrcPath);
