# Promise Components

This is a Promise-based component encapsulation method. Designed to simplify the handling of asynchronous input and
output of components. Its design goal is to implement the software engineering concept of `High-cohesion and Low-coupling`

English | [简体中文](/README-zh.md)

## Features

### 🔥 Promise-based invocation

Promise-based invocation allows us to flexibly control the asynchronous input and output flow of components. The
component will be invoked internally at the appropriate time
resolve or reject callback. This invocation follows a normalized pattern of asynchronous operation, making the use and
management of components more reliable and consistent.

### 📦 Independence of calls

Each call to the component spawns a new, independent instance. They don't share call state, and they don't have issues
like state caching. Whether the same component is called multiple times in a single page, or multiple instances of the
same component are used in different pages, they are guaranteed to be independent of each other.

### 🙋 Render on demand

Components are rendered only when they are needed. This rendering method can be triggered according to specific events
or external conditions, making the rendering logic more flexible and controllable. For example, we call a component when
a user clicks a button or when a condition is met. This on-demand rendering method can effectively improve page load
speed and performance, while also reducing unnecessary rendering and resource consumption.

### ♻️ Destroy after use

The result of a component's rendering is temporary and will be destroyed as soon as it is finished, similar to the
effect of burning. This feature is ideal for temporary and one-off scenarios, while also improving program performance.

## Integrations

+ [@promise-components/react](./packages/react)
+ [@promise-components/vue](./packages/vue)

## Interface (react)

```ts
import { FunctionComponent } from 'react';

/**
 * The basic props of the PromiseComponent
 * @property resolve Promise Operation Success Callback (Resolved)
 * @property reject Promise Operation Failure Callback (Rejected)
 */
interface PromiseComponentProps<Value> {
  resolve: (value: Value) => void;
  reject: (reason?: any) => void;
}

/**
 * Create a custom public slot component
 * If you have multiple root components on your page, and you want each application's Promise components to be rendered in its own context, then you need to use this method to create a separate shared render slot
 * @param appId
 */
declare function createSharedSlot (appId: string): FunctionComponent<{}>;

/**
 * Public slot of Promise components
 * It needs to be used on the root component in order to be able to inherit the context of the application and to provide a default render location for the Promise components
 */
declare const SharedSlot: FunctionComponent<{}>;

/**
 * Promise component constructor
 */
declare class PromiseComponent<Props extends PromiseComponentProps<any>> {

  /**
   * Custom slot for current component
   */
  Slot: FunctionComponent;

  /**
   * Original component
   */
  Component: FunctionComponent<Props>;

  constructor (Component: FunctionComponent<Props>);

  /**
   * Clone a new Promise component instance
   * When you want to use the same existing Promise component in different places, you need to clone a new instance to avoid state pollution
   */
  clone (): PromiseComponent<Props>;

  /**
   * promise rendering
   * @param props component parameters
   */
  render (props?: Omit<Props, keyof PromiseComponentProps<any>>): Promise<Parameters<Props["resolve"]>[0]>;
}

export {
  PromiseComponent,
  type PromiseComponentProps,
  SharedSlot,
  createSharedSlot
};
```

## Example

Let's make a list of users and include the ability to add and edit user information using dialog interactions.

### Initialization

You need to use the shared render slot of the Promise components in the root component

```tsx
// main.tsx

import ReactDOM from 'react-dom/client'
import { SharedSlot } from '@promise-components/react'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App/>

    {
      /** 🟥 Promise components shared render slot (Required) */
      <SharedSlot/>
    }
  </React.StrictMode>,
)
```

### Define the Promise component

```tsx
// add-user.tsx

import { FormEvent, useState } from 'react'
import { PromiseComponent, PromiseComponentsProps } from '@promise-components/react'

export interface UserItem {
  name: string
  age: number
}

/**
 * 🔴 1. The props parameter must inherit from the PromiseComponentsProps type
 */
interface Props extends PromiseComponentsProps<UserItem> {
  user?: UserItem // Passing in the user parameter is considered to be the edit mode
}

/**
 * 🔴 2. Create a PromiseComponent instance
 */
export const AddUser = new PromiseComponent((props: Props) => {
  const [formData, setFormData] = useState<UserItem>({
    name: '',
    age: 0,
    ...props.user, // If it's an edit, the default value is populated
  })

  function handleInput (key: keyof UserItem, evt: FormEvent) {
    setFormData({
      ...formData,
      [key]: (evt.target as HTMLInputElement).value,
    })
  }

  function handleSubmit () {
    if (!formData.name) return alert('Please enter `Name`')
    if (!formData.age) return alert('Please enter `Age`')

    // 🔴 3. Call resolve callback
    props.resolve(formData)
  }

  function handleCancel () {
    // 🔴 4. Call reject callback
    props.reject()
  }

  return (
    <dialog open>
      <form>
        <p>
          <span>Name: </span>
          <input value={formData.name} onInput={(evt) => handleInput('name', evt)} type="text"/>
        </p>

        <p>
          <span>Age: </span>
          <input value={formData.age} onInput={(evt) => handleInput('age', evt)} type="number" min={0}/>
        </p>
      </form>

      <p>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </p>
    </dialog>
  )
})
```

### Use the Promise component

```tsx
// user-list.tsx

import { useState } from 'react'
import { AddUser, UserItem } from './add-user.tsx'

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  /**
   * 🟢 Use the component
   */
  async function handleAdd () {
    const newUser = await AddUser.render()
    setUserList([...userList, newUser])
  }

  /**
   * 🟢 Use the component and pass in the parameters (edit mode)
   */
  async function handleEdit (editIndex: number) {
    const modifiedUser = await AddUser.render({
      user: userList[editIndex],
    })

    setUserList((prevList) => {
      return prevList.map((item, index) => {
        return index === editIndex ? modifiedUser : item
      })
    })
  }

  return (
    <>
      <ul>{
        userList.map((item, index) => (
          <li key={index.name}>
            <span>Name: {item.name}, Age: {item.age}</span>
            <button onClick={() => handleEdit(index)}>Edit</button>
          </li>
        ))
      }</ul>

      <button onClick={handleAdd}>Add</button>

      {
        /** 🟢 Use component's custom render slot (Optional) */
        <AddUser.Slot/>
      }
    </>
  )
}
```

Well, we've finished developing a user list feature. Based on the above examples, we can get some conclusions:

+ There is no `ON/OFF` variable for modal
+ There is no event listener for modal `Cancel/Confirm`
+ There are no variables to distinguish between `Add/Edit` modes
+ When using the `Add/Edit` function, the program logic is independent and does not interfere with each other
+ The logic of the program is simple, clear and straightforward, and it is very readable and maintainable

Of course, you may think that this example is too simple, but in fact, the principle is the same, no matter how complex
the function, as long as it meets the asynchronous input and output scenarios, this mode can provide you with a more
user-friendly development experience and better program performance. We don't have to care about component rendering
state, we focus on business logic, that's it
The meaning of the Promise component.