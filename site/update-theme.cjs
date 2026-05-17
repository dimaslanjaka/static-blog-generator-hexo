const fs = require('fs');
const path = require('path');
const axios = require('axios');
const tar = require('tar');
const cp = require('cross-spawn');

const DOWNLOAD_URL =
  'https://raw.githubusercontent.com/dimaslanjaka/hexo-themes/master/releases/hexo-theme-flowbite.tgz';
const TARGET_DIR = path.join(__dirname, 'themes', 'hexo-theme-flowbite');

function downloadTarball(url, targetDir) {
  return new Promise((resolve, reject) => {
    console.log(`Starting download from: ${url}`);

    // Ensure the target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Download and extract in one step
    axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    })
      .then(function (response) {
        // Pipe the HTTP response stream to the tar extractor
        response.data.pipe(
          tar.x({
            cwd: targetDir,
            strip: 1 // Removes the top-level 'package' folder inside the .tgz
          })
        );

        response.data.on('end', () => {
          console.log('Download and extraction completed successfully!');
          console.log(`Files are located in: ${targetDir}`);
          resolve(); // Resolve the promise on success
        });

        response.data.on('error', (err) => {
          console.error('Error during file processing:', err);
          reject(err); // Reject the promise on stream error
        });
      })
      .catch(function (error) {
        console.error('Download failed:', error.message);
        reject(error); // Reject the promise on request error
      });
  });
}

async function updateTheme() {
  await cp.spawnAsync('yarn', ['install'], { stdio: 'inherit', cwd: __dirname });
  await cp.spawnAsync('yarn', ['why', 'hexo-theme-flowbite'], { stdio: 'inherit', cwd: __dirname });
  await cp.spawnAsync('npx', ['-y', 'hexo-theme-flowbite', '--debug'], { stdio: 'inherit', cwd: __dirname });
}

async function main() {
  await downloadTarball(DOWNLOAD_URL, TARGET_DIR);
  await updateTheme();
}

main().catch((err) => {
  console.error('An error occurred:', err);
});
