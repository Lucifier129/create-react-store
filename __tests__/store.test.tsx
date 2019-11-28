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

  it('support custom hooks', () => {
    let countStore = createStore({ count: 0 })
    let stepStore = createStore({ step: 1 })

    let useCount = () => {
      let { count } = countStore.useData()
      return count
    }

    let useStep = () => {
      let { step } = stepStore.useData()
      return step
    }

    let useIncreCount = () => {
      let step = useStep()
      let data = countStore.useData()

      let increCount = useAction(() => {
        data.count += step
      })

      return increCount
    }

    let useIncreStep = () => {
      let data = stepStore.useData()
      let increStep = useAction(() => {
        data.step += 1
      })
      return increStep
    }

    let Counter = () => {
      let count = useCount()
      let step = useStep()
      let increStep = useIncreStep()
      let increCount = useIncreCount()

      return (
        <>
          <button id="count" onClick={increCount}>
            {count}
          </button>
          <button id="step" onClick={increStep}>
            {step}
          </button>
        </>
      )
    }

    act(() => {
      ReactDOM.render(
        <Provider stores={[countStore, stepStore]}>
          <Counter />
        </Provider>,
        container
      )
    })

    let countButton = container.querySelector('#count')
    let stepButton = container.querySelector('#step')

    expect(countButton.textContent).toBe('0')
    expect(stepButton.textContent).toBe('1')

    act(() => {
      countButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(countButton.textContent).toBe('1')
    expect(stepButton.textContent).toBe('1')

    act(() => {
      stepButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(countButton.textContent).toBe('1')
    expect(stepButton.textContent).toBe('2')

    act(() => {
      countButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(countButton.textContent).toBe('3')
    expect(stepButton.textContent).toBe('2')

    act(() => {
      stepButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(countButton.textContent).toBe('3')
    expect(stepButton.textContent).toBe('3')

    act(() => {
      countButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(countButton.textContent).toBe('6')
    expect(stepButton.textContent).toBe('3')
  })
})
