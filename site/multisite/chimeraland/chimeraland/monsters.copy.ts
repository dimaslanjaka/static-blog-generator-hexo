import ansiColors from 'ansi-colors'
import Bluebird from 'bluebird'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from 'fs'
import moment from 'moment-timezone'
import sharp from 'sharp'
import slugify from 'slugify'
import { basename, dirname, extname, join } from 'upath'
import { hexoProject } from '../project'
import monsters from './monsters.json'

const outputJSON = join(__dirname, '../src/utils/chimeraland-monsters.json')
const publicDIR = join(hexoProject, 'source/chimeraland')
const inputJSON = join(__dirname, 'monsters.json')
const inputDIR = join(__dirname, 'monsters')

type Extended = (typeof monsters)['data'][number] & {
  images: any[]
  videos: any[]
  pathname: string
  type: 'monsters'
}

/**
 * fix non-indexed data from json and local folder
 * @returns
 */
const fixData = function () {
  return new Bluebird((resolve) => {
    readdirSync(inputDIR)
      .filter((str) => str !== 'desktop.ini')
      .forEach((monsterName) => {
        const index = monsters.data.findIndex(
          (item) =>
            item.name === monsterName ||
            slugify(item.name, { lower: true }) ===
              slugify(monsterName, { lower: true })
        )
        const hasData = index !== -1
        if (!hasData) {
          // process new data
          console.log('adding', monsterName)
          const newItem: Required<(typeof monsters.data)[number]> = {
            name: monsterName,
            datePublished: moment().tz('Asia/Jakarta').format(),
            dateModified: moment()
              .tz('Asia/Jakarta')
              .add(11, 'minutes')
              .format(),
            qty: '',
            skill: [],
            buff: [],
            delicacies: []
          }
          monsters.data.push(newItem)
        } else {
          const item = monsters.data[index]
          if (!item.skill) item.skill = []
          if (!item.buff) item.buff = []
          if (!item.delicacies) item.delicacies = []
          monsters.data[index] = item
        }
      })

    writeFileSync(inputJSON, JSON.stringify(monsters, null, 2))
    resolve(null)
  })
}

const getData = () => {
  return new Bluebird((resolve) => {
    Bluebird.all(monsters.data as Extended[])
      .map(async (item) => {
        if ('images' in item === false) item.images = []
        if ('videos' in item === false) item.videos = []
        item.type = 'monsters'
        item.pathname =
          '/' +
          [
            'chimeraland',
            item.type,
            slugify(item.name, { lower: true, trim: true }) + '.html'
          ].join('/')
        const imagesDir = join(__dirname, 'monsters', item.name.toLowerCase())
        const type = 'monsters'
        if (existsSync(imagesDir)) {
          const dirs = readdirSync(imagesDir)
            .filter((str) => str !== 'desktop.ini')
            .map((filename) => {
              const outputfn = basename(filename, extname(filename)) + '.webp'
              return {
                filename: outputfn,
                folder: imagesDir,
                originalPath: join(imagesDir, filename),
                originalFilename: filename,
                pathname:
                  '/' +
                  [
                    'chimeraland',
                    type,
                    slugify(item.name, { lower: true, trim: true }),
                    outputfn
                  ].join('/')
              }
            })

          const results: typeof dirs = []
          while (dirs.length > 0) {
            const toProcess = dirs[0]
            const inputFile = toProcess.originalPath
            if (existsSync(inputFile) && /.(jpe?g|png)$/.test(inputFile)) {
              const input = readFileSync(inputFile)
              const output = join(
                publicDIR,
                toProcess.pathname.replace('/chimeraland/', '/')
              )
              if (!existsSync(output)) {
                if (!existsSync(dirname(output))) {
                  mkdirSync(dirname(output), { recursive: true })
                }
                try {
                  await sharp(input).webp().toFile(output)
                } catch (e) {
                  if (e instanceof Error) {
                    console.error(
                      ansiColors.redBright(item.name),
                      { inputFile, ext: extname(inputFile) },
                      e.message
                    )
                  }
                }
              }
              results.push(toProcess)
            } else {
              console.log(
                ansiColors.redBright('cannot process'),
                toProcess.originalPath
              )
            }
            dirs.shift()
          }

          return Object.assign({}, item, { images: results })
        }

        return item
      })
      .then(resolve)
  })
}

fixData().then(() =>
  getData().then((data) => {
    writeFileSync(outputJSON, JSON.stringify(data, null, 2))
    console.log('json written', outputJSON)
  })
)