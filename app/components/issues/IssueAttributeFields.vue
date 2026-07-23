<template>
  <template
    v-for="attribute in attributes"
    :key="attribute.id">
    <label :for="`${idPrefix}-${attribute.id}`">
      <span
        class="attribute-dot"
        :style="{ background: attribute.color }" />
      {{ attribute.name }}
    </label>
    <input
      v-if="attribute.type === 'text'"
      :id="`${idPrefix}-${attribute.id}`"
      type="text"
      :value="modelValue[attribute.id] ?? ''"
      @input="update(attribute.id, ($event.target as HTMLInputElement).value)" />
    <select
      v-else
      :id="`${idPrefix}-${attribute.id}`"
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
  </template>
</template>

<script lang="ts">
type IssueAttributeViewModel =
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }
  | {
      color: string
      id: string
      name: string
      type: 'text'
    }

type IssueAttributeFieldsProps = {
  attributes: IssueAttributeViewModel[]
  modelValue: Record<string, string>
}
</script>

<script setup lang="ts">
const props = defineProps<IssueAttributeFieldsProps>()
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()
const idPrefix = useId()
function update(id: string, value: string) {
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
.attribute-dot {
  border-radius: var(--radius-pill);
  display: inline-block;
  height: 8px;
  margin-right: var(--space-1);
  width: 8px;
}
</style>
