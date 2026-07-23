<template>
  <template
    v-for="attribute in attributes"
    :key="attribute.id">
    <label :for="`${idPrefix}-${attribute.id}`">
      {{ attribute.name }}
    </label>
    <div class="attribute-field">
      <span
        class="attribute-dot"
        :style="{ background: attribute.color }" />
      <input
        v-if="attribute.type === 'text'"
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        type="text"
        :value="modelValue[attribute.id] ?? ''"
        @input="update(attribute.id, ($event.target as HTMLInputElement).value)" />
      <select
        v-else
        :id="`${idPrefix}-${attribute.id}`"
        :disabled="disabled"
        :value="modelValue[attribute.id] ?? ''"
        @change="update(attribute.id, ($event.target as HTMLSelectElement).value)">
        <option value="">None</option>
        <option
          v-for="option in attribute.options"
          :key="option.value"
          :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { IssueAttributeField } from './IssueAttributeFields.types'

const props = withDefaults(
  defineProps<{
    attributes: IssueAttributeField[]
    disabled?: boolean
    modelValue: Record<string, string>
  }>(),
  {
    disabled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()
const idPrefix = useId()

const update = (id: string, value: string) => {
  const next = { ...props.modelValue }
  if (value) {
    next[id] = value
  } else {
    delete next[id]
  }
  emit('update:modelValue', next)
}
</script>

<style scoped>
.attribute-field {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr);
}

.attribute-dot {
  border-radius: var(--radius-pill);
  height: 8px;
  width: 8px;
}
</style>
