const assign = require('assign-deep')
const {
  SMCP,
  GLP_ON,
  GLP_MIN,
  GLP_MAX,
  GLP_DB,
  GLP_LO,
  GLP_FX,
  GLP_FR,
  GLP_UP,
  glp_simplex,
  glp_add_cols,
  glp_add_rows,
  glp_mip_obj_val,
  glp_mip_col_val,
  glp_set_obj_dir,
  glp_set_print_func,
  glp_set_col_bnds,
  glp_set_obj_coef,
  glp_set_mat_row,
  glp_set_row_bnds,
  glp_set_row_name,
  glp_create_prob,
  glp_set_obj_name
} = require('glpk.js')

module.exports = simplex

function * seq (i, n) { while (i < n) yield i++ }

const DBL_MAX = Number.MAX_VALUE
const defaults = {
  objective: { dir: 'max' }
}

function simplex (p) {
  const {objective: {coef, dir}, lbs, ubs, constraints} = assign({}, defaults, p)

  let log = ''
  glp_set_print_func((p.print) || ((s) => (log += s + '\n')))
  const lp = glp_create_prob()
  const n = coef.data.length
  const m = constraints.length

  glp_set_obj_dir(lp, /^max/i.test(dir) ? GLP_MAX : GLP_MIN)
  glp_set_obj_name(lp, 'obj')
  glp_add_cols(lp, n)
  glp_add_rows(lp, m)

  for (let i = 0; i < n; i++) {
    let lb = lbs.data[i]
    let ub = ubs.data[i]
    let type
    if (lb === -DBL_MAX && ub === +DBL_MAX) type = GLP_FR
    else if (ub === +DBL_MAX) type = GLP_LO
    else if (lb === -DBL_MAX) type = GLP_UP
    else if (lb !== ub) type = GLP_DB
    else type = GLP_FX

    glp_set_obj_coef(lp, i + 1, coef.data[i])
    glp_set_col_bnds(lp, i + 1, type, lb, ub)
  }

  for (let i = 0; i < m; i++) {
    let [coef, type, val] = constraints[i]
    type = type === '>=' ? GLP_LO : type === '<=' ? GLP_UP : GLP_FX
    coef = Array.of(...coef.entries())
      .filter(([k, v]) => v !== 0)
      .reduce((r, [k, v]) => { r[0].push(k + 1); r[1].push(v); return r }, [[void 0], [void 0]])
    glp_set_mat_row(lp, i + 1, coef[0].length - 1, ...coef)
    glp_set_row_name(lp, i + 1, `r.${i}`)
    glp_set_row_bnds(lp, i + 1, type, val)
  }

  const smcp = new SMCP({presolve: GLP_ON})
  glp_simplex(lp, smcp)

  const result = {
    objective: glp_mip_obj_val(lp),
    x: Array.of(...seq(0, n - 1)).map((i) => glp_mip_col_val(lp, i + 1))
  }

  if (log.length) result.log = log

  return result
}
