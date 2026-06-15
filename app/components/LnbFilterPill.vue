<script setup lang="ts">
  import LnbPopup from "~/components/popups/LnbPopup.vue";
  import {ref} from "vue";
  import LnbFilterLabel from "~/components/LnbFilterLabel.vue";
  import LnbFilter from "~/components/LnbFilter.vue";

  const epicFilterOpen = ref(false)

  const btnRef = ref<HTMLDivElement>();

  defineProps<{
    hasFilter: boolean,
    label?: string
  }>()
</script>

<template>
  <LnbFilter>
    <LnbFilterLabel v-if="label">
      {{ label }}
    </LnbFilterLabel>

    <div class="filter-wrap" ref="btnRef">
      <div class="filter-pill" :class="{ 'has-filter': hasFilter }" @click="epicFilterOpen=!epicFilterOpen">
        <slot></slot>
      </div>
      <LnbPopup v-if="epicFilterOpen" :min-width="200" @close="epicFilterOpen = false" :parent-ref="btnRef">
        <slot :close="() => epicFilterOpen = false" name="popup"></slot>
      </LnbPopup>
    </div>
  </LnbFilter>
</template>

<style scoped>
.filter-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:16px;border:1px solid var(--border);background:var(--surface3);font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent;user-select:none}
.filter-pill.has-filter{background:var(--accent-glow);border-color:var(--accent);color:var(--accent)}
.filter-pill .pill-x svg{width:7px;height:7px;stroke:#fff;stroke-width:2.5}
.filter-wrap{position:relative;display:inline-block}
</style>