# @promise-components/vue

在 Vue 中使用 Promise 组件。

[English](./README.md) | 简体中文

## 安装

```shell
npm i @promise-components/vue
```

## 示例

让我们来实现一个用户列表，并包含使用对话框交互添加和编辑用户信息的功能。

### 初始化

您需要在根组件中使用 Promise 组件的共享渲染插槽，它将为整个应用的 Promise
组件提供一个默认的渲染位置，和应用上下文的继承（比如：store、theme、i18n...）。

```vue
<!-- App.vue -->

<script setup lang="ts">
  import { SharedSlot } from '@promise-components/vue'
</script>

<template>
  <div>
    ...

    <SharedSlot/>
  </div>
</template>
```

### 定义 Promise 组件

```vue
<!-- add-user.vue -->

<script setup lang="ts">
  import { PromiseComponentProps } from '@promise-components/vue'
  import { reactive } from 'vue'

  interface UserItem {
    name: string
    age: number
    id: number
  }

  /**
   * 🔴 Props 参数必须继承自 PromiseComponentsProps
   */
  interface Props extends PromiseComponentProps<UserItem> {
    user?: UserItem
  }

  const props = defineProps<Props>()

  const formData = reactive<UserItem>({
    name: '',
    age: 0,
    id: Math.rancom(),
    ...props.user, // 如果是编辑，则填充默认值
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
</script>

<template>
  <dialog open>
    <form>
      <p>
        <span>Name: </span>
        <input v-model="formData.name" type="text"/>
      </p>

      <p>
        <span>Age: </span>
        <input v-model="formData.age" type="number" min={0}/>
      </p>
    </form>

    <p>
      <button @click="handleCancel">Cancel</button>
      <button @click="handleSubmit">Submit</button>
    </p>
  </dialog>
</template>
```

由于在 `.vue` 文件中不能直接导出一个 Promise 组件实例，所以需要增加一个单独的 ts
文件来创建实例。

```ts
// add-user.promise.ts

import { PromiseComponent } from '@promise-components/vue'
import Component from './add-user.vue'

export const AddUser = new PromiseComponent(Component)
```

文件名建议：

+ 主要的：`index.ts`
+ 具名的：`[name].promise.ts`

### 使用 Promise 组件

```vue
<!-- user-list.vue -->

<script setup lang="ts">
  import { ref } from 'vue'
  import { AddUser } from './add-user.promise.ts'

  interface UserItem {
    name: string
    age: number
    id: number
  }

  const userList = ref<UserItem[]>([])

  async function handleAdd () {
    /**
     * 🔴 使用组件
     */
    const newUser = await AddUser.render()

    userList.value.push(newUser)
  }

  async function handleEdit (editIndex: number) {
    const target = userList.value[editIndex]

    /**
     * 🔴 使用组件并传入参数（编辑模式）
     */
    const modifiedUser = await AddUser.render({
      user: target,
    })

    Object.assign(target, modifiedUser)
  }
</script>

<template>
  <div>
    <ul>
      <li v-for="(item, index) in userList" :key="item.id">
        <span>Name: {{item.name}}, Age: {{item.age}}</span>
        <button @click="handleEdit(index)">Edit</button>
      </li>
    </ul>

    <button @click="handleAdd">Add</button>
  </div>
</template>
```

好了，我们已经基于 Promise 组件愉快的完成了用户列表功能的开发。

## 自定义渲染插槽

### 共享插槽

当你的页面同时存在多个根组件（比如微服务），并且希望每个应用下的 Promise 组件渲染在自己的上下文中，那么你就需要创建一个独立的共享渲染插槽。

```vue
<!-- project-1/App.vue -->

<script setup lang="ts">
  import { createSharedSlot } from '@promise-components/vue'

  const SharedSlot = createSharedSlot('MyApp_1')
</script>

<template>
  <div>
    ...

    <SharedSlot/>
  </div>
</template>
```

```vue
<!-- project-2/App.vue -->

<script setup lang="ts">
  import { createSharedSlot } from '@promise-components/vue'

  const SharedSlot = createSharedSlot('MyApp_2')
</script>

<template>
  <div>
    ...

    <SharedSlot/>
  </div>
</template>
```

### 组件插槽

如果希望将某个 Promise 组件渲染在特定的位置，这时候可以使用 Promise 组件的自定义插槽

```vue
<!-- user-list.vue -->

<script setup lang="ts">
  import { AddUser } from './add-user.promise.ts'
</script>

<template>
  <div>
    ...

    <AddUser.Slot/>
  </div>
</template>
```

## Interface

```ts
import { Component, ComponentOptions } from 'vue'

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
declare function createSharedSlot (appId: string): ComponentOptions;

/**
 * Promise 组件的共享渲染插槽
 * 它需要在根组件上使用，是为了能够继承应用的上下文，并且给 Promise 组件提供一个默认渲染位置
 */
declare const SharedSlot: ComponentOptions

/**
 * Promise 组件实例构造器
 */
declare class PromiseComponent<Props extends PromiseComponentProps<any>> {

  /**
   * 当前组件的自定义插槽
   */
  Slot: ComponentOptions

  /**
   * 原始组件
   */
  Component: Component<Props>

  constructor (Component: Component<Props>);

  /**
   * 克隆一个新的 Promise 组件实例
   * 当您想在不同的地方使用相同的现有 Promise 组件时，您需要克隆一个新实例以避免状态污染
   */
  clone (): PromiseComponent<Props>;

  /**
   * Promise 渲染
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