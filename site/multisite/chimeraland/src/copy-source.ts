import fs from 'fs-extra'
import { join } from 'upath'
import { hexoProject } from '../project'

const sourceFolder = join(__dirname, '../source')
// const sourceOutputFolder = join(hexoProject, 'source/chimeraland')

/**
 * copy ../source to hexo project/source/chimeraland
 * @returns
 */
export function copySource(sourceOutputFolder: string) {
  return fs.copy(sourceFolder, sourceOutputFolder, { overwrite: true })
}

if (require.main === module) copySource(join(hexoProject, 'source/chimeraland'))

export default copySource
