// The file is provisional，don't depend on it

import React, { Context } from 'react'
import { IContext } from 'cssr-types-react'

// eslint-disable-next-line import/no-mutable-exports
let STORE_CONTEXT: Context<IContext>
// @ts-ignore
if (__isBrowser__) {
  STORE_CONTEXT =
    // @ts-ignore
    window.STORE_CONTEXT ||
    React.createContext<IContext>({
      state: {},
    })
  // @ts-ignore
  window.STORE_CONTEXT = STORE_CONTEXT
} else {
  STORE_CONTEXT = React.createContext<IContext>({
    state: {},
  })
}

export { STORE_CONTEXT }
