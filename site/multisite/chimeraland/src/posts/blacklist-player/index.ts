import fs from 'fs-extra'
import { buildPost, postMap, postMeta } from 'hexo-post-parser'
import { Options, minify } from 'html-minifier-terser'
import { JSDOM } from 'jsdom'
import { marked } from 'marked'
import { EOL } from 'os'
import sbgutil from 'sbg-utility'
import slugify from 'slugify'
import path from 'upath'
import { chimeralandProject } from '../../../project.cjs'
import { screenshotsGlob } from './screenshot'

const metadata: postMeta = {
  title: 'Chimeraland Scammer List Player',
  description:
    'Blacklist player chimeraland (scammer list meliputi ruby trader, map illustrious 16 party, roll drop item, dan lain-lain). daftar SCAMMER chimeraland MAP ILLUSTRIOUS 16. daftar SCAMMER chimeraland ruby.',
  date: '2022-11-07T19:54:01+07:00',
  updated: '2023-08-16T19:13:37+07:00',
  lang: 'id',
  permalink: '/chimeraland/blacklist-player.html',
  multilang: {
    id: '/chimeraland/blacklist-player.html',
    en: '/chimeraland/en/blacklist-player.html'
  },
  tags: ['chimeraland'],
  categories: ['games', 'chimeraland'],
  keywords: ['scammer list chimeraland', 'blacklist player chimeraland'],
  thumbnail:
    'https://rawcdn.githack.com/dimaslanjaka/source-posts/d8f65abfe4e6d85cc18fd71cb1658227582bec67/chimeraland/blacklist-player/thumbnail.png',
  author: 'L3n4r0x'
}
const translator = fs
  .readFileSync(path.join(__dirname, 'translator.html'))
  .toString()
const bodyfile = path.join(__dirname, 'body.md')

let bodymd = ''
let bodyhtml = ''
let dom: JSDOM
try {
  bodymd = fs.readFileSync(bodyfile).toString()
  console.log('body.md size:', bodymd.length, 'characters')
} catch (err) {
  console.error('Error reading body.md:', err)
  throw err
}
try {
  bodyhtml = marked.parse(bodymd, { async: false }) as string
  console.log('bodyhtml size:', bodyhtml.length, 'characters')
} catch (err) {
  console.error('Error rendering markdown:', err)
  throw err
}
try {
  dom = new JSDOM(bodyhtml)
} catch (err) {
  console.error('Error creating JSDOM:', err)
  throw err
}

Array.from(dom.window.document.querySelectorAll('table')).forEach(
  function (table) {
    table.setAttribute('style', 'width:100%;')
    Array.from(table.querySelectorAll('tr')).forEach((tr) => {
      const player = tr.querySelector('td:nth-child(1)')
      if (player && !/nama player/gim.test(player.innerHTML)) {
        // console.log(player.innerHTML)
        // tell google translate do not translate this element
        // https://stackoverflow.com/a/9629628
        player.setAttribute('notranslate', 'true')
        player.setAttribute(
          'class',
          (player.getAttribute('class') || '').trim() + ' notranslate'
        )
        // add attribute id to player nickname
        const id = slugify(player.innerHTML)
        if (!dom.window.document.getElementById(id))
          player.setAttribute('id', id)
      }
    })
  }
)

Array.from(dom.window.document.querySelectorAll('*')).forEach(function (el) {
  let style = el.getAttribute('style') || ''
  if (!style.includes('vertical-align')) {
    if (!style.endsWith(';')) style += ';'
    style += 'vertical-align: unset;'
  }
})

// remove .header-ancor
Array.from(dom.window.document.querySelectorAll('a')).forEach((el) => {
  if (/anchor/gim.test(el.getAttribute('class') || '')) {
    el.removeAttribute('class')
  }
})

let body = dom.window.document.body.innerHTML
dom.window.close()
// console.log(body)

console.log('Processing screenshots...')

// include screenshots
screenshotsGlob().then(function (ss) {
  body = body.replace('<!-- tangkapan.layar -->', ss.join(EOL))

  // Free up memory by releasing dom and related objects
  if (typeof global.gc === 'function') {
    global.gc()
  }

  // Do the <!-- ss --> replacement only once
  const finalBody = body.replace('<!-- ss -->', translator + '\n')

  const opt: Options = {
    removeTagWhitespace: false,
    removeAttributeQuotes: false,
    minifyCSS: true,
    minifyJS: true
  }

  minify(finalBody, opt).then((minified) => {
    const post: postMap = {
      metadata,
      body: minified,
      rawbody: minified
    }
    const build = buildPost(post)
    const saveTo = path.join(
      chimeralandProject,
      'src-posts/blacklist-player.md'
    )
    console.log('blacklist saved', sbgutil.writefile(saveTo, build).file)
  })
})
