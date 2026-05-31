<script setup lang="ts">

</script>

<template>
  <div class="view">
    <slot></slot>
  </div>
</template>

<style scoped>
.view {
  flex: 1;
  overflow-y: auto;
  padding: 12px calc(max(12px, var(--safe-right))) 12px calc(max(12px, var(--safe-left)));
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* ── SCROLLBAR ── */
.view { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.view::-webkit-scrollbar { width: 4px; }
.view::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

</style>