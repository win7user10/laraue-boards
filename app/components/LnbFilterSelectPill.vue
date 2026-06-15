<script setup lang="ts">
import LnbIcon from "~/components/icons/LnbIcon.vue";

const { t } = useI18n();

export interface Option{
  name: string;
  id: number;
  color?: string;
}

const props = defineProps<{
  options: readonly Option[];
  modelValue: Array<number>;
  noFilterTitle: string;
  label?: string;
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: Array<number>): void,
}>()

const updateValue = (value: Array<number>) => {
  emits('update:modelValue', value)
}

const currentOptions = computed(() => {
  return props.options.filter(option => props.modelValue.includes(option.id))
})

const toggleEpicFilter = (id: number) => {
  const idx = props.modelValue.indexOf(id);
  if (idx === -1)
    updateValue([...props.modelValue, id])
  else
    updateValue(props.modelValue.filter(x => x !== id))
}
</script>

<template>
  <LnbFilterPill :label="props.label" :has-filter="currentOptions.length > 0">
    <template v-if="currentOptions.length === 0">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
      {{ noFilterTitle }}
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.5"><path d="M4 6l4 4 4-4"/></svg>
    </template>

    <template v-else-if="currentOptions.length === 1">
      <span class="pill-dot" :style="`background:${currentOptions[0]!.color}`"></span>
      {{ currentOptions[0]!.name }}
      <span class="pill-x" @click.stop="updateValue([])">
        <LnbIcon icon="clear" size="mini" />
      </span>
    </template>

    <template v-else>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
      {{currentOptions.length}} selected
      <span class="pill-x" @click.stop="updateValue([])">
        <LnbIcon icon="clear" size="mini" />
      </span>
    </template>

    <template #popup>
      <div v-for="option in options" :key="option.id"
         class="filter-opt" :class="{selected: modelValue.includes(option.id)}"
         @click="toggleEpicFilter(option.id)">
        <span class="opt-dot" :style="`background:${option.color}`"></span>
        {{option.name}}
        <svg v-if="modelValue.includes(option.id)" class="opt-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 8l4 4 6-6"/></svg>
      </div>
      <div v-if="options.length>0" style="height:1px;background:var(--border);margin:4px 0"></div>
      <div v-if="options.length>0" class="filter-opt" @click="updateValue([])" style="color:var(--text3)">
        <LnbIcon icon="clear" size="mini" />
        {{ t('clearFilter') }}
      </div>
    </template>
  </LnbFilterPill>

</template>

<style scoped>
.pill-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.pill-x{display:flex;align-items:center;justify-content:center;margin-left:1px;flex-shrink:0}
.filter-opt{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);transition:background 0.12s;-webkit-tap-highlight-color:transparent}
.filter-opt:hover{background:var(--surface3)}
.filter-opt.selected{color:var(--text);background:var(--surface3)}
.filter-opt .opt-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.filter-opt .opt-check{width:14px;height:14px;margin-left:auto;flex-shrink:0;color:var(--accent)}
</style>