<script setup lang="ts">
import { PromiseResolvers } from '@promise-components/vue'
import { reactive } from 'vue'

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
    <h2>Vue dialog</h2>

    <form>
      <p>
        <span>Name: </span>
        <input v-model="formData.name" type="text"/>
      </p>

      <p>
        <span>Age: </span>
        <input v-model="formData.age" type="number"/>
      </p>
    </form>

    <p>
      <button @click="handleCancel">Cancel</button>
      <button @click="handleSubmit">Submit</button>
    </p>
  </dialog>
</template>