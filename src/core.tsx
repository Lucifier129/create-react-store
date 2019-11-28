import React, { FC, useContext, useMemo, useRef, useEffect } from 'react'
import { mutate, remove, isBistate } from 'bistate'
import { useBistate, useMutate, useComputed, useBinding } from 'bistate/react'
import { enableProxyFormater, disableProxyFormater } from './formater'

let tracing = false

export const enableTracing = () => {
  tracing = true
  enableProxyFormater()
}

export const disableTracing = () => {
  tracing = false
  disableProxyFormater()
}

export type ActionOptions = {
  name: string
}

const createTracer = (f: (...args) => any, name?: string): typeof f => (...args) => {
  let start = tracing ? new Date() : null
  let infoItem = {
    name: name || f.name || '',
    func: f,
    args: args,
    start,
    end: null
  }

  info.actions.push(infoItem)

  try {
    return f(...args)
  } finally {
    infoItem.end = new Date()
  }
}

export const useAction = <F extends (...args) => any>(f: F, options?: ActionOptions): F => {
  let callback = useMemo(() => {
    if (tracing) {
      if (options) {
        return createTracer(f, options.name) as F
      } else {
        return createTracer(f) as F
      }
    } else {
      return f
    }
  }, [f, options ? options.name : null])

  let action = useMutate(callback)

  return action
}

let timer = null

let info = {
  actions: [],
  mutations: []
}

let showInfo = () => {
  let { actions, mutations } = info

  // reset info
  info = {
    actions: [],
    mutations: []
  }

  let time = actions.reduce((acc, item) => acc + (item.end.getTime() - item.start.getTime()), 0)

  let { start } = actions.reduce(
    (target, curr) => (target.start.getTime() < curr.start.getTime() ? target : curr),
    { start: new Date() }
  )

  let name = actions
    .map(item => item.name)
    .filter(Boolean)
    .join(', ')

  console.groupCollapsed(`${name || 'ACTION'} takes ${time}ms invoked at ${start.toLocaleString()}`)

  console.info(
    `%c action-list`,
    `color: #4CAF50; font-weight: bold`,
    actions.map(item => item.func)
  )

  for (let i = 0; i < mutations.length; i++) {
    let { prev, next } = mutations[i]

    console.info(`%c --------------------------`, `color: #9E9E9E; font-weight: bold`)

    console.info(`%c [${i + 1}] prev-state`, `color: #03A9F4; font-weight: bold`, prev)

    console.info(`%c [${i + 1}] next-state`, `color: #03A9F4; font-weight: bold`, next)
  }

  console.groupEnd()
}

export const useReactive: typeof useBistate = initialState => {
  let state = useBistate(initialState)
  let stateRef = useRef(state)

  useEffect(() => {
    if (state === stateRef.current) return
    if (!tracing) return

    info.mutations.push({
      prev: stateRef.current,
      next: state
    })

    stateRef.current = state

    clearTimeout(timer)
    timer = setTimeout(showInfo)
  }, [state])

  return state
}

export { mutate, remove }

export { useComputed, useBinding }

export const isReactive = isBistate

export interface Store<Data extends object> {
  Provider: React.FC<{
    initialData?: Data
  }>
  useData: () => Data
  useCreate: (data: Data) => Store<Data>
}

export interface CreateStoreOptions<Data> {
  Context?: React.Context<Data>
}

export const createStore = <Data extends object>(
  defaultData: Data,
  options?: CreateStoreOptions<Data>
): Store<Data> => {
  let Context = options ? options.Context : React.createContext<Data | null>(null)

  let Provider: FC<{ initialData?: Data }> = ({ initialData = defaultData, children }) => {
    let data = useReactive(initialData)

    return <Context.Provider value={data}>{children}</Context.Provider>
  }

  let useData = () => {
    let data = useContext(Context)
    if (data === null) {
      throw new Error('You may forgot add store to <Provider stores={[..., store]} />')
    }
    return data
  }

  let useCreate = (defaultData: Data) => {
    let store = useMemo(() => {
      let options: CreateStoreOptions<Data> = {
        Context
      }
      return createStore(defaultData, options)
    }, [])
    return store
  }

  return {
    Provider,
    useData,
    useCreate
  }
}

export const Provider: FC<{ stores: Store<any>[] }> = ({ stores = [], children }) => {
  for (let i = stores.length - 1; i >= 0; i--) {
    let store = stores[i]
    children = <store.Provider>{children}</store.Provider>
  }
  return <>{children}</>
}
