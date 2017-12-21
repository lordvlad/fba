const { existsSync, createWriteStream } = require('fs')
const browserify = require('browserify-incremental')
const uglify = require('minify-stream')
const exorcist = require('exorcist')
const fromString = require('from2-string')
const createHtml = require('create-html')
const { sync: rimraf } = require('rimraf')
const { sync: mkdirp } = require('mkdirp')

const pkg = require('./package.json')

const entries = 'index.js'
const cacheFile = `.${entries}.browserify-cache`
const debug = true
const dist = 'dist'
const distCss = 'index.css'
const distJs = 'index.js'
const distHtml = 'index.html'

if (!existsSync(dist)) mkdirp(dist)

rimraf(`${dist}/${distJs}`)
rimraf(`${dist}/${distCss}`)
browserify({ cacheFile, debug, entries })
  .plugin('common-shakeify')
  .plugin('bundle-collapser/plugin')
  .plugin('split-require')
  .plugin('css-extract', { out: `${dist}/${distCss}` })
  .transform('yo-yoify')
  .transform('sheetify', { use: ['sheetify-cssnext'] })
  .transform('unassertify')
  .bundle()
  .pipe(uglify({ keep_fnames: true, sourceMap: { content: 'inline' } }))
  .pipe(exorcist(`${dist}/${distJs}.map`))
  .pipe(createWriteStream(`${dist}/${distJs}`))

// rimraf(`${dist}/${distHtml}`)
if (!existsSync(`${dist}/${distHtml}`)) {
  fromString(createHtml({
    title: pkg.name,
    script: `${distJs}`,
    css: `${distCss}`,
    lang: 'en',
    scriptAsync: true
  })).pipe(createWriteStream(`${dist}/${distHtml}`))
}
