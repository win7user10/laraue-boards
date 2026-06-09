<script setup lang="ts">
  import LnbPopup from "~/components/popups/LnbPopup.vue";
  import {ref} from "vue";

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

  const epicFilterOpen = ref(false)
  const toggleEpicFilter = (id: number) => {
    const idx = props.modelValue.indexOf(id);
    if (idx === -1)
      updateValue([...props.modelValue, id])
    else
      updateValue(props.modelValue.filter(x => x !== id))
  }

  const btnRef = ref<HTMLDivElement>();
</script>

<template>
  <div class="filter" v-if="options.length > 0">
    <span class="filter-label" v-if="props.label">
      {{ props.label }}
    </span>

    <div class="filter-wrap" ref="btnRef">
      <!-- Pill -->
      <div class="filter-pill" :class="{'has-filter': currentOptions.length > 0}" @click="epicFilterOpen=!epicFilterOpen">

        <template v-if="currentOptions.length === 0">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
          {{ noFilterTitle }}
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.5"><path d="M4 6l4 4 4-4"/></svg>
        </template>

        <template v-else-if="currentOptions.length === 1">
          <span class="pill-dot" :style="`background:${currentOptions[0]!.color}`"></span>
          {{ currentOptions[0]!.name }}
          <span class="pill-x" @click.stop="updateValue([])">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </span>
        </template>

        <template v-else>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
          {{currentOptions.length}} selected
          <span class="pill-x" @click.stop="updateValue([])">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </span>
        </template>
      </div>

      <LnbPopup v-if="epicFilterOpen" :min-width="200" @close="epicFilterOpen = false" :parent-ref="btnRef">
        <div v-for="option in options" :key="option.id"
             class="filter-opt" :class="{selected: modelValue.includes(option.id)}"
             @click="toggleEpicFilter(option.id)">
          <span class="opt-dot" :style="`background:${option.color}`"></span>
          {{option.name}}
          <svg v-if="modelValue.includes(option.id)" class="opt-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 8l4 4 6-6"/></svg>
        </div>
        <div v-if="options.length>0" style="height:1px;background:var(--border);margin:4px 0"></div>
        <div v-if="options.length>0" class="filter-opt" @click="updateValue([])" style="color:var(--text3)">
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" class="opt-dot" style="width:8px;height:8px"><path d="M3 3l10 10M13 3L3 13"/></svg>
          {{ t('clearFilter') }}
        </div>
      </LnbPopup>
    </div>
  </div>
</template>

<style scoped>
.filter-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:16px;border:1px solid var(--border);background:var(--surface3);font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;user-select:none}
.filter-pill.has-filter{background:var(--accent-glow);border-color:var(--accent);color:var(--accent)}
.filter-pill .pill-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.filter-pill .pill-x{width:13px;height:13px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-left:1px;flex-shrink:0}
.filter-pill .pill-x svg{width:7px;height:7px;stroke:#fff;stroke-width:2.5}
.filter-opt{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);transition:background 0.12s;-webkit-tap-highlight-color:transparent}
.filter-opt:hover{background:var(--surface3)}
.filter-opt.selected{color:var(--text);background:var(--surface3)}
.filter-opt .opt-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.filter-opt .opt-check{width:14px;height:14px;margin-left:auto;flex-shrink:0;color:var(--accent)}
.filter-wrap{position:relative;display:inline-block}
.filter{display: flex; align-items: center; gap: 6px; margin-bottom: 8px;}
.filter-label{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0}
</style>