# Promise Components

This is a Promise-based component encapsulation method. Designed to simplify the handling of asynchronous input and
output of components. Its design goal is to implement the software engineering concept
of `High-cohesion and Low-coupling`

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

## Example (React)

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
 * 🔴 The Props parameter must inherit from PromiseResolvers
 */
interface Props extends PromiseResolvers<UserItem> {
  user?: UserItem
}

/**
 * 🔴 Create a PromiseComponent instance
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

    // 🔴 Call resolve callback
    props.resolve(formData)
  }

  function handleCancel () {
    // 🔴 Call reject callback
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
     * 🔴 Using component
     */
    const newUser = await AddUser.render()

    setUserList((prevList) => [...prevList, newUser])
  }

  async function handleEdit (editIndex: number) {
    /**
     * 🔴 Using component and providing parameters (Edit mode)
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

Based on the above example, we can see some characteristics:

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