import color from 'ansi-colors'
import fs from 'fs-extra'
import { join } from 'upath'
import { hexoProject } from '../project'

const srcPostFolder = join(__dirname, '../src-posts')
// const srcPostOutputFolder = join(hexoProject, 'src-posts/chimeraland')

/**
 * copy multisite/chimeraland/src-post to hexo project/src-posts/chimeraland
 * @returns
 */
export function copySrcPost(srcPostOutputFolder: string) {
  console.log(
    'copy',
    color.yellowBright(srcPostFolder.replace(process.cwd(), '')),
    'to',
    color.greenBright(srcPostOutputFolder.replace(process.cwd(), ''))
  )
  return fs.copy(srcPostFolder, srcPostOutputFolder, { overwrite: true })
}

export default copySrcPost

if (require.main === module) {
  // run standalone
  copySrcPost(join(hexoProject, 'src-posts/chimeraland'))
}
