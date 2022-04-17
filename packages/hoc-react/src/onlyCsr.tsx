// 通过使用该 HOC 使得组件只在客户端进行渲染
import React, { useState, useEffect } from 'react'
import { SProps } from 'cssr-types-react'

type FC = (props: SProps) => JSX.Element

function onlyCsr(WrappedComponent: FC): FC {
  return (props: SProps) => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
      setIsClient(true)
    }, [])
    return isClient ? <WrappedComponent {...props} /> : <div></div>
  }
}

export { onlyCsr }
