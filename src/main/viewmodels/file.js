/* global fetch */
const frs = require('filereader-stream')

const service = require('../services')
const { pipewrap } = require('../lib/util')
const { Model, revive } = require('../model')
const filePicker = require('../lib/file-picker')

module.exports = function () {
  return function (state, emitter) {
    const emit = emitter.emit.bind(emitter)
    const on = emitter.on.bind(emitter)
    const render = () => emitter.emit('render')

    const set = (m) => {
      emit('model:set', m)
      emit('progress:done')
    }

    const reader = () => {
      const r = service.createStream('sbml')
      r.pipe(pipewrap(revive)).on('data', set)
      return r
    }

    on('model:set', (model) => {
      emit('log:info', `loaded model '${model.id}'`)
      state.content.model = model
      render()
    })

    on('model:new', () => {
      emit('model:set', new Model())
      render()
    })

    on('file:select:file', () => {
      filePicker({accept: '.xml'}, (files) => files.length && emit('file:open:file', files[0]))
    })

    on('file:open:file', (file) => {
      emit('log:info', `loading model file '${file.name}'`)
      emit('progress:start')
      frs(file).pipe(reader())
    })

    on('file:open:url', (url) => {
      emit('log:info', `loading model url '${url}'`)
      emit('progress:start')
      fetch(url)
        .then((response) => response.text())
        .then((text) => reader().write(text))
    })
  }
}
