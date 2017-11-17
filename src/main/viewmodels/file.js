/* global fetch, prompt */
const frs = require('filereader-stream')
const through = require('through2')

const filePicker = require('../lib/file-picker')
const { biomodelsUrl } = require('../lib/biomodels')

module.exports = function () {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const reader = () => through((chunk) => emit('sbml:parse', chunk))

    on('sbml_response:parse:done', (m) => emit('model:set', m))

    on('file:select:file', () => {
      filePicker({accept: '.xml'}, (files) => files.length && emit('file:open:file', files[0]))
    })

    on('file:select:url', () => {
      const url = prompt('paste url here')
      if (url) emit('file:open:url', url)
    })

    on('file:select:biomodelsid', () => {
      const id = prompt('paste biomodels id here')
      if (id) emit('file:open:biomodelsid', id)
    })

    on('file:open:biomodelsid', (id) => {
      emit('file:open:url', biomodelsUrl(id))
    })

    on('file:open:file', (file) => {
      emit('log:info', `loading model file '${file.name}'`)
      emit('progress:start')
      frs(file).pipe(reader()).on('error', (e) => {
        emit('log:error', e)
        emit('progress:done')
      })
    })

    on('file:open:url', (url) => {
      emit('log:info', `loading model url '${url}'`)
      emit('progress:start')
      fetch(url)
        .then((response) => {
          if (response.status === 404) throw new Error(`No file found at '${url}'.`)
          if (response.status >= 400) throw new Error(response.statusText)
          return response.text()
        })
        .then((text) => reader().write(text))
        .catch((e) => {
          emit('log:error', e)
          emit('progress:done')
        })
    })
  }
}
