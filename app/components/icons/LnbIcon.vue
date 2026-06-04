<script setup lang="ts">
const props = defineProps({
  size: {type: String as PropType<'mini' | 'small' | 'medium'>, required: true },
  icon: {type: String as PropType<'clear' | 'delete' | 'edit' | 'move' | 'search' | 'logout' | 'add'>, required: true },
})
const size = computed(() => {
  switch (props.size) {
    case 'mini':
      return 12
    case 'small':
      return 13
    case 'medium':
      return 14
    default:
      throw new Error(`Unknown size: ${props.size}`)
  }
})
</script>

<template>
  <svg
    :style="{
      width: size + 'px',
      height: size + 'px',
    }"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8">
    <template v-if="icon === 'clear'">
      <path d="M3 3l10 10M13 3L3 13"/>
    </template>
    <template v-if="icon === 'delete'">
      <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5l.5-9"></path>
    </template>
    <template v-if="icon === 'edit'">
      <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z"></path>
    </template>
    <template v-if="icon === 'move'">
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </template>
    <template v-if="icon === 'search'">
      <circle cx="6.5" cy="6.5" r="4"/>
      <path d="M10 10l3 3"/>
    </template>
    <template v-if="icon === 'logout'">
      <path d="M6 3H3v10h3M10 5l3 3-3 3M13 8H6" />
    </template>
    <template v-if="icon === 'add'">
      <path d="M8 3v10M3 8h10" />
    </template>
  </svg>
</template>

<style scoped>
</style>