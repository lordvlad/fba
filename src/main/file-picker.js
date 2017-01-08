/**
 * Force-open a filePicker dialog, like the one seen when
 * clicking on a file selection input. Will call {@code callback}
 * with the `FileList` object, containing the selected files.
 *
 * @param {{accept: String, multiple: boolean, dir: boolean}} opts an options object
 * @param opts.accept - a comma-delimited string of accepted mime-types
 * @param opts.multiple - whether to accept multiple files, defaults to false
 * @param opts.dir - whether to accept directory selection, defaults to false
 * @param {function} callback
 */
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
