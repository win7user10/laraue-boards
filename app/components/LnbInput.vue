<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, required: true },
  placeholder: { type: String },
  disabled: { type: Boolean, default: false },
  focus: { type: Boolean, required: false },
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void,
  (e: 'enter'): void,
  (e: 'escape'): void,
}>()

const input = ref(null);
onMounted(() => {
  if (props.focus)
    nextTick(() => (input.value as any)?.focus());
})
watch(() => props.modelValue, (): void => {
  if (props.focus)
    (input.value as any)?.focus();
})
</script>

<template>
  <input
      ref="input"
      :value="modelValue"
      @input="emits('update:modelValue', ($event.target as any).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      @keyup.enter="emits('enter')"
      @keyup.escape="emits('escape')"/>
</template>

<style scoped>

</style>