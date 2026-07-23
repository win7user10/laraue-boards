<template>
  <AppPopover class="color-picker">
    <template #trigger="{ open, toggle }">
      <button
        :aria-expanded="open"
        aria-haspopup="listbox"
        class="color-trigger"
        :disabled="disabled"
        type="button"
        @click="toggle">
        <span :style="{ background: model }" />
        {{ colorName }}
      </button>
    </template>
    <template #default="{ close }">
      <div
        class="color-grid"
        role="listbox">
        <button
          v-for="color in COLOR_PALETTE"
          :key="color.value"
          :aria-label="color.name"
          :aria-selected="color.value === model"
          class="color-swatch"
          :class="{ selected: color.value === model }"
          role="option"
          :style="{ background: color.value }"
          type="button"
          @click="select(color.value, close)" />
      </div>
    </template>
  </AppPopover>
</template>

<script setup lang="ts">
import { COLOR_PALETTE } from '~/constants/colors'

defineProps<{ disabled?: boolean }>()
const model = defineModel<string>({ required: true })
const colorName = computed(
  () => COLOR_PALETTE.find((color) => color.value === model.value)?.name ?? model.value,
)
const select = (value: string, close: () => void) => {
  model.value = value
  close()
}
</script>

<style scoped>
.color-trigger {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  transition: var(--transition-press);
  width: 100%;
}

.color-trigger:hover:not(:disabled) {
  border-color: var(--color-muted);
}

.color-trigger:not(:disabled):active {
  translate: 0 var(--press-offset);
}

.color-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.color-trigger > span {
  border: 1px solid #0002;
  border-radius: var(--radius-pill);
  height: 16px;
  width: 16px;
}

.color-grid {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(5, 1fr);
  padding: var(--space-3);
}

.color-swatch {
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  height: 24px;
  padding: 0;
  transition: var(--transition-press);
  width: 24px;
}

.color-swatch:hover {
  border-color: var(--color-muted);
}

.color-swatch:active {
  translate: 0 var(--press-offset);
}

.color-swatch.selected {
  border-color: var(--color-text);
}
</style>
