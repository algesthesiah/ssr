import { Argv } from 'cssr-types'
import { loadConfig } from 'cssr-server-utils'

export const handleEnv = async (argv: Argv) => {
  process.env.BUILD_TOOL = argv.vite ? 'vite' : 'webpack'
  if (argv.analyze) {
    process.env.GENERATE_ANALYSIS = '1'
  }
  if (argv.html) {
    process.env.SPA = '1'
  }
  if (argv.legacy) {
    process.env.LEGACY_VITE = '1'
  }
  process.env.SERVER_PORT = argv.port ? String(argv.port) : '3000'
  const { https, isDev } = loadConfig()
  if (!!https && isDev) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
}
