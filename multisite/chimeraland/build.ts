import { copyPost } from './project'
import './src'
import copySource from './src/copy-source'
import copySrcPost from './src/copy-src-posts'

copySrcPost().on('end', function () {
  copySource().on('end', function () {
    copyPost()
  })
})
