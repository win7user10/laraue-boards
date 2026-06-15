<script setup lang="ts">

  import { AttributeType } from "~/composables/organizationsApi";
  import LnbFilterSelectPill from "~/components/LnbFilterSelectPill.vue";
  import LnbFilterTextPill from "~/components/LnbFilterTextPill.vue";

  const { getAttributes } = useOrganizationsApi()
  const filters = await getAttributes()

  const { t } = useI18n()
  const props = defineProps<{
    modelValue: { [key: string]: any }
  }>()

  const emits = defineEmits<{
    (e: 'update:modelValue', value: { [key: string]: any }): void,
  }>()

  const filtersState = ref({} as { [key: string]: any })
  onMounted(() => {
    filtersState.value = props.modelValue
  })

  const updateValue = (id: number, value: any) => {
    filtersState.value[id] = value
    emits("update:modelValue", filtersState.value)
  }
</script>

<template>
  <template v-for="filter in filters">
    <template v-if="filter.type === AttributeType.List">
      <LnbFilterSelectPill
        :options="filter.listValues!"
        :label="filter.name"
        :no-filter-title="t('all')"
        :modelValue="modelValue[filter.id] ?? []"
        @update:modelValue="updateValue(filter.id, $event)"/>
    </template>
    <template v-if="filter.type === AttributeType.Text">
      <LnbFilterTextPill
        :label="filter.name"
        :modelValue="modelValue[filter.id] ?? ''"
        @update:modelValue="updateValue(filter.id, $event)"/>
    </template>
  </template>
</template>

<style scoped>

</style>