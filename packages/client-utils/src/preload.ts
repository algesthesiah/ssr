import { pathToRegexp } from 'path-to-regexp'
import { normalizePath } from './utils'

const preloadComponent = async (Routes: any[], PrefixRouterBase?: string) => {
  for (const route of Routes) {
    const { component, path } = route
    let pathname = location.pathname
    if (PrefixRouterBase) {
      pathname = normalizePath(pathname, PrefixRouterBase)
    }
    if (component.name === 'dynamicComponent' && pathToRegexp(path).test(pathname)) {
      // eslint-disable-next-line no-await-in-loop
      route.component = (await component()).default
    }
  }
  return Routes
}

export { preloadComponent }
