import minimist from 'minimist';
import { exit, validateFile } from './validate';
import path from 'path';
import fs from 'fs';

/**
 * - `gpv -f test/empty-body.html`
 */
const argv = minimist(process.argv.slice(2));

const file: string = argv.f || argv.file;
const alias: string = argv.a || argv.alias;
const scope: string = argv.s || argv.scope || '';

if (file.length > 0) {
  const options = scope.split(',');
  console.log(options);
  let toCheck = file;
  if (!fs.existsSync(file)) toCheck = path.resolve(process.cwd(), file);
  validateFile(toCheck, alias);
} else {
  // throw exit
  throw new Error(file + ' not exist');
}
