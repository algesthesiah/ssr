import * as fs from 'fs'
import { resolve, join } from 'path'
import * as Yaml from 'js-yaml'
import * as Shell from 'shelljs'
import { Yml, FaasRouteItem, Argv, FeRouteItem } from 'ssr-types'
import { promisifyFsReadDir } from './promisify'
import { getCwd, getPagesDir } from './cwd'

const parseYml = (path: string) => {
  const cwd = getCwd()
  const yamlPath = resolve(cwd, path)
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8').toString()
  const result = Yaml.safeLoad(yamlContent)
  return result
}

const parseRoutesFromYml = (yamlContent: Yml) => {
  const routes: FaasRouteItem[] = []
  for (const funcName in yamlContent.functions) {
    const func = yamlContent.functions[funcName]
    func.events.forEach(event => {
      if (event.http) {
        routes.push({
          path: event.http.path,
          funcName,
          ...func.render
        })
      }
    })
  }
  return routes
}

const parseFeRoutes = async (argv: Argv): Promise<FeRouteItem[]> => {
  const pageDir = getPagesDir()
  // 根据目录结构生成前端路由表
  const cwd = getCwd()
  if (!fs.existsSync(join(cwd, './node_modules/ssr-cache'))) {
    Shell.mkdir(`${cwd}/node_modules/ssr-cache`)
  }
  const folders = await promisifyFsReadDir(pageDir) // 读取web目录
  const defaultLayout = `${join(pageDir, `/layout.tsx`)}`
  const arr = []
  if (!argv.mpa) {
    for (let i in folders) {
      const folder = folders[i]
      const abFolder = join(pageDir, folder)
      if (fs.statSync(abFolder).isDirectory()) {
        // 读取web下子目录
        const files = await promisifyFsReadDir(abFolder)
        const route: any = {
          layout: `require('${defaultLayout}').default`
        }

        for (let j in files) {
          const file = files[j]
          const abFile = join(abFolder, file)
          if (/render/.test(file)) {
            /* /news */
            route.path = folder === 'index' ? '/' : `/${folder}`
            route.component = `require('${abFile}').default`
          }

          if (/render\$/.test(file)) {
            /* /news/:id */
            route.path = `/${folder}/:${getDynamicParam(file)}`
            route.component = `require('${abFile}').default`
          }

          if (/render\$[\s\S]+\$/.test(file)) {
            /* /news:id? */
            route.path = `/${folder}/:${getDynamicParam(file)}?`
            route.component = `require('${abFile}').default`
          }

          if (/fetch/i.test(file)) {
            route.fetch = `require('${abFile}').default`
          }

          if (/layout/i.test(file)) {
            route.layout = `require('${abFile}').default`
          }
        }

        arr.push(route)
      }
    }
    // 添加默认根路由
    fs.existsSync(join(pageDir, './render.tsx')) && arr.push({
      path: '/',
      layout: `require('${defaultLayout}').default`,
      fetch: fs.existsSync(join(pageDir, './fetch.ts')) && `require('${join(pageDir, './fetch.ts')}').default`,
      component: `require('${join(pageDir, './render.tsx')}').default`
    })

    fs.writeFileSync(`${cwd}/node_modules/ssr-cache/route.js`,`module.exports =${JSON.stringify(arr)
        .replace(/\"layout\":(\"(.+?)\")/g, (global, m1, m2) => {
          return `"layout": ${m2.replace(/\^/g, '"')}`
        })
        .replace(/\"fetch\":(\"(.+?)\")/g, (global, m1, m2) => {
          return `"fetch": ${m2.replace(/\^/g, '"')}`
        })
        .replace(/\"component\":(\"(.+?)\")/g, (global, m1, m2) => {
          return `"component": ${m2.replace(/\^/g, '"')}`
        })
      }`
    )

  } else {
    // todo mpa

  }

  return arr
}

const getDynamicParam = (url: string) => {
  return url.split('$')[1].replace(/\.[\s\S]+/,'')
}

export {
  parseYml,
  parseRoutesFromYml,
  parseFeRoutes
}