<template>
  <section class="column">
    <div class="column-head">
      <span>
        <i :style="{ background: viewModel.color || '#6e7681' }" />
        {{ viewModel.title }}
      </span>
      <span>{{ viewModel.issueCount }}</span>
    </div>
    <div
      ref="element"
      class="column-issues"
      :class="{
        'column-issues--enabled': canMoveIssues,
        'column-issues--over': isDropTarget,
      }">
      <p
        v-if="viewModel.issues.length === 0"
        class="empty">
        No issues
      </p>
      <IssueCard
        v-for="issue in viewModel.issues"
        :key="issue.issueKey"
        :disabled="!canMoveIssues || movingIssueKeys.has(issue.issueKey)"
        :moving="movingIssueKeys.has(issue.issueKey)"
        :view-model="issue"
        @move-to-backlog="emit('moveToBacklog', issue.issueKey)"
        @open-issue="emit('openIssue', $event)" />
      <div
        v-if="viewModel.hasNext"
        ref="sentinel"
        class="column-sentinel">
        <Loader
          v-if="loadingMore"
          class="column-sentinel-loader" />
        <button
          v-else-if="loadMoreError"
          class="column-sentinel-retry"
          type="button"
          @click="emit('loadMore')">
          {{ loadMoreError }}
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import type { IssueCardViewModel } from './components/IssueCard.vue'

export type BoardColumnViewModel = {
  color: null | string
  hasNext: boolean
  id: string
  issueCount: number
  issues: IssueCardViewModel[]
  title: string
}
</script>

<script setup lang="ts">
import { useDroppable } from '@dnd-kit/vue'
import { Loader } from 'lucide-vue-next'

import IssueCard from './components/IssueCard.vue'

const props = defineProps<{
  canMoveIssues: boolean
  loadingMore: boolean
  loadMoreError: null | string
  movingIssueKeys: Set<string>
  viewModel: BoardColumnViewModel
}>()
const emit = defineEmits<{
  loadMore: []
  moveToBacklog: [issueKey: string]
  openIssue: [issueKey: string]
}>()

const element = ref<HTMLElement>()
const sentinel = ref<HTMLElement>()

const { isDropTarget } = useDroppable({
  accept: 'item',
  disabled: computed(() => !props.canMoveIssues),
  element,
  id: computed(() => props.viewModel.id),
})

let observer: IntersectionObserver | undefined

watch([element, sentinel], ([rootEl, sentinelEl]) => {
  observer?.disconnect()
  observer = undefined
  if (!rootEl || !sentinelEl) {
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        emit('loadMore')
      }
    },
    { root: rootEl, rootMargin: '150px' },
  )
  observer.observe(sentinelEl)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.column {
  background: var(--color-soft);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: var(--space-3);
  width: 100%;
}

.column-issues {
  flex: 1;
  min-height: 200px;
  outline: 2px dashed transparent;
  outline-offset: var(--space-1);
  overflow-y: auto;
  transition: outline-color var(--duration-fast) var(--ease-standard);
}

.column-issues--enabled :deep(.task) {
  cursor: grab;
}

.column-issues--over {
  border-radius: var(--radius-card);
  outline-color: var(--color-accent);
}

.column-sentinel {
  display: flex;
  justify-content: center;
  padding: var(--space-2) 0;
}

.column-sentinel-loader {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 16px;
  width: 16px;
}

.column-sentinel-retry {
  background: none;
  border: none;
  color: var(--color-danger, #d1242f);
  cursor: pointer;
  font-size: var(--font-size-small);
  opacity: 1;
  text-decoration: underline;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.column-sentinel-retry:active {
  opacity: 0.6;
}

.column-head {
  align-items: center;
  display: flex;
  flex: none;
  font-weight: var(--font-weight-bold);
  justify-content: space-between;
  padding: 0 var(--space-1) var(--space-3);
}

.column-head > span:first-child {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.column-head i {
  border-radius: var(--radius-pill);
  flex: none;
  height: 8px;
  width: 8px;
}

.column-head > span:last-child {
  background: var(--color-surface);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  font-size: var(--font-size-small);
  padding: 2px var(--space-2);
}

@media (max-width: 760px) {
  .column {
    scroll-snap-align: start;
  }
}
</style>
