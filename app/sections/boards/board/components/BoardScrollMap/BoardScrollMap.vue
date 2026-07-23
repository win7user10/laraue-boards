<template>
  <div
    v-if="scrollMax > 0"
    class="board-scroll-map">
    <div
      aria-hidden="true"
      class="columns"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }">
      <span
        v-for="column in columnCount"
        :key="column" />
    </div>
    <input
      :aria-controls="target?.id || undefined"
      aria-label="Scroll board horizontally"
      :max="scrollMax"
      min="0"
      :style="{ '--scroll-map-thumb-width': thumbWidth }"
      type="range"
      :value="scrollValue"
      @input="handleInput" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  columnCount: number
  target: HTMLElement | null
}>()

const scrollMax = ref(0)
const scrollValue = ref(0)
const thumbWidth = ref('100%')

let observedTarget: HTMLElement | null = null
let resizeObserver: ResizeObserver | undefined
let stopWatchingColumnCount: (() => void) | undefined
let stopWatchingTarget: (() => void) | undefined

function sync() {
  if (!observedTarget) {
    return
  }

  const { clientWidth, scrollLeft, scrollWidth } = observedTarget
  const visibleRatio = clientWidth / Math.max(1, scrollWidth)

  scrollMax.value = Math.max(0, scrollWidth - clientWidth)
  scrollValue.value = scrollLeft
  thumbWidth.value = `${visibleRatio * 100}%`
}

function observeTarget(target: HTMLElement | null) {
  observedTarget?.removeEventListener('scroll', sync)
  resizeObserver?.disconnect()
  observedTarget = target

  if (!target) {
    scrollMax.value = 0
    return
  }

  target.addEventListener('scroll', sync, { passive: true })
  resizeObserver?.observe(target)
  sync()
}

function handleInput(event: Event) {
  if (observedTarget) {
    observedTarget.scrollLeft = Number((event.target as HTMLInputElement).value)
  }
}

onMounted(() => {
  resizeObserver = new ResizeObserver(sync)
  stopWatchingTarget = watch(() => props.target, observeTarget, {
    immediate: true,
  })
  stopWatchingColumnCount = watch(
    () => props.columnCount,
    () => nextTick(sync),
  )
})

onBeforeUnmount(() => {
  stopWatchingColumnCount?.()
  stopWatchingTarget?.()
  observedTarget?.removeEventListener('scroll', sync)
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.board-scroll-map {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  bottom: var(--space-6);
  height: 48px;
  padding: var(--space-1);
  position: absolute;
  right: var(--space-3);
  width: 104px;
  z-index: 2;
  --scroll-map-thumb-width: 0;
}

.columns {
  display: grid;
  gap: 2px;
  height: 100%;
}

.columns span {
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: 2px;
}

input {
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  box-shadow: none;
  cursor: ew-resize;
  height: auto;
  inset: calc(var(--space-1) / 2);
  margin: 0;
  outline: none;
  padding: 0;
  position: absolute;
  width: auto;
}

input::-webkit-slider-runnable-track {
  background: transparent;
  height: 100%;
}

input::-webkit-slider-thumb {
  appearance: none;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 2px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  border-radius: var(--radius-small);
  height: 100%;
  width: max(18px, var(--scroll-map-thumb-width));
}

input::-moz-range-track {
  background: transparent;
  height: 100%;
}

input::-moz-range-thumb {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  border-radius: var(--radius-small);
  height: 100%;
  width: max(18px, var(--scroll-map-thumb-width));
}
</style>
