<template>
  <div class="issue-dialog-error">
    <AlertTriangle />
    <p>{{ errorText }}</p>
    <div class="dialog-actions">
      <button
        class="secondary"
        type="button"
        @click="$emit('close')">
        Cancel
      </button>
      <button
        class="primary"
        type="button"
        @click="$emit('retry')">
        Try again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{ errorText: string }>()
defineEmits<{ close: []; retry: [] }>()
</script>

<style scoped>
.issue-dialog-error {
  align-content: center;
  display: grid;
  height: 100%;
  justify-items: center;
  min-height: 240px;
  text-align: center;
}

.issue-dialog-error > svg {
  color: var(--color-danger);
  height: 32px;
  margin-bottom: var(--space-3);
  width: 32px;
}
</style>
