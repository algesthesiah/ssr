import { RouteComponentProps } from 'react-router-dom'
import type { Request, Response } from 'express'
import type { RouterContext } from 'koa-router'
import type { ICookies, SetOption } from 'cookies'
import { IConfig } from 'cssr-types'
import { Action } from './component'

type IObject = Record<string, any>
export interface ExpressContext {
  request: Request
  response: Response
}
type IKoaContext = Omit<RouterContext, 'cookies' | 'router' | '_matchedRoute' | '_matchedRouteName'> & {
  cookies: Omit<Partial<ICookies>, 'set'> & {
    set?: (name: string, value?: string | null, opts?: SetOption) => IKoaContext['cookies']
  }
}
export type ISSRContext<T = IObject> = (ExpressContext | IKoaContext) & T
export type ISSRNestContext<T = IObject> = ExpressContext & T

export interface LayoutProps {
  ctx?: ISSRContext
  config?: IConfig
  children?: JSX.Element
  staticList?: StaticList
  injectState?: any
}
export interface StaticList {
  injectCss: JSX.Element[]
  injectScript: JSX.Element[]
}

export interface ProvisionalFeRouteItem {
  path?: string
  layout: string
  fetch?: string
  component?: string
}

export interface Params<T, U> {
  ctx?: ISSRContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}
export interface ParamsNest<T, U> {
  ctx?: ISSRNestContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}

export type ReactFetch<T = IObject, U = IObject> = (params: Params<T, U>) => Promise<any>
export type ReactNestFetch<T = IObject, U = IObject> = (params: ParamsNest<T, U>) => Promise<any>

export type ReactESMFetch = () => Promise<{
  default: ReactFetch
}>

export type ESMLayout = () => Promise<React.FC<LayoutProps>>

export interface StaticFC<T = IObject> extends React.FC<T> {
  fetch?: ReactESMFetch
  layoutFetch?: ReactFetch
}

export interface DynamicFC<T = IObject> extends React.FC<T> {
  (): Promise<{
    default: StaticFC<T>
  }>
  name: 'dynamicComponent'
  fetch?: ReactESMFetch
  layoutFetch?: ReactFetch
}

export type ReactESMFeRouteItem<T = IObject, U = IObject> = {
  path: string
  fetch?: ReactESMFetch
  component: DynamicFC<T>
  webpackChunkName: string
} & U

export interface ReactRoutesType {
  Layout: React.FC<LayoutProps>
  App?: React.FC
  layoutFetch: ReactFetch
  FeRoutes: ReactESMFeRouteItem[]
  PrefixRouterBase?: string
  state?: any
  reducer?: any
}

export interface IContext<T = any> {
  state?: T
  dispatch?: React.Dispatch<Action>
}
