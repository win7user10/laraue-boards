<script setup lang="ts">
defineProps<{
  title: string;
}>()
</script>

<template>
  <div class="section-label">
    {{ title }}
  </div>
  <slot></slot>
</template>

<style scoped>
.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text3);
  text-transform: uppercase;
  padding: 6px 2px 4px;
}
</style>