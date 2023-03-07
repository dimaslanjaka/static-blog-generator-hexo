import ansiColors from 'ansi-colors';
import fs from 'fs';
import jsdom from 'jsdom';

export interface validateFileOpt {
  /**
   * validate file size
   */
  size: boolean;
  /**
   * validate html body is not empty
   */
  body: boolean;
}

/**
 * validate file
 * @param file file absolute path
 * @param as alias name
 */
export function validateFile(file: string, as: string, options?: validateFileOpt) {
  options = Object.assign({ size: true, body: true }, options);

  if (options.size && fs.statSync(file).size === 0) {
    console.error(`${ansiColors.redBright('file is empty')} ${as || file}`);
    exit();
  }

  if (options.body) {
    const dom = new jsdom.JSDOM(fs.readFileSync(file));
    const { window } = dom;
    const { document } = window;
    const bodyEmpty = document.body.innerHTML.trim().length === 0;
    // throw when body is empty
    if (bodyEmpty) {
      console.error(`${ansiColors.redBright('html body is empty')} ${as || file}`);
      exit();
    }

    document.close();
    window.close();
  }

  console.log(ansiColors.greenBright('success'), file);
}

/**
 * process exit
 * @param code exit code. 1=exit failure, 0=exit success, default=1
 */
export function exit(code = 1) {
  process.exit(code || 1);
}
