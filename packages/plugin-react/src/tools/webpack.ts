import WebpackChain from 'webpack-chain'
import { startClientBuild, startClientServer, startServerBuild } from '../webpack'

export const webpackStart = async () => {
  const { getServerWebpack } = await import('../config/server')
  const serverConfigChain = new WebpackChain()

  const { getClientWebpack } = await import('../config')
  const clientConfigChain = new WebpackChain()
  await Promise.all([
    startServerBuild(getServerWebpack(serverConfigChain)),
    startClientServer(getClientWebpack(clientConfigChain)),
  ])
}

export const webpackBuild = async () => {
  const { getClientWebpack, getServerWebpack } = await import('../config')
  const serverConfigChain = new WebpackChain()
  const clientConfigChain = new WebpackChain()
  await Promise.all([
    startServerBuild(getServerWebpack(serverConfigChain)),
    startClientBuild(getClientWebpack(clientConfigChain)),
  ])
}
