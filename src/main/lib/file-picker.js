let el
let onchange

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
  if (!el) create()
  onchange = callback || function () {}

  if (opts.multiple) el.multiple = opts.multiple
  if (opts.accept) el.accept = opts.accept
  if (opts.dir) el.dir = opts.dir

  el.click()
}

function create () {
  el = document.createElement('input')
  el.type = 'file'
  el.onchange = () => onchange && onchange(Array.from(el.files))
  // document.body.appendChild(el)
}
