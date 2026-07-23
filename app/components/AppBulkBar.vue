<template>
  <Transition name="slide-fade">
    <div
      v-if="count"
      class="bulk-bar">
      <span>{{ count }} selected</span>
      <div class="bulk-actions">
        <button
          class="secondary"
          type="button"
          @click="emit('clear')">
          Clear
        </button>
        <button
          class="primary"
          type="button"
          @click="emit('action')">
          <ArrowRightLeft />
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

defineProps<{ actionLabel: string; count: number }>()
const emit = defineEmits<{
  action: []
  clear: []
}>()
</script>

<style scoped>
.bulk-bar {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-4);
}

.bulk-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
