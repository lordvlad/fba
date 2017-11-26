module.exports = function () {
  return function (state, emitter) {
    const empty = {focus: () => {}}
    const blur = () => document.activeElement.blur()
    const select = (id) => document.querySelector(id) || empty
    const focus = (id) => select(id).focus()
    const focusLater = (id) => setTimeout(() => focus(id), 10)

    emitter.on('blur', blur)
    emitter.on('focus', focusLater)

    emitter.emit('log:info', 'application started')
  }
}
