import { resolve } from 'path'
import { renderToString, renderToNodeStream } from 'react-dom/server'
import { loadConfig, getCwd, StringToStream, mergeStream2 } from 'cssr-server-utils'
import type { ViteDevServer } from 'vite'
import { UserConfig, IConfig, ISSRContext, ExpressContext } from 'cssr-types'

const cwd = getCwd()
const defaultConfig = loadConfig()

let viteServer: ViteDevServer | boolean = false
async function viteRender(ctx: ISSRContext, config: IConfig) {
  const { isDev, chunkName, reactServerEntry } = config
  let serverRes
  if (isDev) {
    const { createServer } = await import('vite')
    const { serverConfig } = await import('cssr-plugin-react')
    viteServer = !viteServer ? await createServer(serverConfig) : viteServer
    const { serverRender } = await (viteServer as ViteDevServer).ssrLoadModule(reactServerEntry)
    serverRes = await serverRender(ctx, config)
  } else {
    const serverFile = resolve(cwd, `./build/server/${chunkName}.server.js`)
    const { serverRender } = require(serverFile)
    const serverRes = await serverRender(ctx, config)
    return serverRes
  }
  return serverRes
}

async function commonRender(ctx: ISSRContext, config: IConfig) {
  const { isDev, chunkName } = config
  const serverFile = resolve(cwd, `./build/server/${chunkName}.server.js`)

  if (isDev) {
    delete require.cache[serverFile]
  }

  const { serverRender } = require(serverFile)
  const serverRes = await serverRender(ctx, config)
  return serverRes
}
async function render(ctx: ISSRContext, options?: UserConfig) {
  const config = { ...defaultConfig, ...(options ?? {}) }
  const { stream, isVite } = config

  if (!ctx.response.type && typeof ctx.response.type !== 'function') {
    ctx.response.type = 'text/html;charset=utf-8'
  } else if (!(ctx as ExpressContext).response.hasHeader?.('content-type')) {
    ;(ctx as ExpressContext).response.setHeader?.('Content-type', 'text/html;charset=utf-8')
  }

  const serverRes = isVite ? await viteRender(ctx, config) : await commonRender(ctx, config)
  if (stream) {
    const stream = mergeStream2(new StringToStream('<!DOCTYPE html>'), renderToNodeStream(serverRes))
    stream.on('error', (e: any) => {
      console.log(e)
    })
    return stream
  } else {
    return `<!DOCTYPE html>${renderToString(serverRes)}`
  }
}
export { render }
