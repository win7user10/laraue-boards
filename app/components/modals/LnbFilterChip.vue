<script setup lang="ts">
  defineProps<{
    active: boolean,
    color: string,
    name: string,
  }>()
</script>

<template>
  <div
     class="filter-chip"
     :class="{active: active}"
     :style="active ? `background:${color}22;border-color:${color};color:${color}` : ``">
    {{name}}
  </div>
</template>

<style scoped>
.filter-chip{padding:4px 10px;border-radius:14px;border:1px solid var(--border);background:var(--surface3);font-size:11px;font-weight:600;color:var(--text2);cursor:pointer;white-space:nowrap;transition:all 0.15s;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.filter-chip.active{background:var(--accent-glow);border-color:var(--accent);color:var(--accent)}
</style>