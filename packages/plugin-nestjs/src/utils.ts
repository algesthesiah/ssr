import { Argv } from 'cssr-types'

const getNormalizeArgv = (
  argv: Argv,
  options: {
    singleDash?: string[]
    doubleDash?: string[]
  }
) => {
  const { singleDash, doubleDash } = options
  let normalizeArgv = ''
  // eslint-disable-next-line guard-for-in
  for (const key in argv) {
    const val = argv[key]
    if (singleDash?.includes(key)) {
      normalizeArgv += `-${key} ${typeof val === 'boolean' ? '' : val}`
    } else if (doubleDash?.includes(key)) {
      normalizeArgv += `--${key} ${typeof val === 'boolean' ? '' : val}`
    }
    normalizeArgv += ' '
  }
  if (argv.showArgs) {
    console.log(normalizeArgv)
  }
  return normalizeArgv
}

export { getNormalizeArgv }
