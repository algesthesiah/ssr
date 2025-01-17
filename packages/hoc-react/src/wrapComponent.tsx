/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { IWindow } from 'cssr-types'
import { DynamicFC, StaticFC, Action, ReactESMFetch, ReactFetch } from 'cssr-types-react'
// @ts-expect-error
import { STORE_CONTEXT } from '_build/create-context'

declare const window: IWindow
function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation()
    let navigate = useNavigate()
    let params = useParams()
    return <Component {...props} router={{ location, navigate, params }} />
  }

  return ComponentWithRouterProp
}
let hasRender = false

interface fetchType {
  fetch?: ReactESMFetch
  layoutFetch?: ReactFetch
}

const fetchAndDispatch = async (
  { fetch, layoutFetch }: fetchType,
  dispatch: React.Dispatch<Action>,
  routerProps: any,
  state: any
) => {
  let asyncLayoutData = {}
  let asyncData = {}
  if (layoutFetch) {
    asyncLayoutData = await layoutFetch({ routerProps, state })
  }
  if (fetch) {
    const fetchFn = await fetch()
    asyncData = await fetchFn.default({ routerProps, state })
  }

  const combineData = { ...asyncLayoutData, ...asyncData }

  await dispatch({
    type: 'updateContext',
    payload: combineData,
  })
}

function wrapComponent(WrappedComponent: DynamicFC | StaticFC) {
  return withRouter(props => {
    const [ready, setReady] = useState(WrappedComponent.name !== 'dynamicComponent')
    const { state, dispatch } = useContext(STORE_CONTEXT as any)
    const didMount = async () => {
      if (hasRender || !window.__USE_SSR__) {
        // ssr 情况下只有路由切换的时候才需要调用 fetch
        // csr 情况首次访问页面也需要调用 fetch
        const { fetch, layoutFetch } = WrappedComponent as DynamicFC
        await fetchAndDispatch({ fetch, layoutFetch }, dispatch, props, state)
        if (WrappedComponent.name === 'dynamicComponent') {
          WrappedComponent = (await (WrappedComponent as DynamicFC)()).default
          WrappedComponent.fetch = fetch
          WrappedComponent.layoutFetch = layoutFetch
          setReady(true)
        }
      }
      hasRender = true
    }
    useEffect(() => {
      didMount()
    }, [])

    return ready ? <WrappedComponent {...props} /> : null
  })
}

export { wrapComponent }
