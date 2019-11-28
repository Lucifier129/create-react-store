# create-react-store

Create a reactive store for React App

Make developing React App easier and happier!

Demo: [create-react-store-todo-app](https://github.com/Lucifier129/create-react-store-todo-app)

## Installation

```shell
npm install --save create-react-store
```

## Usage

```javascript
import {
  isReactive,
  useAction,
  createStore,
  useReactive,
  useComputed,
  useBinding,
  CreateStoreOptions,
  Store,
  mutate,
  remove,
  Provider,
  enableTracing,
  disableTracing
} from 'create-react-store'
```

create-react-store uses `bistate`, See [bistate docs](https://github.com/Lucifier129/bistate#caveats) for more information

```javascript
import { createStore, useAction } from 'create-react-store'

// pass initialData
const store = createStore([])

const App: React.FC = () => {
  // read data from store.useData()
  let todos = store.useData()

  let handleAddTodo = useAction(text => {
    // mutate data inside action
    todos.push({
      id: Math.random(),
      text
    })
  })

  return (
    <>
      <TodoHeader onAdd={handleAddTodo} />
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  )
}

ReactDOM.render(
  <Provider stores={[store]}>
    <App />
  </Provider>,
  container
)
```

## API

### createStore(initialData) -> { useData, useCreate, Provider }

createStore receives object as initialState, return { useData, useCreate, Provider }

- useData() -> data
  - a react-hooks use in function-component to read store data
- useCreate(data) -> store
  - a react-hooks use in function-component to re-create a store with data
- <Provider initialData={initialData}>{children}</Provider>
  - Provider is a React Component to provide data for sub-components

### Provider({ stores: Store[] })

a React Component recieves stores to provide data for sub-components.

### useAction(f) -> f

useAction is a react-hooks use in function-component, it will return a wrapped function has the same type sinature

It's safely to mutate objects in useAction(f), `bistate` will take care the immutable and re-render component

### useReactive(object) -> object

useReactive is a react-hooks use in function-component, it will return a reactive one has the same structure/data

The data returned by useReactive, can be mutated via useAction

### isReactive(object) -> boolean

check whether object is reactive or not

### enableTracing()

enable tracing actions and show logs in console

### disableTracing()

disable tracing actions

### [useComputed](https://github.com/Lucifier129/bistate#usecomputedobj-deps---obj)

### [useBinding](https://github.com/Lucifier129/bistate#usebindingbistate---obj)

### [remove](https://github.com/Lucifier129/bistate#removebistate---void)

### [mutate](https://github.com/Lucifier129/bistate#mutatef---value_returned_by_f)

## PR is Welcome:)
