import minimist from 'minimist';

/**
 * - `gpv -f test/empty-body.html`
 */
const argv = minimist(process.argv.slice(2));

console.log(argv);
