import { existsSync, mkdirpSync, writeFileSync } from 'fs-extra'
import prettier from 'prettier'
import ReactDOMServer from 'react-dom/server'
import slugify from 'slugify'
import { dirname, join } from 'upath'
import { inspect } from 'util'
import yaml from 'yaml'
import { hexoProject } from '../../project'
import { AttendantsData, MonstersData, RecipesData } from './chimeraland'
import { capitalizer } from './string'

// create markdown for attendants and monsters
MonstersData.concat(AttendantsData as any).forEach((item) => {
  const publicDir = join(hexoProject, 'src-posts/chimeraland', item.type)

  const attr: Record<string, any> = {}
  attr.title = capitalizer(item.type).replace(/s$/, '') + ' ' + item.name
  attr.webtitle = 'Chimeraland'
  attr.author = 'L3n4r0x'
  attr.updated = item.dateModified
  //attr.updated = moment().format()
  attr.date = item.datePublished
  attr.permalink = item.pathname
  attr.photos = item.images.map((image) => image.pathname)
  if (item.images.length > 0) {
    const featured = item.images.find((image) =>
      /feature/i.test(image.filename)
    )
    attr.thumbnail =
      (featured || item.images[0])?.pathname ||
      'https://via.placeholder.com/550x50/FFFFFF/000000/?text=' + item.name
  }
  attr.tags = []
  attr.categories = ['Games', 'Chimeraland']
  if (item.type === 'monsters') {
    attr.tags = ['Chimeraland', 'Monster', 'Pet']
    attr.categories.push('Monsters')
  } else {
    attr.tags = ['Chimeraland', 'Attendant']
    attr.categories.push('Attendants')
  }

  // remove undefineds
  item.delicacies = item.delicacies.filter(
    (str) => str.length > 0 && str !== 'undefined'
  )
  // add description when quality and delicacies written
  if (item.delicacies.length > 0 && item.qty.length > 0) {
    attr.description = `${item.type.replace(/s$/, '')} ${
      item.name
    } default quality ${item.qty} ${item.buff} delicacies/tasty ${
      item.delicacies
    } ${attr.categories} ${attr.tags}`.substring(0, 300)
  }

  // GRADE A ATK 75 HP 60 DEF 75
  const regex = /GRADE (\w{1}) ATK (\d{1,5}) HP (\d{1,5}) DEF (\d{1,5})/gim
  const qty = regex.exec(item.qty) || []
  let qtyhtm = <></>

  if (!qty) {
    console.log(item.name, 'empty quality')
  } else {
    qtyhtm = (
      <table>
        <tr>
          <th>GRADE</th>
          <td>{qty[1]}</td>
        </tr>
        <tr>
          <th>Attack</th>
          <td>{qty[2]}</td>
        </tr>
        <tr>
          <th>Health Point (HP)</th>
          <td>{qty[3]}</td>
        </tr>
        <tr>
          <th>Defense</th>
          <td>{qty[4]}</td>
        </tr>
      </table>
    )
  }

  let gallery: null | JSX.Element = null
  if (item.images) {
    gallery = (
      <div id="gallery">
        <h2>Galleries for {item.name}</h2>
        <div className="row">
          {item.images.map((image) => {
            return (
              <div className="col-lg-6 col-12" key={image.originalPath}>
                <img
                  src={image.pathname}
                  alt={item.name + ' ' + image.filename}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const mdC = (
    <section id="bootstrap-wrapper">
      <link
        rel="stylesheet"
        href="https://cdn.statically.io/gh/dimaslanjaka/Web-Manajemen/40ac3225/css/bootstrap-4.5-wrapper.css"
      />
      <h2>{item.name} Information from Chimeraland</h2>
      <p>
        <b>{item.name}</b> default attribute {item.qty}
        {qtyhtm}
      </p>
      <hr />
      <h2>Delicacies/Tasty for {item.name}</h2>
      {item.delicacies &&
        item.delicacies.map((recipeName) => {
          const recipe = RecipesData.find(
            (recipe) => recipe.name === recipeName
          )
          return (
            <li key={recipeName} className="d-flex justify-content-between">
              {recipeName}{' '}
              {recipe && (
                <a href={recipe.pathname}>
                  Click here to view recipe <i>{recipeName}</i> details
                </a>
              )}
            </li>
          )
        })}
      <hr />
      {gallery && gallery}
    </section>
  )
  let html = ReactDOMServer.renderToStaticMarkup(mdC).toString()

  try {
    html = prettier.format(html, { parser: 'html' })
  } catch (e) {
    if (e instanceof Error) {
      console.log('cannot prettify', item.name)
      if (!existsSync(join(process.cwd(), 'tmp')))
        mkdirpSync(join(process.cwd(), 'tmp'))
      writeFileSync(join(process.cwd(), 'tmp/prettier-error.log'), inspect(e))
    }
  }

  const output = join(
    publicDir,
    slugify(item.name, { trim: true, lower: true }) + '.md'
  )
  if (!existsSync(dirname(output))) mkdirpSync(dirname(output))
  writeFileSync(
    output,
    `
---
${yaml.stringify(attr).trim()}
---

${html}
  `.trim()
  )
})