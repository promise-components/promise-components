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
import { useState } from 'react'

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
    return (evt: InputEvent) => {
      setFromData({
        ...formData,
        [key]: evt.target.value
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

基于上面的例子，我们可以看到一些特点：

+ 对话框没有 `开/关` 变量
+ 对话框没有 `取消/确认` 的事件监听器
+ 没有用变量区分 `添加/编辑` 模式
+ 使用 `添加/编辑` 功能时，程序逻辑是独立的，不会相互干扰
+ 程序逻辑简单明了，可读性强，可维护性强

当然，你可能会觉得这个例子太简单了，但其实原理是一样的，无论功能多么复杂，只要满足异步输入输出场景，这种模式可以为你提供更人性化的开发体验和更好的程序性能。我们不必在乎组件渲染状态，我们关注的是业务逻辑，这就是
Promise 组件的意义。