<script setup lang="ts">
import { onMounted } from 'vue'

import { type IStaticMethods } from 'flyonui/flyonui'
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods
  }
}

onMounted(() => {
  setTimeout(() => {
    window.HSStaticMethods.autoInit()
  }, 100)
})
</script>

<template>
  <router-view></router-view>
</template>
