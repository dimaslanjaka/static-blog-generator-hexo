/* eslint-disable @typescript-eslint/triple-slash-reference */
/* jshint node: true, strict: true */

'use strict';

import jsdom from 'jsdom';
import fs from 'fs';
import upath from 'upath';
import PluginError from 'plugin-error';
import through2 from 'through2';
import truecasepath from 'true-case-path';
const pluginName = 'gulp-dom';
const path = {
  join: (...str: string[]) => upath.toUnix(truecasepath.trueCasePathSync(upath.join(...str))),
  dirname: (str: string) => upath.toUnix(truecasepath.trueCasePathSync(upath.dirname(str))),
  toUnix: (str: string) => upath.toUnix(truecasepath.trueCasePathSync(str))
};

export const customPath = path;
export const gulpDomPath = path;

/**
 * Callback/Mutator
 * * this: jsdom
 * * path: current file.path
 */
export type GulpDomCallback = (/** jsdom bind */ this: Document, /** current file path */ path: string) => any;

/**
 * gulpDom
 * @param mutator callback
 * @returns
 */
export default function gulpDom(mutator: GulpDomCallback) {
  const stream = through2.obj(function (file, _enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return stream.emit('error', new PluginError(pluginName, 'Streaming not supported'));
    }

    if (file.isBuffer()) {
      try {
        const dom = new jsdom.JSDOM(file.contents.toString('utf8'));
        const mutated = mutator.call(dom.window.document, file.path);

        file.contents = Buffer.from(typeof mutated === 'string' ? mutated : dom.serialize());
        callback(null, file);

        dom.window.close();
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
        console.log(pluginName, 'drop file', file.path);
        // drop file
        callback();
      }
    }
  });

  return stream;
}
/**
 * write to file recursively
 * @param {string} dest
 * @param {any} data
 */
function writefile(dest, data) {
  if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) {
    if (fs.statSync(dest).isDirectory()) throw dest + ' is directory';
  }
  fs.writeFileSync(dest, data);
}
