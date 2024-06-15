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
        <span>Name: {{ item.name }}, Age: {{ item.age }}</span>
        <button @click="handleEdit(index)">Edit</button>
      </li>
    </ul>

    <button @click="handleAdd">Add</button>
  </div>
</template>