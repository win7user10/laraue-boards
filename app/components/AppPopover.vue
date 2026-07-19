<template>
  <div
    ref="root"
    class="app-popover"
    @focusout="closeOnFocusOut"
    @keydown.esc="closeOnEscape">
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle" />
    <div
      v-if="open"
      ref="content"
      class="app-popover-content popover"
      :style="{ translate: `${horizontalShift}px 0` }">
      <slot :close="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ viewportPadding?: number }>(), {
  viewportPadding: 16,
})
const root = ref<HTMLElement>()
const content = ref<HTMLElement>()
const open = ref(false)
const horizontalShift = ref(0)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    void position()
  }
}

async function position() {
  if (!open.value) {
    return
  }
  horizontalShift.value = 0
  await nextTick()
  const rect = content.value?.getBoundingClientRect()
  if (!rect) {
    return
  }
  horizontalShift.value = Math.min(
    0,
    window.innerWidth - props.viewportPadding - rect.right,
  )
  horizontalShift.value += Math.max(
    0,
    props.viewportPadding - rect.left - horizontalShift.value,
  )
}

function closeOnOutsideClick(event: MouseEvent) {
  if (
    event.button === 0 &&
    root.value &&
    !root.value.contains(event.target as Node)
  ) {
    close()
  }
}

function closeOnFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (next && !root.value?.contains(next)) {
    close()
  }
}

function closeOnEscape() {
  if (!open.value) {
    return
  }
  close()
  root.value?.querySelector<HTMLElement>('button, summary')?.focus()
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  window.addEventListener('resize', position)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  window.removeEventListener('resize', position)
})
</script>

<style scoped>
.app-popover {
  position: relative;
  width: fit-content;
}

.app-popover-content {
  left: 0;
  margin-top: var(--space-2);
  position: absolute;
  top: 100%;
  width: var(--app-popover-width, max-content);
}
</style>
