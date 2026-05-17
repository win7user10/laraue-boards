<script setup lang="ts">
  defineProps<{
    disabled?: boolean;
    name: string;
    type: "ghost" | "primary" | "warn";
  }>()
  defineEmits<{
    (e: 'click'): void,
  }>()
</script>

<template>
  <button
    :class="['btn', disabled ? 'disabled' : '', type]"
    @click="$emit('click')">
      {{ name }}
  </button>
</template>

<style scoped>
.btn {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  letter-spacing: 0.3px;
}
.btn.disabled { cursor: not-allowed; }
.btn.primary { background: var(--accent); color: white; }
.btn.primary:hover { background: var(--accent2); }
.btn.primary.disabled { background: var(--surface2); color: var(--text2); }
.btn.ghost { background: var(--surface3); color: var(--text2); border: 1px solid var(--border); }
.btn.ghost:hover { color: var(--text); border-color: var(--border2); }
.btn.ghost.disabled, .btn-ghost.disabled:hover { background: var(--surface2); border: none; color: var(--text2); }
.btn.warn { background: var(--orange); border-color: var(--orange); color: white; }
</style>