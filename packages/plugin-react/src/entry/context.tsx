/* eslint-disable */
import React, { useReducer } from 'react'
import { IProps, Action, ReactRoutesType } from 'cssr-types-react'
import { IWindow } from 'cssr-types'
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { STORE_CONTEXT } from '_build/create-context'
import { Routes } from './create-router'

const { reducer, state } = Routes as ReactRoutesType

const userState = state ?? {}
const userReducer = reducer ?? function () {}

const isDev = process.env.NODE_ENV !== 'production'

// 客户端的 context  只需要创建一次，在页面整个生命周期内共享
declare const window: IWindow

function defaultReducer(state: any, action: Action) {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case 'updateContext':
      if (isDev) {
        console.log('[SSR:updateContext]: dispatch updateContext with action')
        console.log(action)
      }
      return { ...state, ...action.payload }
  }
}

const initialState = { ...(userState ?? {}), ...window.__INITIAL_DATA__ }

function combineReducer(state: any, action: any) {
  return defaultReducer(state, action) || userReducer(state, action)
}
export function AppContext(props: IProps) {
  const [state, dispatch] = useReducer(combineReducer, initialState)
  return <STORE_CONTEXT.Provider value={{ state, dispatch }}>{props.children}</STORE_CONTEXT.Provider>
}
