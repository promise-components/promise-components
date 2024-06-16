# @promise-components/vue

This is the package to use PromiseComponent with Vue.

English | [简体中文](./README-zh.md)

## Installation

```shell
npm i @promise-components/vue
```

## Example

Let's implement a user list and include the ability to interactively add and edit user information using a dialog box.

### Initialization

You need to use the shared rendering slot of the Promise component in the root component, which will provide a default
rendering location for the Promise components of the entire application and inheritance of the application context (such
as: store, theme, i18n...).

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

### Defining a Promise Component

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
   * 🔴 The Props parameter must inherit from PromiseComponentsProps
   */
  interface Props extends PromiseComponentProps<UserItem> {
    user?: UserItem
  }

  const props = defineProps<Props>()

  const formData = reactive<UserItem>({
    name: '',
    age: 0,
    id: Math.random(),
    ...props.user, // If editing, fill in the default value
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

Since the Promise component instance cannot be exported directly in the `.vue` file, an additional `.ts` file is
required to create the instance.

```ts
// add-user.promise.ts

import { PromiseComponent } from '@promise-components/vue'
import Component from './add-user.vue'

export const AddUser = new PromiseComponent(Component)
```

File name suggestions:

+ Main: `index.ts`
+ Named: `[name].promise.ts`

### Using the Promise component

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
     * 🔴 Using component
     */
    const newUser = await AddUser.render()

    userList.value.push(newUser)
  }

  async function handleEdit (editIndex: number) {
    const target = userList.value[editIndex]

    /**
     * 🔴 Using component and providing parameters (Edit mode)
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

Well, we have happily completed the development of the user list function based on the Promise component.

## Custom Render Slots

### Shared slot

When your page has multiple root components at the same time (Like microservices), and you want the Promise component under each application
to be rendered in its own context, you need to create a separate shared rendering slot.

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

### Component slot

If you want to render a Promise component in a specific location, you can use the custom slot of the Promise component.

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
import { ComponentOptions, Component } from 'vue'

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
declare function createSharedSlot (appId: string): ComponentOptions;

/**
 * Public slot of Promise components
 */
declare const SharedSlot: ComponentOptions

/**
 * Promise component constructor
 */
declare class PromiseComponent<Props extends PromiseComponentProps<any>> {

  /**
   * Custom slots for Promise component
   */
  Slot: ComponentOptions

  /**
   * Original component
   */
  Component: Component<Props>

  constructor (Component: Component<Props>);

  /**
   * Clone a new Promise component instance
   * When you want to use the same existing Promise component in different places, you need to clone a new instance to avoid state pollution
   */
  clone (): PromiseComponent<Props>;

  /**
   * promise rendering
   * @param props component parameters
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