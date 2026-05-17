<script setup lang="ts">
  import LnbSwitcherDot from "~/components/LnbSwitcherDot.vue";

  defineProps<{
    color: string,
    name: string,
  }>()
</script>

<template>
  <div class="space-popup-item">
    <LnbSwitcherDot :color="color" />
    <div class="space-popup-item-name">{{name}}</div>
  </div>
</template>

<style scoped>
.space-popup-item{display: flex;gap:8px;align-items: center;height: 26px;}
.space-popup-item-name{font-size:12px;font-weight:600;color:var(--text);flex:1}
</style>