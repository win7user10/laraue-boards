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
      :style="{
        left: `${position.left}px`,
        maxHeight: `calc(100dvh - ${viewportPadding * 2}px)`,
        maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
        top: `${position.top}px`,
        visibility: positioned ? 'visible' : 'hidden',
      }">
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
const positioned = ref(false)
const position = reactive({ left: 0, top: 0 })
let positionFrame: number | undefined

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function updatePosition() {
  if (!open.value || !root.value || !content.value) {
    return
  }

  const triggerRect = root.value.getBoundingClientRect()
  const contentRect = content.value.getBoundingClientRect()
  const gap =
    Number.parseFloat(
      getComputedStyle(root.value).getPropertyValue('--space-2'),
    ) || 8
  const maxLeft = Math.max(
    props.viewportPadding,
    window.innerWidth - props.viewportPadding - contentRect.width,
  )
  const below = triggerRect.bottom + gap
  const above = triggerRect.top - gap - contentRect.height

  const left = Math.min(
    Math.max(triggerRect.left, props.viewportPadding),
    maxLeft,
  )
  const top =
    below + contentRect.height <= window.innerHeight - props.viewportPadding
      ? below
      : Math.max(props.viewportPadding, above)

  if (position.left !== left || position.top !== top) {
    position.left = left
    position.top = top
  }
  positioned.value = true
  positionFrame = requestAnimationFrame(updatePosition)
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
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  cancelAnimationFrame(positionFrame ?? 0)
})

watch(
  open,
  async (isOpen) => {
    cancelAnimationFrame(positionFrame ?? 0)
    positioned.value = false
    if (isOpen) {
      await nextTick()
      updatePosition()
    }
  },
  { flush: 'post' },
)
</script>

<style scoped>
.app-popover {
  position: relative;
  width: fit-content;
}

.app-popover-content {
  overflow: auto;
  position: fixed;
  width: var(--app-popover-width, max-content);
}
</style>
