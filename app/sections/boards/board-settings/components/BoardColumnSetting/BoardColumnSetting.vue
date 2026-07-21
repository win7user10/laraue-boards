<template>
  <div
    ref="element"
    class="setting-row"
    :class="{ 'setting-row--dragging': isDragging }">
    <button
      v-if="canUpdate"
      ref="handle"
      aria-label="Reorder column"
      class="icon-btn drag-handle"
      :disabled="disabled"
      type="button">
      <GripVertical />
    </button>
    <span
      v-else
      aria-hidden="true" />
    <AppColorPicker
      :disabled="!canUpdate"
      :model-value="color"
      @update:model-value="props.onUpdateColor" />
    <input
      :disabled="!canUpdate"
      required
      :value="name"
      @input="props.onUpdateName(($event.target as HTMLInputElement).value)" />
    <button
      v-if="canUpdate"
      aria-label="Delete column"
      class="icon-btn danger"
      :disabled="disabled"
      type="button"
      @click="props.onDelete">
      <Trash2 />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { GripVertical, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  canUpdate: boolean
  color: string
  disabled: boolean
  id: string
  index: number
  name: string
  onDelete: () => void
  onUpdateColor: (color: string) => void
  onUpdateName: (name: string) => void
}>()
const element = ref<HTMLElement>()
const handle = ref<HTMLElement>()
const { isDragging } = useSortable({
  disabled: computed(() => !props.canUpdate || props.disabled),
  element,
  handle,
  id: computed(() => props.id),
  index: computed(() => props.index),
})
</script>

<style scoped>
.setting-row {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(min-content, 0.2fr) minmax(0, 1fr) auto;
}

.setting-row--dragging {
  opacity: 0.45;
}

.setting-row :deep(.color-picker) {
  width: 100%;
}

.drag-handle {
  color: var(--color-muted);
  cursor: grab;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
