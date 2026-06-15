<script setup lang="ts">

import LnbFilterChips from "~/components/modals/LnbFilterChips.vue";
import LnbModalLabel from "~/components/modals/LnbModalLabel.vue";
import LnbModalInput from "~/components/modals/LnbModalInput.vue";

defineProps<{
  color: string,
  name: string,
  type: AttributeType,
  modelValue: any,
  listValues?: IssueAttributeListValueDto[]
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void,
  (e: 'enter'): void,
}>()

const updateValue = (value: any) => {
  emits("update:modelValue", value)
}
</script>

<template>
  <LnbModalLabel style="display: flex; align-items: center; gap: 8px;">
    <LnbSwitcherDot :color="color" />
    {{ name }}
  </LnbModalLabel>
  <LnbModalInput
      v-if="type == AttributeType.Text"
      placeholder="Enter Attribute Value..."
      @enter="emits('enter')"
      :modelValue="modelValue ?? ''"
      @update:modelValue="updateValue($event)"/>
  <LnbFilterChips
      v-if="type == AttributeType.List"
      :color="color"
      :options="listValues!"
      :model-value="Number(modelValue)"
      @update:modelValue="updateValue($event)"/>
</template>

<style scoped>

</style>