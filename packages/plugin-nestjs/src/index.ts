import { start } from './start'
import { build } from './build'

export function serverPlugin() {
  return {
    start,
    build,
  }
}
