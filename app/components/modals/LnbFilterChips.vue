<script setup lang="ts">
  import LnbFilterChip from "~/components/modals/LnbFilterChip.vue";

  export interface Option {
    name: string;
    id: number;
  }

  const props = defineProps<{
    options: readonly Option[];
    modelValue?: number | string;
    color: string;
  }>()

  const emits = defineEmits<{
    (e: 'update:modelValue', value: number | string | undefined): void,
  }>()

  const updateValue = (option: Option) => {
    emits('update:modelValue', props.modelValue === option.id ? undefined : option.id);
  }
</script>

<template>
  <div class="filter-chips">
    <LnbFilterChip
      v-for="opt in options"
      :key="opt.id"
      :active="modelValue === opt.id"
      :color="color"
      :name="opt.name"
      @click="updateValue(opt)" />
  </div>
</template>

<style scoped>
.filter-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}
</style>