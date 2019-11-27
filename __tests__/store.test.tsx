import 'jest'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { createStore, useAction, Provider } from '../src'

const delay = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout))

const createDeferred = () => {
  let resolve
  let reject
  let promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { resolve, reject, promise }
}

describe('useBistate', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    container = null
  })

  it('basic usage', () => {
    let store = createStore({ count: 0 })

    let Counter = () => {
      let data = store.useData()

      let incre = useAction(() => {
        data.count += 1
      })

      return <button onClick={incre}>{data.count}</button>
    }

    act(() => {
      ReactDOM.render(
        <Provider stores={[store]}>
          <Counter />
        </Provider>,
        container
      )
    })

    let button = container.querySelector('button')

    expect(button.textContent).toBe('0')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button.textContent).toBe('1')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button.textContent).toBe('2')
  })

  it('multiple stores', () => {
    let store1 = createStore({ count: 0 })
    let store2 = createStore({ count: 10 })

    let Counter = () => {
      let data1 = store1.useData()
      let data2 = store2.useData()

      let incre = useAction(() => {
        data1.count += 1
        data2.count += 2
      })

      return <button onClick={incre}>{data1.count + data2.count}</button>
    }

    act(() => {
      ReactDOM.render(
        <Provider stores={[store1, store2]}>
          <Counter />
        </Provider>,
        container
      )
    })

    let button = container.querySelector('button')

    expect(button.textContent).toBe('10')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button.textContent).toBe('13')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(button.textContent).toBe('16')
  })
})
