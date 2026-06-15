<script setup lang="ts">
import LnbModalListOpts from "~/components/modals/LnbModalListOpts.vue";
import LnbModalListOpt from "~/components/modals/LnbModalListOpt.vue";

export interface Option{
  name: string;
  id: number;
  color?: string;
}

const props = defineProps<{
  options: readonly Option[];
  modelValue: number;
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void,
}>()

const selectOption = (value: number) => {
  emit("update:modelValue", value)
}
</script>

<template>
  <LnbModalListOpts>
    <LnbModalListOpt
      v-for="option in options"
      :key="option.id"
      :class="{ selected: props.modelValue === option.id }"
      :name="option.name"
      :color="option.color"
      @click="selectOption(option.id)"/>
  </LnbModalListOpts>
</template>

<style scoped>
.selected { border-color:var(--accent);background:var(--accent-glow) }
</style>