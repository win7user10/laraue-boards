<script setup lang="ts">
  import LnbSwitcherDot from "~/components/LnbSwitcherDot.vue";

  defineProps<{
    name: string,
    sub?: string,
    color?: string,
  }>()
</script>

<template>
  <div class="list-opt">
    <LnbSwitcherDot v-if="color" :color="color"/>
    <slot name="avatar"></slot>
    <div class="list-opt-info">
      <div class="list-opt-name">{{ name }}</div>
      <div class="list-opt-sub">{{ sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.list-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;background:var(--surface3);transition:all 0.15s;-webkit-tap-highlight-color:transparent}
.list-opt:hover{border-color:var(--accent);background:var(--accent-glow)}
.list-opt-info{flex:1;min-width:0}
.list-opt-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.list-opt-sub{font-size:11px;color:var(--text3)}
</style>