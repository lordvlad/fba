module.exports = function filePicker (opts, callback) {
  if (arguments.length === 1) {
    callback = opts
    opts = {}
  }

  const i = document.createElement('input')
  i.type = 'file'
  if (opts.accept) i.accept = opts.accept
  if (opts.multiple) i.multiple = opts.multiple
  if (opts.dir) i.dir = opts.dir

  i.onchange = function () {
    const files = i.files
    document.body.removeChild(i)
    callback(files)
  }

  document.body.appendChild(i)
  i.click()
}
