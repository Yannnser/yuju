<script setup lang="ts">
import { ref } from 'vue'
const iconClass = ref('abc')
</script>
<template>
  <input v-model="iconClass" type="text" class="input max-w-sm" aria-label="输入框" />
</template>
