import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import { validateFile, validateFileOpt } from './validate';

/**
 * - `gpv -f test/empty-body.html`
 */
const argv = minimist(process.argv.slice(2));

const file: string = argv.f || argv.file;
const alias: string = argv.a || argv.alias;
const scope: string = argv.s || argv.scope || '';

if (file.length > 0) {
  const options: Partial<validateFileOpt> = {};
  scope.split(',').forEach((str) => {
    options[str] = true;
  });
  let toCheck = file;
  if (!fs.existsSync(file)) toCheck = path.resolve(process.cwd(), file);
  validateFile(toCheck, alias, options as validateFileOpt);
} else {
  // throw exit
  throw new Error(file + ' not exist');
}
