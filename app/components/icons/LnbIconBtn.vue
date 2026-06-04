<script setup lang="ts">
  import LnbIcon from "~/components/icons/LnbIcon.vue";

  const props = defineProps({
    title: {type: String, required: true},
    type: {type: String as PropType<'primary' | 'danger'>, required: false, default: 'primary'},
    btnSize: {type: String as PropType<'mini' | 'small' | 'medium'>, required: true },
    iconSize: {type: String as PropType<'mini' | 'small' | 'medium'>, required: true },
    icon: {type: String as PropType<'clear' | 'delete' | 'edit' | 'move' | 'search' | 'logout' | 'add'>, required: true },
    bordered: {type: Boolean, default: false},
  })

  const pxSize = computed(() => {
    switch (props.btnSize) {
      case 'mini':
        return 22
      case 'small':
        return 26
      case 'medium':
        return 28
      default:
        throw new Error(`Unknown size: ${props.btnSize}`)
    }
  })
</script>

<template>
  <div
    :class="['icon-btn', type, { bordered: bordered }]"
    :style="{
      width: pxSize + 'px',
      height: pxSize + 'px',
    }"
    :title="title">
    <LnbIcon :size="iconSize" :icon="icon" :title="title" />
  </div>
</template>

<style scoped>
.icon-btn {
  color: var(--text2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.icon-btn.bordered{
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface3);
}
.icon-btn:hover, .icon-btn.active {
  color: var(--accent);
}
.icon-btn.bordered:hover, .icon-btn.bordered.active {
  background: var(--accent-glow);
  border-color: var(--accent);
}
.icon-btn.danger:hover {
  color: var(--red);
}
.icon-btn.bordered.danger:hover {
  background: var(--red-glow);
  border-color: var(--red);
}
</style>