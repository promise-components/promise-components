# @promise-components/react

在 React 中使用 Promise 组件。

[English](./README.md) | 简体中文

## 安装

```shell
npm i @promise-components/react
```

## 示例

让我们来实现一个用户列表，并包含使用对话框交互添加和编辑用户信息的功能。

### 初始化

您需要在根组件中使用 Promise 组件的共享渲染插槽，它将为整个应用的 Promise
组件提供一个默认的渲染位置，和应用上下文的继承（比如：store、theme、i18n...）。

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

### 定义 Promise 组件

```tsx
// add-user.tsx

import { PromiseComponent, PromiseResolvers } from '@promise-components/react'
import { FormEvent, useState } from 'react'

export interface UserItem {
  name: string
  age: number
  id: number
}

/**
 * 🔴 Props 参数必须继承自 PromiseResolvers
 */
interface Props extends PromiseResolvers<UserItem> {
  user?: UserItem
}

/**
 * 🔴 创建 Promise 组件
 */
export const AddUser = new PromiseComponent((props: Props) => {
  const [formData, setFormData] = useState(() => {
    return {
      name: '',
      age: 0,
      id: Math.random(),
      ...props.user, // 如果是编辑，则填充默认值
    }
  })

  function handleSubmit () {
    if (!formData.name) return alert('Please enter `Name`')
    if (!formData.age) return alert('Please enter `Age`')

    // 🔴 调用成功回调
    props.resolve(formData)
  }

  function handleCancel () {
    // 🔴 调用失败回调
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

### 使用 Promise 组件

```tsx
// user-list.tsx

import { useState } from 'react'
import { AddUser, UserItem } from './add-user.tsx'

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  async function handleAdd () {
    /**
     * 🔴 使用组件
     */
    const newUser = await AddUser.render()

    setUserList((prevList) => [...prevList, newUser])
  }

  async function handleEdit (editIndex: number) {
    /**
     * 🔴 使用组件并传入参数（编辑模式）
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

好了，我们已经基于 Promise 组件愉快的完成了用户列表功能的开发。

## 自定义渲染插槽

### 共享插槽

当你的页面同时存在多个根组件（比如微服务），并且希望每个应用下的 Promise 组件渲染在自己的上下文中，那么你就需要创建一个独立的共享渲染插槽。

```tsx
// project-1/App.tsx

import { createSharedSlot } from '@promise-components/react'

const SharedSlot = createSharedSlot('MyApp_1')

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

```tsx
// project-2/App.tsx

import { createSharedSlot } from '@promise-components/react'

const SharedSlot = createSharedSlot('MyApp_2')

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

### 组件插槽

如果希望将某个 Promise 组件渲染在特定的位置，这时候可以使用 Promise 组件的自定义插槽

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
 * Promise 组件的基本参数
 * @property resolve Promise 的成功回调 (Resolved)
 * @property reject Promise 的失败回调 (Rejected)
 */
interface PromiseResolvers<T> {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

/**
 * 创建自定义共享插槽的方法
 * 当你的页面同时存在多个根组件，并且希望每个应用下的 Promise 组件渲染在自己的上下文中，那么你就需要使用这个方法创建一个独立的共享渲染插槽
 * @param appId
 */
declare function createSharedSlot (appId: string): FunctionComponent<{}>;

/**
 * Promise 组件的共享渲染插槽
 * 它需要在根组件上使用，是为了能够继承应用的上下文，并且给 Promise 组件提供一个默认渲染位置
 */
declare const SharedSlot: FunctionComponent<{}>

/**
 * Promise 组件实例构造器
 */
declare class PromiseComponent<T extends PromiseResolvers<any>, P = Omit<T, keyof PromiseResolvers<any>>, R = Parameters<T['resolve']>[0]> {

  constructor (public Component: FunctionComponent<T>);

  /**
   * Promise 渲染
   * @param props 组件参数
   */
  render (props?: P): Promise<R>;

  /**
   * 当前组件的自定义插槽
   */
  Slot: FunctionComponent
}

export {
  PromiseComponent,
  type PromiseResolvers,
  SharedSlot,
  createSharedSlot
}

```