# Promise Components

This is a Promise-based encapsulation of components designed to simplify the handling of asynchronous input and output
of components.

## Features

#### Promise-based invocation

Promise-based invocation allows us to flexibly control the asynchronous input and output flow of components. The
component will be invoked internally at the appropriate time
resolve or reject callback. This invocation follows a normalized pattern of asynchronous operation, making the use and
management of components more reliable and consistent.

#### Independence of calls

Each call to the component spawns a new, independent instance. They don't share call state, and they don't have issues
like state caching. Whether the same component is called multiple times in a single page, or multiple instances of the
same component are used in different pages, they are guaranteed to be independent of each other.

#### Render on demand

Components are rendered only when they are needed. This rendering method can be triggered according to specific events
or external conditions, making the rendering logic more flexible and controllable. For example, we call a component when
a user clicks a button or when a condition is met. This on-demand rendering method can effectively improve page load
speed and performance, while also reducing unnecessary rendering and resource consumption.

#### Destroy after reading

The result of a component's rendering is temporary and will be destroyed as soon as it is finished, similar to the
effect of burning. This feature is ideal for temporary and one-off scenarios, while also improving program performance.

## Interface

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
 * @param appId
 */
declare function createSharedSlot (appId: string): FunctionComponent<{}>;

/**
 * Public slot of Promise components
 */
declare const SharedSlot: FunctionComponent<{}>;

/**
 * Promise component constructor
 */
declare class PromiseComponent<Props extends PromiseComponentProps<any>> {

  /**
   * Dispatching of custom slots
   * @private
   */
  private _dispatch;

  /**
   * Custom slots for Promise component
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

Let's make a list of users and include the ability to add and edit user information using modal interactions.

```tsx
// add-user.tsx

import { FormEvent, useState } from 'react'
import { PromiseComponentsProps } from '@promise-components/react'

export interface UserItem {
  name: string
  age: number
}

/**
 * The props parameter must inherit from the PromiseComponentsProps type
 */
interface Props extends PromiseComponentsProps<UserItem> {
  user?: UserItem // Passing in the user parameter is considered to be the edit mode
}

export function AddUser (props: Props) {
  const [formData, setFormData] = useState<UserItem>({
    name: '',
    age: 0,
    ...props.user, // If it's an edit, the default value is populated
  })

  const handleInput = (key: keyof UserItem, evt: FormEvent) => {
    setFormData({
      ...formData,
      [key]: (evt.target as HTMLInputElement).value,
    })
  }

  const handleCancel = () => {
    props.reject()
  }

  const handleSubmit = () => {
    if (!formData.name) return alert('please enter Name')
    if (!formData.age) return alert('Please enter Age')

    props.resolve(formData)
  }

  return (
    <dialog open>
      <form>
        <div>
          <span>Name: </span>
          <input value={formData.name} onInput={(evt) => handleInput('name', evt)} type="text"/>
        </div>

        <div>
          <span>Age: </span>
          <input value={formData.age} onInput={(evt) => handleInput('age', evt)} type="number" min={0}/>
        </div>
      </form>

      <div style={{ textAlign: 'right' }}>
        <br/>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </dialog>
  )
}
```

```tsx
// user-list.tsx

import { useState } from 'react'
import { PromiseComponent } from '@promise-components/react'
import { AddUser, UserItem } from './add-user.tsx'

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  /**
   * 1. Create a reference instance
   * It is recommended that the variable name of this reference instance is: component name + ref
   */
  const AddUserRef = new PromiseComponent(AddUser)

  const handleAdd = async () => {
    /**
     * 3.1. Call the component
     */
    const newUser = await AddUserRef.render()

    setUserList([...userList, newUser])
  }

  const handleEdit = async (item: UserItem, editIndex: number) => {
    /**
     * 3.2. Call the component and pass in the parameters (edit mode)
     */
    const newUser = await AddUserRef.render({
      user: item,
    })

    setUserList((prevUserList) => {
      return prevUserList.map((userItem, index) => {
        return index === editIndex ? newUser : userItem
      })
    })
  }

  return (
    <>
      <h1>User List</h1>

      <ul>{
        userList.map((item, index) => (
          <li key={index}>
            <div>
              <button onClick={() => handleEdit(item, index)}>Edit</button>
              <span>Name: {item.name}, Age: {item.age}</span>
            </div>
          </li>
        ))
      }</ul>

      <button onClick={handleAdd}>Add</button>

      {
        /** 2. Custom Component render slot (Optional) */
        <AddUserRef.Slot/>
      }
    </>
  )
}
```

```tsx
// App.tsx

import { SharedSlot } from '@promise-components/react'
import { UserList } from './user-list.tsx'

export function App () {
  return (
    <>
      <UserList />
      
      {/** 共享插槽 */}
      <SharedSlot />
    </>
  )
}
```

Well, we've finished developing a user list feature. Based on the above examples, we can get some conclusions:

+ There is no `on/off` variable for modal
+ There is no event listener for modal `cancel/confirm`
+ There are no variables to distinguish between `Add/Edit` modes
+ When using the `Add/Edit` function, the program logic is independent and does not interfere with each other
+ The logic of the program is simple, clear and straightforward, and it is very readable and maintainable

Of course, you may think that this example is too simple, but in fact, the principle is the same, no matter how complex
the function, as long as it meets the asynchronous input and output scenarios, this mode can provide you with a more
user-friendly development experience and better program performance. We don't have to care about component rendering
state, we focus on business logic, that's it
The meaning of the Promise component.