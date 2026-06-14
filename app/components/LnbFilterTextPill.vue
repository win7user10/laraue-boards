<script setup lang="ts">

import LnbIcon from "~/components/icons/LnbIcon.vue";

const props = defineProps<{
  modelValue: string;
  label?: string;
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void,
}>()

const updateValue = (value: string) => {
  emits('update:modelValue', value)
}
</script>

<template>
  <LnbFilterPill :label="label" :has-filter="!!modelValue">
    <LnbIcon icon="search" size="mini" v-if="!modelValue" />
    {{ modelValue }}
    <span class="pill-x" @click.stop="updateValue('')" v-if="modelValue">
      <LnbIcon icon="clear" size="mini" />
    </span>

    <template #popup="{close}">
      <LnbInput
        class="input"
        focus
        :model-value="modelValue"
        @update:modelValue="updateValue"
        @enter="close"
        placeholder="Search" />
    </template>
  </LnbFilterPill>
</template>

<style scoped>
.pill-x{display:flex;align-items:center;justify-content:center;}
.input{
  width: 100%;
  background: var(--surface3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 5px 6px;
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}
</style>