<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { PromiseComponentProps } from '@promise-components/vue/src'

interface Props extends PromiseComponentProps<number> {
  title: string
}

const props = defineProps<Props>()

const count = ref(0)

console.log('【vue】渲染')

onMounted(() => {
  console.log('【vue】onMounted')
})

onBeforeUnmount(() => {
  console.log('【vue】onBeforeUnmount')
})
</script>

<template>
  <dialog open>
    <b>Vue Dialog {{ props.title }}</b>
    <hr>

    <div>
      Count: {{ count }}
    </div>

    <div>
      <button @click="count ++">increase</button>
      <button @click="count --">decrease</button>
    </div>

    <hr>
    <div>
      <button @click="props.resolve(count)">RESOLVE</button>
      <button @click="props.reject()">REJECT</button>
    </div>
  </dialog>
</template>
