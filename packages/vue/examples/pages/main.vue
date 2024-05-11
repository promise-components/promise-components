<script setup lang="ts">
import DialogComponent from '../components/dialog-component.vue'
import { PromiseComponent } from '@promise-components/vue/src'

const dialog = new PromiseComponent(DialogComponent)

function handleOpen () {
  dialog.render().then(alert)
}
</script>

<template>
  <div>
    <button class="btn btn-success" @click="handleOpen">Open dialog</button>

    <dialog.Slot></dialog.Slot>
  </div>
</template>
