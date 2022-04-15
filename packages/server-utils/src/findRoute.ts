import { pathToRegexp } from 'path-to-regexp'

const cache = {}
const cacheLimit = 10000
let cacheCount = 0

function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {})

  if (pathCache[path]) return pathCache[path]

  const keys = []
  const regexp = pathToRegexp(path, keys, options)
  const result = { regexp, keys }

  if (cacheCount < cacheLimit) {
    pathCache[path] = result
    cacheCount += 1
  }

  return result
}

type IMatchPath = {
  path: string
  url: string
  isExact: boolean
  params: any
} | null
function matchPath(pathname, options = {}): IMatchPath {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options }
  }

  const { path: _path, exact = false, strict = false, sensitive = false } = options as any

  const paths = [].concat(_path)

  // eslint-disable-next-line @typescript-eslint/no-shadow
  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null as IMatchPath
    if (matched) return matched

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive,
    })
    const match = regexp.exec(pathname)

    if (!match) return null as IMatchPath

    const [url, ...values] = match
    const isExact = pathname === url

    if (exact && !isExact) return null as IMatchPath

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index]
        return memo
      }, {}),
    }
  }, null as IMatchPath)
}

function findRoute<T extends { path: string }>(Routes: T[], path: string): T {
  // 根据请求的 path 来匹配到对应的 Component
  const route = Routes.find(_route => matchPath(path, _route) && matchPath(path, route)?.isExact)
  return route
}

export { findRoute }
