# @promise-components/react

This is the package to use PromiseComponent with React.

English | [简体中文](./README-zh.md)

## Installation

```shell
npm i @promise-components/react
```

## Example

Let's implement a user list and include the ability to interactively add and edit user information using a dialog box.

### Initialization

You need to use the shared rendering slot of the Promise component in the root component, which will provide a default
rendering location for the Promise components of the entire application and inheritance of the application context (such
as: store, theme, i18n...).

```tsx
// App.tsx

import { SharedSlot } from '@promise-components/react'

function App () {
  return (
    <div>
      ...

      <SharedSlot/>
    </div>
  )
}

export default App
```

### Defining a Promise Component

```tsx
// add-user.tsx

import { PromiseComponent, PromiseResolvers } from '@promise-components/react'
import { FormEvent, useState } from 'react'

interface UserItem {
  name: string
  age: number
  id: number
}

/**
 * 📌 The Props parameter must inherit from PromiseResolvers
 */
interface Props extends PromiseResolvers<UserItem> {
  user?: UserItem
}

/**
 * 📌 Create a PromiseComponent instance
 */
export const AddUser = new PromiseComponent((props: Props) => {
  const [formData, setFormData] = useState(() => {
    return {
      name: '',
      age: 0,
      id: Math.random(),
      ...props.user, // If editing, fill in the default value
    }
  })

  function handleSubmit () {
    if (!formData.name) return alert('Please enter `Name`')
    if (!formData.age) return alert('Please enter `Age`')

    // 📌 Call resolve callback
    props.resolve(formData)
  }

  function handleCancel () {
    // 📌 Call reject callback
    props.reject()
  }

  function handleInput (key: keyof UserItem) {
    return (evt: FormEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [key]: evt.currentTarget.value
      })
    }
  }

  return (
    <dialog open>
      <form>
        <p>
          <span>Name: </span>
          <input value={formData.name} onInput={handleInput('name')} type="text"/>
        </p>

        <p>
          <span>Age: </span>
          <input value={formData.age} onInput={handleInput('age')} type="number" min={0}/>
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

### Using the Promise component

```tsx
// user-list.tsx

import { useState } from 'react'
import { AddUser } from './add-user.tsx'

interface UserItem {
  name: string
  age: number
  id: number
}

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  async function handleAdd () {
    /**
     * 📌 Using component
     */
    const newUser = await AddUser.render()

    setUserList((prevList) => [...prevList, newUser])
  }

  async function handleEdit (editIndex: number) {
    /**
     * 📌 Using component and providing parameters (Edit mode)
     */
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
    <div>
      <ul>{
        userList.map((item, index) => (
          <li key={item.id}>
            <span>Name: {item.name}, Age: {item.age}</span>
            <button onClick={() => handleEdit(index)}>Edit</button>
          </li>
        ))
      }</ul>

      <button onClick={handleAdd}>Add</button>
    </div>
  )
}
```

Well, we have happily completed the development of the user list function based on the Promise component.

## Custom Render Slots

### Component slot

If you want to render a Promise component in a specific location, you can use the custom slot of the Promise component.

```tsx
// user-list.tsx

import { AddUser } from './add-user.tsx'

export function UserList () {
  return (
    <div>
      ...

      <AddUser.Slot/>
    </div>
  )
}
```

## Interface

```ts
import { FunctionComponent } from 'react'

/**
 * The basic props of the PromiseComponent
 * @property resolve Promise Operation Success Callback (Resolved)
 * @property reject Promise Operation Failure Callback (Rejected)
 */
interface PromiseResolvers<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

/**
 * Public slot of Promise components
 */
declare const SharedSlot: FunctionComponent<{}>

/**
 * Promise component constructor
 */
declare class PromiseComponent<T extends PromiseResolvers<any>, P = Omit<T, keyof PromiseResolvers<any>>, R = Parameters<T['resolve']>[0]> {

  constructor (public Component: FunctionComponent<T>);

  /**
   * promise rendering
   * @param props component props
   */
  render (props?: P): Promise<R>;

  /**
   * Custom slot for Promise component
   */
  Slot: FunctionComponent
}

export {
  PromiseComponent,
  type PromiseResolvers,
  SharedSlot,
}

```