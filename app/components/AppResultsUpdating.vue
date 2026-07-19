<template>
  <span
    v-if="loading"
    class="results-updating"
    role="status">
    <Loader />
    Updating…
  </span>
</template>

<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

defineProps<{ loading: boolean }>()
</script>

<style scoped>
.results-updating {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  gap: var(--space-2);
}

.results-updating svg {
  animation: var(--animation-spin);
  height: 14px;
  width: 14px;
}
</style>
