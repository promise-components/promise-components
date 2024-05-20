# Promise Components

这是一种基于 Promise 的组件封装方法。旨在简化组件异步输入和输出的处理。其设计目标是实践 `高内聚、低耦合` 的软件工程理念

[English](./README.md) | 简体中文

## 特性

### 🔥 基于 promise 的调用

基于 Promise 的调用可以让我们灵活地控制组件的异步输入输出流。组件将在适当的时间在内部调用成功或失败回调。此调用遵循异步操作的规范化模式，使组件的使用和管理更加可靠和一致。

### 📦 独立性

对组件的每次调用都会生成一个新的独立实例。它们不共享调用状态，并且不存在状态缓存等问题。无论是在单个页面中多次调用同一个组件，还是在不同页面中使用同一个组件的多个实例，都保证它们是相互独立的。

### 🙋 按需渲染

组件仅在需要时才呈现。这种渲染方法可以根据特定事件或外部条件触发，使得渲染逻辑更加灵活可控。例如，当用户单击按钮或满足条件时，我们调用组件。这种按需渲染的方式可以有效提升页面加载速度和性能，同时也减少不必要的渲染和资源消耗。

### ♻️ 阅后即焚

组件的渲染结果是暂时的，一旦完成就会被销毁。此特性非常适合临时和一次性场景，同时还可以提高程序性能。

## 框架集成

+ [@promise-components/react](./packages/react)
+ [@promise-components/vue](./packages/vue)

## Interface (react)

```ts
import { FunctionComponent } from 'react'

/**
 * Promise 组件的基本参数
 * @property resolve Promise 的成功回调 (Resolved)
 * @property reject Promise 的失败回调 (Rejected)
 */
interface PromiseComponentProps<Value> {
  resolve: (value: Value) => void;
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
declare class PromiseComponent<Props extends PromiseComponentProps<any>> {

  /**
   * 当前组件的自定义插槽
   */
  Slot: FunctionComponent

  /**
   * 原始组件
   */
  Component: FunctionComponent<Props>

  constructor (Component: FunctionComponent<Props>);

  /**
   * 克隆一个新的 Promise 组件实例
   * 当您想在不同的地方使用相同的现有 Promise 组件时，您需要克隆一个新实例以避免状态污染
   */
  clone (): PromiseComponent<Props>;

  /**
   * 渲染
   * @param props 组件参数
   */
  render (props?: Omit<Props, keyof PromiseComponentProps<any>>): Promise<Parameters<Props['resolve']>[0]>;
}

export {
  PromiseComponent,
  type PromiseComponentProps,
  SharedSlot,
  createSharedSlot
}
```

## 示例

我们来实现一个用户列表，并包含使用对话框交互添加和编辑用户信息的功能。

### 初始化

您需要在根组件中使用 Promise 组件的共享渲染插槽

```tsx
// main.tsx

import ReactDOM from 'react-dom/client'
import { SharedSlot } from '@promise-components/react'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App/>

    {
      /** 🟥 Promise 组件共享渲染插槽（必需）*/
      <SharedSlot/>
    }
  </React.StrictMode>,
)
```

### 定义 Promise 组件

```tsx
// add-user.tsx

import { FormEvent, useState } from 'react'
import { PromiseComponent, PromiseComponentsProps } from '@promise-components/react'

export interface UserItem {
  name: string
  age: number
}

/**
 * 🔴 1. props 参数必须继承自 PromiseComponentsProps
 */
interface Props extends PromiseComponentsProps<UserItem> {
  user?: UserItem // Passing in the user parameter is considered to be the edit mode
}

/**
 * 🔴 2. 创建 PromiseComponent 实例
 */
export const AddUser = new PromiseComponent((props: Props) => {
  const [formData, setFormData] = useState<UserItem>({
    name: '',
    age: 0,
    ...props.user, // 如果是编辑，则填充默认值
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

    // 🔴 3. 调用成功回调
    props.resolve(formData)
  }

  function handleCancel () {
    // 🔴 4. 调用失败回调
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

### 使用 Promise 组件

```tsx
// user-list.tsx

import { useState } from 'react'
import { AddUser, UserItem } from './add-user.tsx'

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  /**
   * 🟢 使用组件
   */
  async function handleAdd () {
    const newUser = await AddUser.render()
    setUserList([...userList, newUser])
  }

  /**
   * 🟢 使用组件并传入参数（编辑模式）
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
        /** 🟢 使用组件的自定义渲染插槽（可选） */
        <AddUser.Slot/>
      }
    </>
  )
}
```

好了，我们已经完成了用户列表功能的开发。基于上面的例子，我们可以得出一些结论：

+ 对话框没有 `开/关` 变量
+ 对话框没有 `取消/确认` 的事件监听器
+ 没有用变量区分 `添加/编辑` 模式
+ 使用 `添加/编辑` 功能时，程序逻辑是独立的，不会相互干扰
+ 程序逻辑简单明了，可读性强，可维护性强

当然，你可能会觉得这个例子太简单了，但其实原理是一样的，无论功能多么复杂，只要满足异步输入输出场景，这种模式可以为你提供更人性化的开发体验和更好的程序性能。我们不必在乎组件渲染状态，我们关注的是业务逻辑，这就是
Promise 组件的意义。