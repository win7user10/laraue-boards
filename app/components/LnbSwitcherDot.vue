<script setup lang="ts">
  defineProps<{
    color: string
  }>()
</script>

<template>
  <div class="space-switcher-dot" :style="`background:${color}`"></div>
</template>

<style scoped>
.space-switcher-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
</style>