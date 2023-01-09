process.cwd = () => __dirname;
process.env.DEBUG = 'post:permalink,post:error';

const path = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const Axios = require('axios');
const glob = require('glob');
const crypto = require('crypto');
const { spawnAsync } = require('git-command-helper/dist/spawn');
const { Application, gulp } = require('./packages/static-blog-generator');
const { persistentCache } = require('persistent-cache');

gulp.task('actions:clean', function (done) {
  const cache = persistentCache({ name: 'actions-clean', base: path.join(__dirname, 'node_modules/.cache') });
  const currentHash = cache.getSync('folder-hash');
  const newHash = [path.join(__dirname, 'packages/static-blog-generator')].map((p) =>
    folder_to_hash('sha1', p, {
      ignored: ['**/release/**'],
      pattern: '**/src/**/*.ts'
    })
  );
  Promise.all(newHash)
    .then((arr) => arr.map((item) => item.hash))
    .then(function (result) {
      const mergedHash = result.join('-');

      if (!currentHash || mergedHash !== currentHash) {
        cache.setSync('folder-hash', mergedHash);
        return gulp.series('clean')(done);
      }

      done();
    });
});

async function cleanCopy(done) {
  const sbgPath = path.join(__dirname, 'packages/static-blog-generator');
  await fs.rm(path.join(sbgPath, 'dist'), { recursive: true, force: true });
  await spawnAsync('npm', ['run', 'build:nopack'], { cwd: sbgPath }).then((_) => {
    // console.log(_.output.join('\n'));
    console.log('static-blog-generator builded successful');
  });
  const api = new Application(__dirname);

  try {
    //console.log('clean-start');
    //await api.clean('database');
    //console.log('clean-ends');
    console.log('standalone-start');
    await api.standalone();
    console.log('standalone-ends');
    console.log('copy-start');
    await api.copy().catch((e) => {
      console.log('post copy error occurs');
      console.log(e);
    });
    console.log('copy-ends');
  } catch (e) {
    console.log(e);
  }

  if (typeof done == 'function') done();
}

if (require.main === module) {
  cleanCopy();
} else {
  /// console.log('required as a module');
}

gulp.task('actions:copy', () => gulp.series(cleanCopy));

/**
 * convert file to hash
 * @param {'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5'} alogarithm
 * @param {string} path
 * @param {import('crypto').BinaryToTextEncoding} encoding
 * @returns
 */
function file_to_hash(alogarithm, path, encoding = 'hex') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(alogarithm);
    const rs = fs.createReadStream(path);
    rs.on('error', reject);
    rs.on('data', (chunk) => hash.update(chunk));
    rs.on('end', () => resolve(hash.digest(encoding)));
  });
}

/**
 * convert data to hash
 * @param {'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5'} alogarithm
 * @param {string} path
 * @param {import('crypto').BinaryToTextEncoding} encoding
 * @returns
 */
function data_to_hash(alogarithm = 'sha1', data, encoding = 'hex') {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash(alogarithm).update(data).digest(encoding);
      resolve(hash);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * convert data to hash
 * @param {'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5'} alogarithm
 * @param {string} url
 * @param {import('crypto').BinaryToTextEncoding} encoding
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function url_to_hash(alogarithm = 'sha1', url, encoding = 'hex') {
  return new Promise((resolve, reject) => {
    let outputLocationPath = path.join(__dirname, 'node_modules/.cache/postinstall', path.basename(url));
    // remove slashes when url ends with slash
    if (!path.basename(url).endsWith('/')) {
      outputLocationPath = outputLocationPath.replace(/\/$/, '');
    }
    // add extension when dot not exist
    if (!path.basename(url).includes('.')) {
      outputLocationPath += '.tgz';
    }
    if (!fs.existsSync(path.dirname(outputLocationPath))) {
      fs.mkdirSync(path.dirname(outputLocationPath), { recursive: true });
    }
    const writer = fs.createWriteStream(outputLocationPath, { flags: 'w' });
    Axios.default(url, { responseType: 'stream' }).then((response) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', async () => {
        if (!error) {
          // console.log('package downloaded', outputLocationPath.replace(__dirname, ''));
          file_to_hash(alogarithm, outputLocationPath, encoding).then((checksum) => {
            resolve(checksum);
          });
        }
      });
    });
  });
}

/**
 * check package installed
 * @param {string} packageName
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isPackageInstalled(packageName) {
  try {
    const modules = Array.from(process.moduleLoadList).filter((str) => !str.startsWith('NativeModule internal/'));
    return modules.indexOf('NativeModule ' + packageName) >= 0 || fs.existsSync(require.resolve(packageName));
  } catch (e) {
    return false;
  }
}

/**
 * read file with validation
 * @param {string} str
 * @param {import('fs').EncodingOption} encoding
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readfile(str, encoding = 'utf-8') {
  if (fs.existsSync(str)) {
    if (fs.statSync(str).isFile()) {
      return fs.readFileSync(str, encoding);
    } else {
      throw str + ' is directory';
    }
  } else {
    throw str + ' not found';
  }
}

/**
 * write to file recursively
 * @param {string} dest
 * @param {any} data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function writefile(dest, data) {
  if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) {
    if (fs.statSync(dest).isDirectory()) throw dest + ' is directory';
  }
  fs.writeFileSync(dest, data);
}

/**
 * get hashes from folder
 * @param {'sha1' | 'sha256' | 'sha384' | 'sha512' | 'md5'} alogarithm
 * @param {string} folder
 * @param {{ ignored: string[], encoding: import('crypto').BinaryToTextEncoding, pattern: string }} options
 * @returns {Promise<{ filesWithHash: Record<string, string>, hash: string }>}
 */
async function folder_to_hash(alogarithm, folder, options) {
  return new Promise((resolve, reject) => {
    options = Object.assign({ encoding: 'hex', ignored: [] }, options || {});
    if (folder.startsWith('file:')) folder = folder.replace('file:', '');
    // fix non exist
    if (!fs.existsSync(folder)) folder = path.join(__dirname, folder);
    // run only if exist
    if (fs.existsSync(folder)) {
      glob(
        options.pattern || '**/*',
        {
          cwd: folder,
          ignore: (
            options.ignored || [
              '**/tmp/**',
              '**/build/**',
              '**/.cache/**',
              '**/dist/**',
              '**/.vscode/**',
              '**/coverage/**',
              '**/release/**',
              '**/bin/**',
              '**/*.json'
            ]
          ).concat('**/.git*/**', '**/node_modules/**'),
          dot: true,
          noext: true
        },
        async function (err, matches) {
          if (!err) {
            const filesWithHash = {};
            for (let i = 0; i < matches.length; i++) {
              const item = matches[i];
              const fullPath = upath.join(folder, item);
              const statInfo = fs.statSync(fullPath);
              if (statInfo.isFile()) {
                const fileInfo = `${fullPath}:${statInfo.size}:${statInfo.mtimeMs}`;
                const hash = await data_to_hash(alogarithm, fileInfo, options.encoding);
                filesWithHash[fullPath] = hash;
              }
            }
            resolve({
              filesWithHash,
              hash: await data_to_hash(alogarithm, Object.values(filesWithHash).join(''), options.encoding)
            });
          } else {
            reject(err);
          }
        }
      );
    } else {
      console.log(folder + ' not found');
    }
  });
}
