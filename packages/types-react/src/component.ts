/* eslint-disable @typescript-eslint/ban-types */
import { ReactChild } from 'react'

type IProps<T = {}> = T & {
  children: ReactChild
}

type SProps<T = {}> = T

interface Action {
  type: string
  payload: object
}

export { IProps, Action, SProps }
